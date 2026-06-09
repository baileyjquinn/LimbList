import Link from "next/link";
import { getDashboardContext, listSubmissions } from "@/lib/submissions";
import { APP_URL } from "@/lib/env";
import { StatusBadge } from "@/components/StatusBadge";
import { FlagChips } from "@/components/Flags";
import { timeAgo } from "@/lib/format";
import { ShareLink } from "./ShareLink";

export default async function DashboardPage() {
  const context = await getDashboardContext();
  const submissions = await listSubmissions();
  const intakeUrl = context ? `${APP_URL}/intake/${context.company.slug}` : "";

  const newCount = submissions.filter((s) => s.status === "new").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest-deep">
          Job requests
        </h1>
        <p className="mt-1 text-base text-ink-soft">
          {submissions.length === 0
            ? "No requests yet."
            : `${submissions.length} total${newCount ? ` · ${newCount} new` : ""}`}
        </p>
      </div>

      {intakeUrl && <ShareLink url={intakeUrl} />}

      {submissions.length === 0 ? (
        <EmptyState url={intakeUrl} />
      ) : (
        <ul className="flex flex-col gap-3">
          {submissions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/dashboard/${s.id}`}
                className="group flex flex-col gap-3 rounded-[--radius-xl2] border border-line bg-paper p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-xl font-semibold text-ink">
                      {s.customer_name}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 truncate text-base text-ink-soft">
                    {s.job_type ? `${s.job_type} · ` : ""}
                    {s.address}
                  </p>
                  <div className="mt-2">
                    <FlagChips submission={s} />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm text-ink-soft">
                  <span>{timeAgo(s.created_at)}</span>
                  <span
                    aria-hidden
                    className="text-forest transition group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({ url }: { url: string }) {
  return (
    <div className="rounded-[--radius-xl2] border border-dashed border-line bg-cream/50 p-10 text-center">
      <h2 className="font-display text-xl font-semibold text-forest-deep">
        Waiting on your first request
      </h2>
      <p className="mx-auto mt-2 max-w-md text-base text-ink-soft">
        Share your intake link with a customer. When they send photos, the
        request shows up here and lands in your inbox.
      </p>
      {url && (
        <p className="mt-4 break-all text-sm font-medium text-forest">{url}</p>
      )}
    </div>
  );
}
