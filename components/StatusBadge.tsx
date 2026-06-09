import { STATUS_LABELS } from "@/lib/constants";
import type { SubmissionStatus } from "@/lib/types";

const STYLES: Record<SubmissionStatus, string> = {
  new: "bg-forest text-white",
  reviewed: "bg-forest/12 text-forest-deep",
  quoted: "bg-amber/25 text-amber-deep",
  scheduled: "bg-bark/15 text-bark",
  closed: "bg-line text-ink-soft",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
