import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmission, getSubmissionMedia } from "@/lib/submissions";
import { StatusBadge } from "@/components/StatusBadge";
import { FlagChips } from "@/components/Flags";
import { formatDateTime } from "@/lib/format";
import { StatusControl } from "./StatusControl";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  const media = await getSubmissionMedia(id);
  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(
    submission.address,
  )}`;

  const details: Array<[string, string | null]> = [
    ["Job type", submission.job_type],
    ["Trees", submission.tree_count],
    ["Condition", submission.tree_condition],
    ["Height", submission.height_estimate],
    ["Near power line", submission.near_power_lines],
    ["Near building", submission.near_structures],
    ["Truck access", submission.truck_access],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-ink-soft transition hover:text-forest-deep"
      >
        ← All requests
      </Link>

      <div className="flex flex-col gap-4 rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--shadow-card)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-semibold text-ink">
                {submission.customer_name}
              </h1>
              <StatusBadge status={submission.status} />
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              Received {formatDateTime(submission.created_at)}
            </p>
            <div className="mt-3">
              <FlagChips submission={submission} />
            </div>
          </div>
          <StatusControl id={submission.id} status={submission.status} />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <a
            href={`tel:${submission.customer_phone}`}
            className="rounded-[--radius-card] bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-deep"
          >
            Call {submission.customer_phone}
          </a>
          {submission.customer_email && (
            <a
              href={`mailto:${submission.customer_email}`}
              className="rounded-[--radius-card] border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-forest/40"
            >
              Email
            </a>
          )}
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[--radius-card] border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-forest/40"
          >
            {submission.address} ↗
          </a>
        </div>
      </div>

      <section className="rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--shadow-card)] sm:p-7">
        <h2 className="mb-4 font-display text-xl font-semibold text-forest-deep">
          The job
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-2"
            >
              <dt className="text-sm text-ink-soft">{label}</dt>
              <dd className="text-right text-base font-medium text-ink">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
        {submission.notes && (
          <div className="mt-5">
            <p className="text-sm text-ink-soft">Notes from the customer</p>
            <p className="mt-1 whitespace-pre-wrap text-base text-ink">
              {submission.notes}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--shadow-card)] sm:p-7">
        <h2 className="mb-4 font-display text-xl font-semibold text-forest-deep">
          Photos &amp; video
          <span className="ml-2 text-base font-normal text-ink-soft">
            ({media.length})
          </span>
        </h2>
        {media.length === 0 ? (
          <p className="text-base text-ink-soft">
            No photos or video were attached to this request.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((m) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-[--radius-card] border border-line bg-cream-deep"
              >
                {m.url ? (
                  m.kind === "video" ? (
                    <video
                      src={m.url}
                      controls
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <a href={m.url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt="Tree submission"
                        className="aspect-square w-full object-cover transition hover:opacity-90"
                      />
                    </a>
                  )
                ) : (
                  <div className="flex aspect-square items-center justify-center p-3 text-center text-xs text-ink-soft">
                    Media unavailable
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
