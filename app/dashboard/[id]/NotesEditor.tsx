"use client";

import { useFormStatus } from "react-dom";
import { saveNotes } from "../actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer self-start rounded-[--radius-card] bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-deep disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save notes"}
    </button>
  );
}

export function NotesEditor({
  id,
  notes,
}: {
  id: string;
  notes: string | null;
}) {
  return (
    <form action={saveNotes} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="internal_notes"
        rows={4}
        defaultValue={notes ?? ""}
        placeholder="Private notes for your crew — quote amount, follow-up date, anything to remember…"
        className="w-full resize-y rounded-[--radius-card] border border-line bg-cream/50 px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 focus:border-forest focus:bg-paper focus:outline-none focus:ring-2 focus:ring-forest/30"
      />
      <SaveButton />
    </form>
  );
}
