-- LimbList notification-status migration
-- Tracks whether the company notification email actually sent for each
-- submission, so a failed notification surfaces in the dashboard instead of
-- silently dropping a lead. Safe to re-run.
-- Run in the Supabase SQL editor after 001_upgrades.sql.

alter table public.submissions
  add column if not exists notified_at timestamptz,
  add column if not exists notify_error text;
