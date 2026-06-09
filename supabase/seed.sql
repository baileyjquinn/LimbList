-- LimbList seed
-- 1) Edit the values below for your tree company.
-- 2) Run this in the Supabase SQL editor.
-- 3) Create the login user in Authentication -> Users (same email as owner_email).
-- 4) Re-run the final block to link that user to the company.

-- --- 1. The company ----------------------------------------------------------
insert into public.companies (name, slug, notify_email, phone)
values (
  'Smith Tree Co',          -- name
  'smith-tree-co',          -- slug -> /intake/smith-tree-co
  'owner@example.com',      -- where new submissions are emailed
  '555-000-0000'            -- phone (optional)
)
on conflict (slug) do update
  set name = excluded.name,
      notify_email = excluded.notify_email,
      phone = excluded.phone;

-- --- 2. Link the dashboard login user to the company -------------------------
-- Run AFTER creating the auth user with this email.
insert into public.profiles (id, company_id, full_name)
select u.id, c.id, 'Owner'
from auth.users u
cross join public.companies c
where u.email = 'owner@example.com'   -- must match the auth user email
  and c.slug = 'smith-tree-co'
on conflict (id) do update
  set company_id = excluded.company_id;
