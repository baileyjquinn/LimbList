import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmission, getSubmissionMedia } from "@/lib/submissions";
import { StatusBadge } from "@/components/StatusBadge";
import { FlagChips } from "@/components/Flags";
import {
  ArrowRightIcon,
  ImageIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import { formatDateTime } from "@/lib/format";
import { StatusControl } from "./StatusControl";
import { NotesEditor } from "./NotesEditor";
import { SubmissionActions } from "./SubmissionActions";

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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-forest-deep"
      >
        <ArrowRightIcon className="h-4 w-4 rotate-180" />
        All requests
      </Link>

      {submission.notify_error && (
        <div className="rounded-[--radius-card] border border-amber-deep/40 bg-amber/15 px-4 py-3 text-sm font-medium text-amber-deep">
          Heads up — the email alert for this request didn&apos;t go through, so
          you may not have been notified. The full request is saved here, so
          nothing was lost.
        </div>
      )}

      <div className="flex flex-col gap-5 rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-2)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
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

        <div className="flex flex-wrap gap-2 border-t border-line pt-5">
          <a
            href={`tel:${submission.customer_phone}`}
            className="inline-flex items-center gap-2 rounded-[--radius-card] bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deep"
          >
            <PhoneIcon className="h-4 w-4" />
            {submission.customer_phone}
          </a>
          {submission.customer_email && (
            <a
              href={`mailto:${submission.customer_email}`}
              className="inline-flex items-center gap-2 rounded-[--radius-card] border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-forest/40"
            >
              <MailIcon className="h-4 w-4" />
              Email
            </a>
          )}
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[--radius-card] border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-forest/40"
          >
            <MapPinIcon className="h-4 w-4" />
            {submission.address}
          </a>
        </div>
      </div>

      <section className="rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-2)] sm:p-7">
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
          <div className="mt-5 rounded-[--radius-card] bg-cream/70 p-4">
            <p className="text-sm font-semibold text-ink-soft">
              Notes from the customer
            </p>
            <p className="mt-1 whitespace-pre-wrap text-base text-ink">
              {submission.notes}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-2)] sm:p-7">
        <h2 className="mb-4 font-display text-xl font-semibold text-forest-deep">
          Your notes
        </h2>
        <NotesEditor id={submission.id} notes={submission.internal_notes} />
      </section>

      <section className="rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-2)] sm:p-7">
        <h2 className="mb-4 font-display text-xl font-semibold text-forest-deep">
          Photos &amp; video
          <span className="ml-2 text-base font-normal text-ink-soft">
            ({media.length})
          </span>
        </h2>
        {media.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[--radius-card] border border-dashed border-line bg-cream/40 py-10 text-center">
            <ImageIcon className="h-8 w-8 text-ink-soft/60" />
            <p className="text-base text-ink-soft">
              No photos or video were attached to this request.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((m) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-[--radius-card] border border-line bg-cream-deep shadow-[var(--elevation-1)]"
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

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-sm text-ink-soft">
          {submission.archived ? "This request is archived." : ""}
        </p>
        <SubmissionActions id={submission.id} archived={submission.archived} />
      </div>
    </div>
  );
}
