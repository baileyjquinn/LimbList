import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceRoleConfigured } from "@/lib/env";
import type { Company } from "@/lib/types";

export interface CompanyOverview extends Company {
  ownerName: string | null;
  submissionCount: number;
  lastSubmissionAt: string | null;
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

  // Submission counts + most recent, keyed by company.
  const { data: subs } = await admin
    .from("submissions")
    .select("company_id, created_at");
  const counts = new Map<string, number>();
  const latest = new Map<string, string>();
  (subs ?? []).forEach((s) => {
    const row = s as { company_id: string; created_at: string };
    counts.set(row.company_id, (counts.get(row.company_id) ?? 0) + 1);
    const prev = latest.get(row.company_id);
    if (!prev || row.created_at > prev) latest.set(row.company_id, row.created_at);
  });

  return (companies as Company[]).map((c) => ({
    ...c,
    ownerName: ownerByCompany.get(c.id) ?? null,
    submissionCount: counts.get(c.id) ?? 0,
    lastSubmissionAt: latest.get(c.id) ?? null,
  }));
}
