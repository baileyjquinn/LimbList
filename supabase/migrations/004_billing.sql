-- 004_billing.sql — Stripe subscription billing on companies.
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Billing model:
--   * Signup is free, no card. Each company gets a 14-day trial.
--   * After the trial the DASHBOARD soft-locks until they subscribe ($49/mo).
--   * Intake submissions + notification emails are NEVER gated — leads always
--     keep flowing even if a subscription lapses (core LimbList principle).
--   * Webhook writes here via the service role (bypasses RLS). The existing
--     "company members read own company" select policy already lets the owner
--     read these new columns in the dashboard.

alter table public.companies
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status    text not null default 'trialing',
  add column if not exists trial_ends_at          timestamptz default (now() + interval '14 days'),
  add column if not exists current_period_end     timestamptz;

-- Give any company that pre-dates billing a fresh 14-day trial from now,
-- so existing accounts (incl. test companies) aren't instantly locked out.
update public.companies
  set trial_ends_at = now() + interval '14 days'
  where trial_ends_at is null;

create index if not exists companies_stripe_customer_idx
  on public.companies (stripe_customer_id);
create index if not exists companies_stripe_subscription_idx
  on public.companies (stripe_subscription_id);
