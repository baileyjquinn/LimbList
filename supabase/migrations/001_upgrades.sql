-- LimbList upgrades migration
-- Adds dashboard fields (internal notes, archive), an anti-abuse fingerprint,
-- and a delete policy for company members. Safe to re-run.
-- Run in the Supabase SQL editor after the base schema.sql.

alter table public.submissions
  add column if not exists internal_notes text,
  add column if not exists archived boolean not null default false,
  add column if not exists ip_hash text;

create index if not exists submissions_company_archived_idx
  on public.submissions (company_id, archived, created_at desc);

-- Rate-limit lookups by fingerprint within a recent window.
create index if not exists submissions_iphash_created_idx
  on public.submissions (ip_hash, created_at desc);

-- Allow company members to delete their own submissions (dashboard delete).
drop policy if exists "company members delete submissions" on public.submissions;
create policy "company members delete submissions"
  on public.submissions for delete to authenticated
  using (company_id = public.current_company_id());
