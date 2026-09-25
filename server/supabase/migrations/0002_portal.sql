-- User portal: profiles, model/provider settings, bring-your-own API keys, and the
-- free first-generation quota. Run after 0001_init.sql.

create table if not exists public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null default '' check (char_length(display_name) <= 80),
  bio          text not null default '' check (char_length(bio) <= 160),
  avatar_url   text not null default '',
  website      text not null default '',
  location     text not null default '' check (char_length(location) <= 80),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  provider              text,
  model                 text,
  free_generations_used int not null default 0,
  updated_at            timestamptz not null default now()
);

-- Keys are encrypted by the backend (Fernet) before they get here.
create table if not exists public.user_api_keys (
  user_id       uuid not null references auth.users(id) on delete cascade,
  provider      text not null,
  encrypted_key text not null,
  last4         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, provider)
);

-- null until the project's first generation claims a free (platform key) slot.
alter table public.projects add column if not exists platform_generation text
  check (platform_generation in ('reserved', 'done'));

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists user_settings_touch on public.user_settings;
create trigger user_settings_touch before update on public.user_settings
  for each row execute function public.touch_updated_at();

drop trigger if exists user_api_keys_touch on public.user_api_keys;
create trigger user_api_keys_touch before update on public.user_api_keys
  for each row execute function public.touch_updated_at();

-- Claim a free first generation for a project. Retrying a project that already
-- holds a reservation doesn't count again. Returns false once the quota is spent.
create or replace function public.claim_free_generation(p_user uuid, p_project uuid, p_limit int)
returns boolean
language plpgsql as $$
declare
  status text;
  claimed int;
begin
  select platform_generation into status from public.projects
    where id = p_project and user_id = p_user for update;
  if not found or status = 'done' then
    return false;
  end if;
  if status = 'reserved' then
    return true;
  end if;

  insert into public.user_settings (user_id) values (p_user) on conflict (user_id) do nothing;
  update public.user_settings set free_generations_used = free_generations_used + 1
    where user_id = p_user and free_generations_used < p_limit;
  get diagnostics claimed = row_count;
  if claimed = 0 then
    return false;
  end if;

  update public.projects set platform_generation = 'reserved' where id = p_project;
  return true;
end $$;

-- The backend uses the service role. Profiles and settings are readable by their
-- owner with the anon key; API keys have no policy, so only the service role sees them.
alter table public.profiles      enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_api_keys enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "own settings" on public.user_settings;
create policy "own settings" on public.user_settings
  for select using (auth.uid() = user_id);

revoke execute on function public.claim_free_generation(uuid, uuid, int) from public, anon, authenticated;
