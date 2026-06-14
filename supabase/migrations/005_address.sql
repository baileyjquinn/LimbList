-- 005_address.sql
-- Break the single free-text address into structured parts so homeowners give a
-- specific, mappable location (street / city / state / ZIP). The existing
-- `address` column stays as the composed, human-readable string used by the
-- email, dashboard, search, and the Google Maps link — so nothing downstream
-- has to change and old rows keep working. Safe to re-run.

alter table public.submissions
  add column if not exists street text,
  add column if not exists city   text,
  add column if not exists state  text,
  add column if not exists zip    text;
