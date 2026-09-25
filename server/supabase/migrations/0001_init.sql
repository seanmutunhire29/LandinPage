-- LandInPage schema. Run in the Supabase SQL editor (or `supabase db push`).
-- Users live in auth.users (managed by Supabase Auth).

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  design_spec jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists projects_user_id_idx on public.projects(user_id, updated_at desc);

create table if not exists public.project_files (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  file_path   text not null,
  content     text not null default '',
  updated_at  timestamptz not null default now(),
  unique (project_id, file_path)
);

-- bigint identity id gives a strict insertion order within a project.
create table if not exists public.chat_messages (
  id           bigint generated always as identity primary key,
  project_id   uuid not null references public.projects(id) on delete cascade,
  role         text not null check (role in ('user', 'assistant', 'tool')),
  content      text not null default '',
  tool_calls   jsonb,  -- assistant messages that requested tools
  tool_call_id text,   -- tool messages: which call this answers
  created_at   timestamptz not null default now()
);
create index if not exists chat_messages_project_idx on public.chat_messages(project_id, id);

-- Keep updated_at current.
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists project_files_touch on public.project_files;
create trigger project_files_touch before update on public.project_files
  for each row execute function public.touch_updated_at();

-- A file change or new message bumps the parent project's updated_at.
create or replace function public.touch_parent_project() returns trigger
language plpgsql as $$
begin
  update public.projects set updated_at = now() where id = new.project_id;
  return new;
end $$;

drop trigger if exists project_files_touch_parent on public.project_files;
create trigger project_files_touch_parent after insert or update on public.project_files
  for each row execute function public.touch_parent_project();

drop trigger if exists chat_messages_touch_parent on public.chat_messages;
create trigger chat_messages_touch_parent after insert on public.chat_messages
  for each row execute function public.touch_parent_project();

-- Row level security. The FastAPI backend uses the service role key (bypasses RLS)
-- and enforces ownership itself; these policies protect direct access with the anon key.
alter table public.projects      enable row level security;
alter table public.project_files enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own project files" on public.project_files;
create policy "own project files" on public.project_files
  for all using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

drop policy if exists "own chat messages" on public.chat_messages;
create policy "own chat messages" on public.chat_messages
  for all using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
