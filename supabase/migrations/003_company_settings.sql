-- LimbList company-settings migration
-- Lets a signed-in company member update their OWN company record (name,
-- notify email, phone) from the dashboard settings page. Scoped by RLS to the
-- caller's own company. Safe to re-run.
-- Run in the Supabase SQL editor after 002_notify_status.sql.

drop policy if exists "company members update company" on public.companies;
create policy "company members update company"
  on public.companies for update to authenticated
  using (id = public.current_company_id())
  with check (id = public.current_company_id());
