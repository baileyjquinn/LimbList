import type { SubmissionStatus } from "./types";

export const STORAGE_BUCKET = "submissions";

/** Contact + legal info (change CONTACT_EMAIL to your support address). */
export const CONTACT_EMAIL = "baileyjquinn@gmail.com";
export const LEGAL_UPDATED = "June 8, 2026";

export const JOB_TYPES = [
  "Tree removal",
  "Trimming / pruning",
  "Stump grinding",
  "Storm damage / emergency",
  "Not sure",
] as const;

export const TREE_COUNTS = ["1", "2", "3", "4 or more"] as const;

export const TREE_CONDITIONS = [
  "Healthy / alive",
  "Looks sick or dying",
  "Dead",
  "Not sure",
] as const;

export const HEIGHT_ESTIMATES = [
  "Under 15 ft (1 story)",
  "15–30 ft (2 stories)",
  "30–50 ft (3+ stories)",
  "Over 50 ft (very tall)",
  "Not sure",
] as const;

export const YES_NO_UNSURE = ["Yes", "No", "Not sure"] as const;

export const TRUCK_ACCESS = [
  "Yes, easy access",
  "Tight but possible",
  "No, hard to reach",
  "Not sure",
] as const;

export const SUBMISSION_STATUSES: SubmissionStatus[] = [
  "new",
  "reviewed",
  "quoted",
  "scheduled",
  "closed",
];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  quoted: "Quoted",
  scheduled: "Scheduled",
  closed: "Closed",
};

/** Answers that should raise a safety/scope flag for the estimator. */
export const FLAG_ANSWER = "Yes";
