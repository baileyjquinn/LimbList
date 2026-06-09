"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCompanyBySlug, isDemoCompany } from "@/lib/companies";
import {
  sendCustomerConfirmationEmail,
  sendSubmissionEmail,
} from "@/lib/email";
import { serviceRoleConfigured, supabaseConfigured } from "@/lib/env";
import type { IntakePayload } from "@/lib/types";

const RATE_LIMIT_WINDOW_MIN = 10;
const RATE_LIMIT_MAX = 6;
// Pepper so stored fingerprints aren't reversible plain IPs.
const IP_PEPPER = "limblist:v1";

const mediaSchema = z.object({
  path: z.string().min(1).max(500),
  kind: z.enum(["photo", "video"]),
});

const payloadSchema = z.object({
  customer_name: z.string().trim().min(1, "Please enter your name").max(120),
  customer_phone: z.string().trim().min(1, "Please enter a phone number").max(40),
  customer_email: z.string().trim().max(160).optional().default(""),
  address: z.string().trim().min(1, "Please enter the address").max(300),
  job_type: z.string().trim().max(80).optional().default(""),
  tree_count: z.string().trim().max(40).optional().default(""),
  tree_condition: z.string().trim().max(80).optional().default(""),
  height_estimate: z.string().trim().max(80).optional().default(""),
  near_power_lines: z.string().trim().max(40).optional().default(""),
  near_structures: z.string().trim().max(40).optional().default(""),
  truck_access: z.string().trim().max(80).optional().default(""),
  notes: z.string().trim().max(4000).optional().default(""),
  media: z.array(mediaSchema).max(15).default([]),
});

export type SubmitResult = { ok: true } | { ok: false; error: string };

async function fingerprint(): Promise<string> {
  const hdrs = await headers();
  const fwd = hdrs.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(`${IP_PEPPER}:${ip}`).digest("hex");
}

export async function submitIntake(
  slug: string,
  rawPayload: IntakePayload,
  honeypot = "",
): Promise<SubmitResult> {
  // Bots fill hidden fields. Pretend success so we don't tip them off.
  if (honeypot.trim() !== "") {
    return { ok: true };
  }

  const parsed = payloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid submission";
    return { ok: false, error: first };
  }
  const payload = parsed.data;

  const company = await getCompanyBySlug(slug);
  if (!company) {
    return { ok: false, error: "This intake link is not active." };
  }

  // Demo mode: nothing to persist, just succeed so the UI is testable.
  if (!supabaseConfigured || !serviceRoleConfigured || isDemoCompany(company)) {
    return { ok: true };
  }

  const admin = createAdminClient();
  const ipHash = await fingerprint();

  // Rate limit: cap submissions per fingerprint within the window.
  const since = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000,
  ).toISOString();
  const { count: recentCount } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if ((recentCount ?? 0) >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      error: "Too many requests. Please wait a few minutes and try again.",
    };
  }

  const { data: submission, error: insertError } = await admin
    .from("submissions")
    .insert({
      company_id: company.id,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_email: payload.customer_email || null,
      address: payload.address,
      job_type: payload.job_type || null,
      tree_count: payload.tree_count || null,
      tree_condition: payload.tree_condition || null,
      height_estimate: payload.height_estimate || null,
      near_power_lines: payload.near_power_lines || null,
      near_structures: payload.near_structures || null,
      truck_access: payload.truck_access || null,
      notes: payload.notes || null,
      ip_hash: ipHash,
    })
    .select("id")
    .single();

  if (insertError || !submission) {
    console.error("submission insert failed", insertError);
    return { ok: false, error: "Something went wrong saving your request." };
  }

  if (payload.media.length > 0) {
    const { error: mediaError } = await admin.from("submission_media").insert(
      payload.media.map((m) => ({
        submission_id: submission.id,
        storage_path: m.path,
        kind: m.kind,
      })),
    );
    if (mediaError) {
      console.error("media insert failed", mediaError);
      // Submission is saved; media rows failed. Don't block the homeowner.
    }
  }

  try {
    await sendSubmissionEmail({
      to: company.notify_email,
      companyName: company.name,
      submissionId: submission.id,
      payload,
    });
  } catch (error) {
    console.error("notification email failed", error);
    // Email failure must not fail the submission.
  }

  if (payload.customer_email) {
    try {
      await sendCustomerConfirmationEmail({
        to: payload.customer_email,
        companyName: company.name,
        customerName: payload.customer_name,
      });
    } catch (error) {
      console.error("customer confirmation email failed", error);
      // Never block the submission on the courtesy email.
    }
  }

  return { ok: true };
}
