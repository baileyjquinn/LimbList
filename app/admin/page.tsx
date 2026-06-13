import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, supabaseConfigured, APP_URL } from "@/lib/env";
import {
  listAllCompanies,
  listOrphanedMediaPaths,
  summarizeCompanies,
  type BillingLabel,
  type CompanyOverview,
} from "@/lib/admin";
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
  const stats = summarizeCompanies(companies);
  const orphanCount = orphanPaths.length;
  const attentionCompanies = companies.filter((c) => c.needsAttention);

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
            Overview
          </h1>
          <p className="mt-1 text-base text-ink-soft">
            Live snapshot of every company on LimbList.
          </p>
        </div>

        {/* Headline stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat
            label="Paying"
            value={stats.payingCount}
            tone="forest"
            sub={`$${stats.estimatedMrr}/mo`}
          />
          <Stat label="On trial" value={stats.trialCount} tone="amber" />
          <Stat label="Lapsed" value={stats.lapsedCount} tone="muted" />
          <Stat label="Companies" value={stats.totalCompanies} tone="muted" />
          <Stat
            label="Requests"
            value={stats.totalSubmissions}
            tone="muted"
            sub={`${stats.weekSubmissions} this week`}
          />
          <Stat
            label="Need attention"
            value={stats.attentionCount}
            tone={stats.attentionCount > 0 ? "warn" : "muted"}
          />
        </div>

        {/* Needs attention */}
        {attentionCompanies.length > 0 && (
          <section className="mb-8 rounded-[--radius-xl2] border border-amber-deep/30 bg-amber/10 p-5 shadow-[var(--elevation-1)] sm:p-6">
            <h2 className="font-display text-lg font-semibold text-amber-deep">
              Needs attention
            </h2>
            <p className="mt-1 text-sm text-bark">
              These accounts are at risk — a quick personal message now is what
              converts them.
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {attentionCompanies.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 rounded-[--radius-card] border border-amber-deep/20 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display text-base font-semibold text-ink">
                      {c.name}
                      {c.ownerName ? (
                        <span className="font-sans text-sm font-normal text-ink-soft">
                          {" "}
                          · {c.ownerName}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-bark">
                      {c.attentionReason}
                    </p>
                  </div>
                  <a
                    href={`mailto:${c.notify_email}`}
                    className="shrink-0 self-start rounded-[--radius-card] bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-deep sm:self-auto"
                  >
                    Email {c.ownerName?.split(" ")[0] ?? "owner"}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <h2 className="mb-3 font-display text-xl font-semibold text-forest-deep">
          All companies
        </h2>

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
                    <th className="px-4 py-3">Status</th>
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
                    <CompanyRow key={c.id} company={c} />
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

function CompanyRow({ company: c }: { company: CompanyOverview }) {
  return (
    <tr
      className={`border-b border-line/60 text-sm last:border-0 hover:bg-cream/40 ${
        c.needsAttention ? "bg-amber/5" : ""
      }`}
    >
      <td className="px-4 py-3 font-display text-base font-semibold text-ink">
        {c.name}
      </td>
      <td className="px-4 py-3">
        <StatusBadge label={c.billingLabel} trialDaysLeft={c.trialDaysLeft} />
      </td>
      <td className="px-4 py-3 text-ink-soft">{c.ownerName ?? "—"}</td>
      <td className="px-4 py-3">
        <a
          href={`mailto:${c.notify_email}`}
          className="text-forest-deep underline-offset-2 hover:underline"
        >
          {c.notify_email}
        </a>
        {c.phone && <div className="text-ink-soft">{c.phone}</div>}
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
        {c.weekSubmissionCount > 0 && (
          <span className="ml-1 text-xs font-normal text-forest">
            +{c.weekSubmissionCount}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-ink-soft">
        {c.lastSubmissionAt ? timeAgo(c.lastSubmissionAt) : "—"}
      </td>
      <td className="px-4 py-3 text-ink-soft">{formatDateTime(c.created_at)}</td>
    </tr>
  );
}

const BADGE_STYLES: Record<BillingLabel, { text: string; className: string }> = {
  paying: {
    text: "Paying",
    className: "border-forest/30 bg-forest/10 text-forest-deep",
  },
  trial: {
    text: "Trial",
    className: "border-amber-deep/30 bg-amber/15 text-amber-deep",
  },
  expired: {
    text: "Expired",
    className: "border-bark/30 bg-bark/10 text-bark",
  },
  past_due: {
    text: "Past due",
    className: "border-amber-deep/50 bg-amber-deep/15 text-amber-deep",
  },
  canceled: {
    text: "Canceled",
    className: "border-ink-soft/30 bg-ink-soft/10 text-ink-soft",
  },
};

function StatusBadge({
  label,
  trialDaysLeft,
}: {
  label: BillingLabel;
  trialDaysLeft: number | null;
}) {
  const style = BADGE_STYLES[label];
  const suffix =
    label === "trial" && trialDaysLeft !== null
      ? ` · ${trialDaysLeft}d`
      : "";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.className}`}
    >
      {style.text}
      {suffix}
    </span>
  );
}

type StatTone = "forest" | "amber" | "warn" | "muted";

const STAT_TONES: Record<StatTone, string> = {
  forest: "text-forest-deep",
  amber: "text-amber-deep",
  warn: "text-amber-deep",
  muted: "text-ink",
};

function Stat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: number;
  tone: StatTone;
  sub?: string;
}) {
  return (
    <div className="rounded-[--radius-xl2] border border-line bg-paper p-4 shadow-[var(--elevation-1)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p className={`mt-1 font-display text-2xl font-semibold ${STAT_TONES[tone]}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
