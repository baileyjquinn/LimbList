import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceRoleConfigured } from "@/lib/env";
import { STORAGE_BUCKET } from "@/lib/constants";
import type { Company } from "@/lib/types";

type Admin = ReturnType<typeof createAdminClient>;

// Files newer than this are left alone — they may belong to an in-flight
// submission that hasn't written its media rows yet.
const ORPHAN_MIN_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

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
