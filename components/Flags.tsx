import type { Submission } from "@/lib/types";
import { FLAG_ANSWER } from "@/lib/constants";

/** Returns the safety/scope flags worth surfacing for an estimator. */
export function getFlags(submission: Submission): string[] {
  const flags: string[] = [];
  if (submission.near_power_lines === FLAG_ANSWER) flags.push("⚡ Power line");
  if (submission.near_structures === FLAG_ANSWER) flags.push("🏠 Near building");
  if (submission.tree_condition === "Dead") flags.push("🪵 Dead tree");
  return flags;
}

export function FlagChips({ submission }: { submission: Submission }) {
  const flags = getFlags(submission);
  if (flags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={flag}
          className="inline-flex items-center rounded-full border border-amber-deep/30 bg-amber/15 px-2 py-0.5 text-xs font-semibold text-amber-deep"
        >
          {flag}
        </span>
      ))}
    </div>
  );
}
