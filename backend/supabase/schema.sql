-- Run this in Supabase SQL Editor for project initialization.
-- It creates the tables expected by the backend code.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  niche text not null default 'general',
  tone text not null default 'professional',
  generation_count integer not null default 0,
  generation_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_posts jsonb not null default '[]'::jsonb,
  insights jsonb not null default '{}'::jsonb,
  hooks jsonb not null default '[]'::jsonb,
  scripts jsonb not null default '[]'::jsonb,
  captions jsonb not null default '[]'::jsonb,
  hashtags jsonb not null default '[]'::jsonb,
  performance jsonb not null default '{"likes":0,"views":0,"shares":0,"comments":0}'::jsonb,
  score numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contents_user_id on public.contents(user_id);
create index if not exists idx_contents_created_at on public.contents(created_at desc);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  frequency text not null default 'daily' check (frequency in ('daily')),
  time text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_schedules_time on public.schedules(time);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_contents_updated_at on public.contents;
create trigger trg_contents_updated_at
before update on public.contents
for each row execute function public.set_updated_at();

drop trigger if exists trg_schedules_updated_at on public.schedules;
create trigger trg_schedules_updated_at
before update on public.schedules
for each row execute function public.set_updated_at();
