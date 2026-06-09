export type MediaKind = "photo" | "video";

export type SubmissionStatus =
  | "new"
  | "reviewed"
  | "quoted"
  | "scheduled"
  | "closed";

export interface Company {
  id: string;
  name: string;
  slug: string;
  notify_email: string;
  phone: string | null;
  created_at: string;
}

export interface SubmissionMedia {
  id: string;
  submission_id: string;
  storage_path: string;
  kind: MediaKind;
  created_at: string;
}

export interface Submission {
  id: string;
  company_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  job_type: string | null;
  tree_count: string | null;
  tree_condition: string | null;
  height_estimate: string | null;
  near_power_lines: string | null;
  near_structures: string | null;
  truck_access: string | null;
  notes: string | null;
  status: SubmissionStatus;
  internal_notes: string | null;
  archived: boolean;
  ip_hash: string | null;
  created_at: string;
}

/** Media reference produced by the browser after uploading to storage. */
export interface UploadedMedia {
  path: string;
  kind: MediaKind;
}

/** Payload sent from the intake form to the submit server action. */
export interface IntakePayload {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  job_type: string;
  tree_count: string;
  tree_condition: string;
  height_estimate: string;
  near_power_lines: string;
  near_structures: string;
  truck_access: string;
  notes: string;
  media: UploadedMedia[];
}
