# LimbList

Photo-first intake for tree companies. A homeowner opens a link, sends photos
and the details that actually matter (power lines, structures, access, height,
condition), and the tree pro gets a summary by email plus a dashboard of every
request — so nobody drives to a job they can't quote.

## How it works

1. Each tree company gets a public intake link: `/intake/<company-slug>`
2. The homeowner fills a short, phone-friendly form and uploads photos/video
3. On submit: the request is saved, media goes to private storage, and a summary
   email is sent to the company
4. The company signs in at `/dashboard` to triage requests, view media, and
   update status

## Tech

- **Next.js 16** (App Router, Turbopack) + **React 19**, TypeScript, Tailwind v4
- **Supabase** — Postgres, Auth, and Storage (multi-tenant via a `companies` table + RLS)
- **Resend** — transactional notification email
- **Zod** — server-action input validation

## Demo mode

With no Supabase keys set, the app runs in **demo mode**: the intake form at
`/intake/demo` is fully interactive and the success flow works, but nothing is
persisted. This is just for previewing the UI.

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) — creates
   tables, RLS policies, the helper function, and the private `submissions`
   storage bucket.
3. Edit and run [`supabase/seed.sql`](supabase/seed.sql) to create your first
   company.
4. In **Authentication → Users**, add a user with the company's owner email.
5. Re-run the second block of `seed.sql` to link that user to the company.

### 3. Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same |
| `SUPABASE_SERVICE_ROLE_KEY` | same (server only — keep secret) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM` | a verified sender, e.g. `LimbList <intake@yourdomain.com>` |
| `NEXT_PUBLIC_APP_URL` | your public base URL (for dashboard links in emails) |

### 4. Run

```bash
npm run dev
```

- Landing: `http://localhost:3000/`
- Demo intake: `http://localhost:3000/intake/demo`
- Your company intake: `http://localhost:3000/intake/<your-slug>`
- Dashboard: `http://localhost:3000/dashboard`

## Project structure

```
app/
  page.tsx                 Landing (for tree companies)
  intake/[slug]/           Public homeowner intake form + submit action
  login/                   Email/password sign in
  dashboard/               Auth-gated: list, detail, status, share link
lib/
  supabase/                client / server / admin / session helpers
  companies.ts             slug -> company lookup (service role)
  submissions.ts           dashboard data + signed media URLs
  email.ts                 Resend summary email
components/                Logo, form controls, status + flag chips
supabase/                  schema.sql, seed.sql
```

## Notes

- **Multi-tenant from day one**: every submission is scoped to a `company_id`,
  and RLS ensures a signed-in user only ever sees their own company's data.
  Onboarding a second company is a row in `companies` + a linked user.
- **No A2P/DLC needed**: notifications are email-only for now. SMS can be added
  later behind the same submission pipeline.
- **Media** is stored in a private bucket and served to the dashboard via
  short-lived signed URLs.
