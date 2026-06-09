import Link from "next/link";
import {
  getDashboardContext,
  getStatusCounts,
  listSubmissions,
} from "@/lib/submissions";
import { APP_URL } from "@/lib/env";
import { StatusBadge } from "@/components/StatusBadge";
import { FlagChips } from "@/components/Flags";
import { ArrowRightIcon, CameraIcon } from "@/components/icons";
import { timeAgo } from "@/lib/format";
import { ShareLink } from "./ShareLink";
import { FilterBar } from "./FilterBar";

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string; archived?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { status, q, archived: archivedParam } = await searchParams;
  const archived = archivedParam === "1";

  const context = await getDashboardContext();
  const [submissions, counts] = await Promise.all([
    listSubmissions({ status, q, archived }),
    getStatusCounts(),
  ]);
  const intakeUrl = context ? `${APP_URL}/intake/${context.company.slug}` : "";

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const newCount = counts["new"] ?? 0;
  const isFiltered = Boolean(status || q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-deep">
            {archived ? "Archived requests" : "Job requests"}
          </h1>
          <p className="mt-1 text-base text-ink-soft">
            {`${submissions.length} ${submissions.length === 1 ? "request" : "requests"}`}
            {!archived && newCount ? ` · ${newCount} new` : ""}
          </p>
        </div>
        {!archived && newCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-sm font-semibold text-white shadow-[var(--elevation-1)]">
            {newCount} new to review
          </span>
        )}
      </div>

      {intakeUrl && !archived && <ShareLink url={intakeUrl} />}

      <FilterBar counts={counts} total={total} archived={archived} />

      {submissions.length === 0 ? (
        isFiltered || archived ? (
          <p className="rounded-[--radius-xl2] border border-dashed border-line bg-cream/50 p-8 text-center text-base text-ink-soft">
            No requests match this view.
          </p>
        ) : (
          <EmptyState url={intakeUrl} />
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {submissions.map((s) => {
            const isNew = s.status === "new";
            return (
              <li key={s.id}>
                <Link
                  href={`/dashboard/${s.id}`}
                  className="group relative flex flex-col gap-3 overflow-hidden rounded-[--radius-xl2] border border-line bg-paper p-4 shadow-[var(--elevation-1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-[var(--elevation-3)] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  {isNew && (
                    <span
                      className="absolute inset-y-0 left-0 w-1 bg-forest"
                      aria-hidden
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
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
                    <ArrowRightIcon className="h-5 w-5 text-forest transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EmptyState({ url }: { url: string }) {
  return (
    <div className="rounded-[--radius-xl2] border border-dashed border-line bg-cream/50 p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest">
        <CameraIcon className="h-7 w-7" />
      </div>
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
