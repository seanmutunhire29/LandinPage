-- Admin: runtime app settings, per-user limits and suspension, token usage
-- tracking, audit log, and the RPCs behind the admin dashboard. Run after 0002_portal.sql.
--
-- Admins are users with {"role": "admin"} in auth.users.raw_app_meta_data. Bootstrap one with:
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--     where email = 'you@example.com';

-- Platform-wide settings edited from the admin dashboard. Keys missing here fall
-- back to the server's env defaults.
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- Per-user overrides (null = use the global setting) and suspension.
alter table public.user_settings add column if not exists free_generations_limit int check (free_generations_limit >= 0);
alter table public.user_settings add column if not exists token_budget bigint check (token_budget >= 0);
alter table public.user_settings add column if not exists suspended_at timestamptz;
alter table public.user_settings add column if not exists suspended_reason text not null default '';

-- One row per model call.
create table if not exists public.usage_events (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  project_id        uuid references public.projects(id) on delete set null,
  source            text not null check (source in ('platform', 'user')),
  provider          text not null,
  model             text not null,
  prompt_tokens     int not null default 0,
  completion_tokens int not null default 0,
  cost              numeric,
  created_at        timestamptz not null default now()
);
create index if not exists usage_events_user_created on public.usage_events (user_id, created_at);
create index if not exists usage_events_created on public.usage_events (created_at);

create table if not exists public.admin_audit_log (
  id             bigint generated always as identity primary key,
  admin_id       uuid references auth.users(id) on delete set null,
  admin_email    text not null default '',
  action         text not null,
  target_user_id uuid,
  details        jsonb not null default '{}',
  created_at     timestamptz not null default now()
);
create index if not exists admin_audit_log_created on public.admin_audit_log (created_at desc);

-- Service role only: RLS on, no policies.
alter table public.app_settings    enable row level security;
alter table public.usage_events    enable row level security;
alter table public.admin_audit_log enable row level security;

create or replace function public.platform_tokens_used(p_user uuid)
returns bigint
language sql stable as $$
  select coalesce(sum(prompt_tokens + completion_tokens), 0)::bigint
  from public.usage_events where user_id = p_user and source = 'platform';
$$;

-- Everyone who has signed up, newest first, with their settings and usage.
create or replace function public.admin_list_users(p_search text, p_limit int, p_offset int)
returns table (
  id                     uuid,
  email                  text,
  created_at             timestamptz,
  last_sign_in_at        timestamptz,
  provider               text,
  is_admin               boolean,
  banned_until           timestamptz,
  username               text,
  display_name           text,
  avatar_url             text,
  projects               bigint,
  free_generations_used  int,
  free_generations_limit int,
  token_budget           bigint,
  platform_tokens        bigint,
  suspended_at           timestamptz,
  suspended_reason       text,
  total_count            bigint
)
language sql stable security definer set search_path = public, auth as $$
  select
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    u.raw_app_meta_data->>'provider',
    coalesce(u.raw_app_meta_data->>'role', '') = 'admin',
    u.banned_until,
    p.username,
    p.display_name,
    p.avatar_url,
    (select count(*) from public.projects pr where pr.user_id = u.id),
    coalesce(s.free_generations_used, 0),
    s.free_generations_limit,
    s.token_budget,
    public.platform_tokens_used(u.id),
    s.suspended_at,
    coalesce(s.suspended_reason, ''),
    count(*) over ()
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  left join public.user_settings s on s.user_id = u.id
  where p_search is null or p_search = ''
     or u.email ilike '%' || p_search || '%'
     or p.username ilike '%' || p_search || '%'
     or p.display_name ilike '%' || p_search || '%'
  order by u.created_at desc
  limit p_limit offset p_offset;
$$;

-- Dashboard numbers for the last p_days days.
create or replace function public.admin_stats(p_days int)
returns jsonb
language sql stable security definer set search_path = public, auth as $$
  with days as (
    select generate_series((current_date - (p_days - 1)), current_date, interval '1 day')::date as day
  ),
  since as (select (current_date - (p_days - 1))::timestamptz as t)
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'users',           (select count(*) from auth.users),
      'new_users',       (select count(*) from auth.users, since where created_at >= since.t),
      'projects',        (select count(*) from public.projects),
      'calls',           (select count(*) from public.usage_events, since where created_at >= since.t),
      'platform_tokens', (select coalesce(sum(prompt_tokens + completion_tokens), 0) from public.usage_events, since
                            where source = 'platform' and created_at >= since.t),
      'user_tokens',     (select coalesce(sum(prompt_tokens + completion_tokens), 0) from public.usage_events, since
                            where source = 'user' and created_at >= since.t),
      'platform_cost',   (select coalesce(sum(cost), 0) from public.usage_events, since
                            where source = 'platform' and created_at >= since.t),
      'suspended',       (select count(*) from public.user_settings where suspended_at is not null)
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', d.day,
        'signups', (select count(*) from auth.users u where u.created_at::date = d.day),
        'projects', (select count(*) from public.projects pr where pr.created_at::date = d.day),
        'calls', (select count(*) from public.usage_events e where e.created_at::date = d.day),
        'platform_tokens', (select coalesce(sum(prompt_tokens + completion_tokens), 0) from public.usage_events e
                              where e.created_at::date = d.day and e.source = 'platform'),
        'user_tokens', (select coalesce(sum(prompt_tokens + completion_tokens), 0) from public.usage_events e
                          where e.created_at::date = d.day and e.source = 'user')
      ) order by d.day), '[]'::jsonb)
      from days d
    ),
    'models', (
      select coalesce(jsonb_agg(m order by m.tokens desc), '[]'::jsonb) from (
        select e.provider, e.model, e.source, count(*) as calls,
               sum(e.prompt_tokens + e.completion_tokens) as tokens, coalesce(sum(e.cost), 0) as cost
        from public.usage_events e, since where e.created_at >= since.t
        group by e.provider, e.model, e.source
      ) m
    ),
    'top_users', (
      select coalesce(jsonb_agg(t order by t.tokens desc), '[]'::jsonb) from (
        select e.user_id, u.email::text as email, count(*) as calls,
               sum(e.prompt_tokens + e.completion_tokens) as tokens, coalesce(sum(e.cost), 0) as cost
        from public.usage_events e join auth.users u on u.id = e.user_id, since
        where e.source = 'platform' and e.created_at >= since.t
        group by e.user_id, u.email
        order by tokens desc
        limit 10
      ) t
    )
  );
$$;

revoke execute on function public.platform_tokens_used(uuid) from public, anon, authenticated;
revoke execute on function public.admin_list_users(text, int, int) from public, anon, authenticated;
revoke execute on function public.admin_stats(int) from public, anon, authenticated;
