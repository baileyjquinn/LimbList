import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceRoleConfigured } from "@/lib/env";
import { PLAN } from "@/lib/billing";
import { STORAGE_BUCKET } from "@/lib/constants";
import type { Company } from "@/lib/types";

type Admin = ReturnType<typeof createAdminClient>;

// Files newer than this are left alone — they may belong to an in-flight
// submission that hasn't written its media rows yet.
const ORPHAN_MIN_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

export type BillingLabel =
  | "paying"
  | "trial"
  | "expired"
  | "past_due"
  | "canceled";

export interface CompanyOverview extends Company {
  ownerName: string | null;
  submissionCount: number;
  weekSubmissionCount: number;
  lastSubmissionAt: string | null;
  billingLabel: BillingLabel;
  trialDaysLeft: number | null;
  /** True when this company likely needs a personal nudge (see classifyBilling). */
  needsAttention: boolean;
  attentionReason: string | null;
}

const DAY_MS = 1000 * 60 * 60 * 24;
const WEEK_MS = 7 * DAY_MS;

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS);
}

/**
 * Classify a company's billing for the operator view. Richer than the
 * customer-facing getBillingState — distinguishes expired trials, churned
 * subs, and flags accounts that need a personal nudge.
 */
function classifyBilling(
  company: Company,
  submissionCount: number,
): {
  label: BillingLabel;
  trialDaysLeft: number | null;
  needsAttention: boolean;
  attentionReason: string | null;
} {
  const status = company.subscription_status ?? "trialing";
  const trialDaysLeft = daysUntil(company.trial_ends_at);

  if (status === "active") {
    return {
      label: "paying",
      trialDaysLeft: null,
      needsAttention: false,
      attentionReason: null,
    };
  }
  if (status === "past_due") {
    return {
      label: "past_due",
      trialDaysLeft: null,
      needsAttention: true,
      attentionReason: "Payment failed — card needs updating.",
    };
  }
  if (status === "canceled") {
    return {
      label: "canceled",
      trialDaysLeft: null,
      needsAttention: false,
      attentionReason: null,
    };
  }

  // Trialing (or unknown). Decide live vs expired.
  const trialExpired = trialDaysLeft !== null && trialDaysLeft <= 0;
  if (trialExpired) {
    return {
      label: "expired",
      trialDaysLeft,
      needsAttention: true,
      attentionReason: "Trial ended without subscribing.",
    };
  }

  // Live trial — flag the ones at risk of never converting.
  if (submissionCount === 0) {
    return {
      label: "trial",
      trialDaysLeft,
      needsAttention: true,
      attentionReason: "On trial but hasn't sent a single request yet.",
    };
  }
  if (trialDaysLeft !== null && trialDaysLeft <= 3) {
    return {
      label: "trial",
      trialDaysLeft,
      needsAttention: true,
      attentionReason: `Trial ends in ${trialDaysLeft} day${
        trialDaysLeft === 1 ? "" : "s"
      } — good time to reach out.`,
    };
  }

  return {
    label: "trial",
    trialDaysLeft,
    needsAttention: false,
    attentionReason: null,
  };
}

export interface AdminStats {
  totalCompanies: number;
  payingCount: number;
  trialCount: number;
  lapsedCount: number;
  estimatedMrr: number;
  totalSubmissions: number;
  weekSubmissions: number;
  attentionCount: number;
}

/** Roll a company list into the headline numbers shown at the top of admin. */
export function summarizeCompanies(companies: CompanyOverview[]): AdminStats {
  let payingCount = 0;
  let trialCount = 0;
  let lapsedCount = 0;
  let totalSubmissions = 0;
  let weekSubmissions = 0;
  let attentionCount = 0;

  for (const c of companies) {
    if (c.billingLabel === "paying") payingCount += 1;
    else if (c.billingLabel === "trial") trialCount += 1;
    else lapsedCount += 1; // expired, canceled, past_due
    totalSubmissions += c.submissionCount;
    weekSubmissions += c.weekSubmissionCount;
    if (c.needsAttention) attentionCount += 1;
  }

  return {
    totalCompanies: companies.length,
    payingCount,
    trialCount,
    lapsedCount,
    estimatedMrr: payingCount * PLAN.priceMonthly,
    totalSubmissions,
    weekSubmissions,
    attentionCount,
  };
}

/**
 * Cross-tenant overview of every company that has signed up. Uses the service
 * role to bypass RLS — callers MUST gate this behind an admin check first.
 */
export async function listAllCompanies(): Promise<CompanyOverview[]> {
  if (!serviceRoleConfigured) return [];
  const admin = createAdminClient();

  const { data: companies, error } = await admin
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !companies) {
    console.error("listAllCompanies failed", error);
    return [];
  }

  // Owner names, keyed by company.
  const { data: profiles } = await admin
    .from("profiles")
    .select("company_id, full_name");
  const ownerByCompany = new Map<string, string>();
  (profiles ?? []).forEach((p) => {
    const row = p as { company_id: string; full_name: string | null };
    if (row.full_name && !ownerByCompany.has(row.company_id)) {
      ownerByCompany.set(row.company_id, row.full_name);
    }
  });

  // Submission counts (all-time + last 7 days) + most recent, keyed by company.
  const { data: subs } = await admin
    .from("submissions")
    .select("company_id, created_at");
  const counts = new Map<string, number>();
  const weekCounts = new Map<string, number>();
  const latest = new Map<string, string>();
  const weekCutoff = Date.now() - WEEK_MS;
  (subs ?? []).forEach((s) => {
    const row = s as { company_id: string; created_at: string };
    counts.set(row.company_id, (counts.get(row.company_id) ?? 0) + 1);
    if (new Date(row.created_at).getTime() >= weekCutoff) {
      weekCounts.set(row.company_id, (weekCounts.get(row.company_id) ?? 0) + 1);
    }
    const prev = latest.get(row.company_id);
    if (!prev || row.created_at > prev) latest.set(row.company_id, row.created_at);
  });

  return (companies as Company[]).map((c) => {
    const submissionCount = counts.get(c.id) ?? 0;
    const billing = classifyBilling(c, submissionCount);
    return {
      ...c,
      ownerName: ownerByCompany.get(c.id) ?? null,
      submissionCount,
      weekSubmissionCount: weekCounts.get(c.id) ?? 0,
      lastSubmissionAt: latest.get(c.id) ?? null,
      billingLabel: billing.label,
      trialDaysLeft: billing.trialDaysLeft,
      needsAttention: billing.needsAttention,
      attentionReason: billing.attentionReason,
    };
  });
}

/** Every object path in the media bucket (paths are `companyId/file.ext`). */
async function listAllStoragePaths(
  admin: Admin,
): Promise<Array<{ path: string; createdAt: string }>> {
  const out: Array<{ path: string; createdAt: string }> = [];
  const { data: folders } = await admin.storage
    .from(STORAGE_BUCKET)
    .list("", { limit: 1000 });

  for (const folder of folders ?? []) {
    // Real files live one level down, under each company-id "folder".
    const { data: files } = await admin.storage
      .from(STORAGE_BUCKET)
      .list(folder.name, { limit: 1000 });
    for (const file of files ?? []) {
      // Folders come back with no created_at; skip those.
      if (!file.created_at) continue;
      out.push({
        path: `${folder.name}/${file.name}`,
        createdAt: file.created_at,
      });
    }
  }
  return out;
}

/**
 * Storage objects that no submission_media row references and that are older
 * than the safety window — i.e. abandoned uploads safe to delete.
 */
export async function listOrphanedMediaPaths(): Promise<string[]> {
  if (!serviceRoleConfigured) return [];
  const admin = createAdminClient();

  const all = await listAllStoragePaths(admin);
  if (all.length === 0) return [];

  const { data: media } = await admin
    .from("submission_media")
    .select("storage_path");
  const referenced = new Set(
    (media ?? []).map((m) => (m as { storage_path: string }).storage_path),
  );

  const cutoff = Date.now() - ORPHAN_MIN_AGE_MS;
  return all
    .filter(
      (o) =>
        !referenced.has(o.path) && new Date(o.createdAt).getTime() < cutoff,
    )
    .map((o) => o.path);
}

/** Deletes abandoned uploads. Returns how many were removed. Admin-gated by caller. */
export async function deleteOrphanedMedia(): Promise<number> {
  const paths = await listOrphanedMediaPaths();
  if (paths.length === 0) return 0;
  const admin = createAdminClient();
  const { error } = await admin.storage.from(STORAGE_BUCKET).remove(paths);
  if (error) {
    console.error("deleteOrphanedMedia failed", error);
    return 0;
  }
  return paths.length;
}
