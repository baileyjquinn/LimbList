import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET } from "@/lib/constants";
import { serviceRoleConfigured } from "@/lib/env";
import type { Company, Submission, SubmissionMedia } from "@/lib/types";

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export interface DashboardContext {
  userEmail: string;
  company: Company;
}

/** Resolve the signed-in user's company. Returns null if not signed in / no profile. */
export async function getDashboardContext(): Promise<DashboardContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .maybeSingle();

  if (!company) return null;

  return { userEmail: user.email ?? "", company: company as Company };
}

export async function listSubmissions(): Promise<Submission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listSubmissions failed", error);
    return [];
  }
  return (data ?? []) as Submission[];
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getSubmission failed", error);
    return null;
  }
  return data as Submission | null;
}

export interface MediaWithUrl extends SubmissionMedia {
  url: string | null;
}

export async function getSubmissionMedia(
  submissionId: string,
): Promise<MediaWithUrl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submission_media")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("getSubmissionMedia failed", error);
    return [];
  }

  const media = data as SubmissionMedia[];
  if (media.length === 0 || !serviceRoleConfigured) {
    return media.map((m) => ({ ...m, url: null }));
  }

  const admin = createAdminClient();
  const { data: signed } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(
      media.map((m) => m.storage_path),
      SIGNED_URL_TTL,
    );

  return media.map((m, i) => ({
    ...m,
    url: signed?.[i]?.signedUrl ?? null,
  }));
}
