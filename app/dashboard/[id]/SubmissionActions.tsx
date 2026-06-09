"use client";

import { deleteSubmission, toggleArchive } from "../actions";

export function SubmissionActions({
  id,
  archived,
}: {
  id: string;
  archived: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={toggleArchive}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="archived" value={archived ? "false" : "true"} />
        <button
          type="submit"
          className="cursor-pointer rounded-[--radius-card] border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-forest/40"
        >
          {archived ? "Restore" : "Archive"}
        </button>
      </form>
      <form
        action={deleteSubmission}
        onSubmit={(e) => {
          if (
            !window.confirm(
              "Delete this request and its photos for good? This can't be undone.",
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="cursor-pointer rounded-[--radius-card] border border-amber-deep/30 bg-amber/10 px-4 py-2.5 text-sm font-semibold text-amber-deep transition-colors hover:bg-amber/20"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
