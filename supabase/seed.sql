-- LimbList seed
-- 1) Edit the values below for your tree company.
-- 2) Run this in the Supabase SQL editor.
-- 3) Create the login user in Authentication -> Users (same email as owner_email).
-- 4) Re-run the final block to link that user to the company.

-- --- 1. The company ----------------------------------------------------------
insert into public.companies (name, slug, notify_email, phone)
values (
  'Quinn Tree Co',          -- name
  'quinn-tree-co',          -- slug -> /intake/quinn-tree-co
  'baileyjquinn@gmail.com', -- where new submissions are emailed
  '662-882-2299'            -- phone (optional)
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
where u.email = 'baileyjquinn@gmail.com'   -- must match the auth user email
  and c.slug = 'quinn-tree-co'
on conflict (id) do update
  set company_id = excluded.company_id;
