import type { ComponentType } from "react";
import type { Submission } from "@/lib/types";
import { FLAG_ANSWER } from "@/lib/constants";
import { BoltIcon, HouseIcon, LeafIcon } from "@/components/icons";

type Flag = { label: string; Icon: ComponentType<{ className?: string }> };

/** Returns the safety/scope flags worth surfacing for an estimator. */
export function getFlags(submission: Submission): Flag[] {
  const flags: Flag[] = [];
  if (submission.near_power_lines === FLAG_ANSWER)
    flags.push({ label: "Power line", Icon: BoltIcon });
  if (submission.near_structures === FLAG_ANSWER)
    flags.push({ label: "Near building", Icon: HouseIcon });
  if (submission.tree_condition === "Dead")
    flags.push({ label: "Dead tree", Icon: LeafIcon });
  return flags;
}

export function FlagChips({ submission }: { submission: Submission }) {
  const flags = getFlags(submission);
  if (flags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map(({ label, Icon }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 rounded-full border border-amber-deep/30 bg-amber/15 px-2 py-0.5 text-xs font-semibold text-amber-deep"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
      ))}
    </div>
  );
}
