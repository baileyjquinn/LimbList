"use client";

import { useRef } from "react";
import { SUBMISSION_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { SubmissionStatus } from "@/lib/types";
import { updateStatus } from "../actions";

export function StatusControl({
  id,
  status,
}: {
  id: string;
  status: SubmissionStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateStatus} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="status" className="text-sm font-medium text-ink-soft">
        Status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="min-h-10 rounded-[--radius-card] border border-line bg-paper px-3 py-2 text-sm font-medium text-ink focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
      >
        {SUBMISSION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
