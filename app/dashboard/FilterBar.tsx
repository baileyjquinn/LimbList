"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SUBMISSION_STATUSES, STATUS_LABELS } from "@/lib/constants";

type FilterBarProps = {
  counts: Record<string, number>;
  total: number;
  archived: boolean;
};

export function FilterBar({ counts, total, archived }: FilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const activeStatus = params.get("status") ?? "all";
  const [q, setQ] = useState(params.get("q") ?? "");

  function push(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  }

  function setStatus(status: string) {
    const next = new URLSearchParams(params.toString());
    if (status === "all") next.delete("status");
    else next.set("status", status);
    push(next);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    push(next);
  }

  function toggleArchived() {
    const next = new URLSearchParams(params.toString());
    if (archived) next.delete("archived");
    else next.set("archived", "1");
    push(next);
  }

  const chips: Array<{ key: string; label: string; count: number }> = [
    { key: "all", label: "All", count: total },
    ...SUBMISSION_STATUSES.map((s) => ({
      key: s,
      label: STATUS_LABELS[s],
      count: counts[s] ?? 0,
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submitSearch} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or address…"
          className="min-h-10 flex-1 rounded-[--radius-card] border border-line bg-paper px-4 text-base text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-[--radius-card] border border-line bg-paper px-4 text-sm font-semibold text-ink transition-colors hover:border-forest/40"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {!archived &&
          chips.map((c) => {
            const isActive = activeStatus === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setStatus(c.key)}
                className={[
                  "cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-forest text-white"
                    : "border border-line bg-paper text-ink-soft hover:border-forest/40",
                ].join(" ")}
              >
                {c.label}
                <span className={isActive ? "opacity-80" : "opacity-60"}>
                  {" "}
                  {c.count}
                </span>
              </button>
            );
          })}
        <button
          type="button"
          onClick={toggleArchived}
          className={[
            "ml-auto cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            archived
              ? "bg-bark text-white"
              : "border border-line bg-paper text-ink-soft hover:border-forest/40",
          ].join(" ")}
        >
          {archived ? "← Back to active" : "Archived"}
        </button>
      </div>
    </div>
  );
}
