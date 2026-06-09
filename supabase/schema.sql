-- LimbList schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY guards.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.companies (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  notify_email text not null,
  phone        text,
  created_at   timestamptz not null default now()
);

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references public.companies (id) on delete cascade,
  customer_name    text not null,
  customer_phone   text not null,
  customer_email   text,
  address          text not null,
  job_type         text,
  tree_count       text,
  tree_condition   text,
  height_estimate  text,
  near_power_lines text,
  near_structures  text,
  truck_access     text,
  notes            text,
  status           text not null default 'new',
  created_at       timestamptz not null default now()
);

create table if not exists public.submission_media (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  storage_path  text not null,
  kind          text not null check (kind in ('photo', 'video')),
  created_at    timestamptz not null default now()
);

create index if not exists submissions_company_created_idx
  on public.submissions (company_id, created_at desc);
create index if not exists submission_media_submission_idx
  on public.submission_media (submission_id);
create index if not exists profiles_company_idx
  on public.profiles (company_id);

-- ---------------------------------------------------------------------------
-- Helper: the company_id of the current authenticated user
-- ---------------------------------------------------------------------------

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Intake writes happen via the service role (bypasses RLS). These policies
-- govern the dashboard (authenticated company users) and lock out anon reads.
-- ---------------------------------------------------------------------------

alter table public.companies        enable row level security;
alter table public.profiles         enable row level security;
alter table public.submissions      enable row level security;
alter table public.submission_media enable row level security;

drop policy if exists "company members read own company" on public.companies;
create policy "company members read own company"
  on public.companies for select to authenticated
  using (id = public.current_company_id());

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "company members read submissions" on public.submissions;
create policy "company members read submissions"
  on public.submissions for select to authenticated
  using (company_id = public.current_company_id());

drop policy if exists "company members update submissions" on public.submissions;
create policy "company members update submissions"
  on public.submissions for update to authenticated
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

drop policy if exists "company members read media" on public.submission_media;
create policy "company members read media"
  on public.submission_media for select to authenticated
  using (
    exists (
      select 1 from public.submissions s
      where s.id = submission_media.submission_id
        and s.company_id = public.current_company_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: private bucket for intake media
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Allow anonymous (and authenticated) clients to upload intake media.
-- Reads are served via service-role signed URLs from the dashboard, so no
-- public select policy is granted.
drop policy if exists "intake uploads" on storage.objects;
create policy "intake uploads"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'submissions');
