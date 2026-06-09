import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, supabaseConfigured, APP_URL } from "@/lib/env";
import { listAllCompanies, listOrphanedMediaPaths } from "@/lib/admin";
import { formatDateTime, timeAgo } from "@/lib/format";
import { cleanupOrphans } from "./actions";

export const metadata = {
  title: "Admin — LimbList",
};

export default async function AdminPage() {
  if (!supabaseConfigured) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");
  // Non-admins get a 404 — the page doesn't reveal it exists.
  if (!isAdminEmail(user.email)) notFound();

  const [companies, orphanPaths] = await Promise.all([
    listAllCompanies(),
    listOrphanedMediaPaths(),
  ]);
  const totalSubmissions = companies.reduce(
    (sum, c) => sum + c.submissionCount,
    0,
  );
  const orphanCount = orphanPaths.length;

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-cream/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
          </Link>
          <span className="rounded-full border border-amber-deep/30 bg-amber/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-deep">
            Admin
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold text-forest-deep">
            All companies
          </h1>
          <p className="mt-1 text-base text-ink-soft">
            {`${companies.length} ${
              companies.length === 1 ? "company" : "companies"
            } · ${totalSubmissions} total job ${
              totalSubmissions === 1 ? "request" : "requests"
            }`}
          </p>
        </div>

        {companies.length === 0 ? (
          <p className="rounded-[--radius-xl2] border border-dashed border-line bg-cream/50 p-10 text-center text-base text-ink-soft">
            No companies have signed up yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[--radius-xl2] border border-line bg-paper shadow-[var(--elevation-2)]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-cream/50 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Intake link</th>
                    <th className="px-4 py-3 text-right">Requests</th>
                    <th className="px-4 py-3">Last request</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-line/60 text-sm last:border-0 hover:bg-cream/40"
                    >
                      <td className="px-4 py-3 font-display text-base font-semibold text-ink">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {c.ownerName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${c.notify_email}`}
                          className="text-forest-deep underline-offset-2 hover:underline"
                        >
                          {c.notify_email}
                        </a>
                        {c.phone && (
                          <div className="text-ink-soft">{c.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`${APP_URL}/intake/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-soft underline-offset-2 hover:text-forest-deep hover:underline"
                        >
                          /intake/{c.slug}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">
                        {c.submissionCount}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {c.lastSubmissionAt ? timeAgo(c.lastSubmissionAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {formatDateTime(c.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-1)] sm:p-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-forest-deep">
              Storage cleanup
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {orphanCount === 0
                ? "No abandoned uploads to clean up."
                : `${orphanCount} abandoned ${
                    orphanCount === 1 ? "file" : "files"
                  } (uploaded but never submitted, older than 2 hours).`}
            </p>
          </div>
          {orphanCount > 0 && (
            <form action={cleanupOrphans}>
              <button
                type="submit"
                className="rounded-[--radius-card] bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-deep"
              >
                Delete {orphanCount} orphaned {orphanCount === 1 ? "file" : "files"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
