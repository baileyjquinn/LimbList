"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUBMISSION_STATUSES, STORAGE_BUCKET } from "@/lib/constants";
import { serviceRoleConfigured } from "@/lib/env";

const idSchema = z.string().uuid();

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(SUBMISSION_STATUSES as [string, ...string[]]),
});

export async function updateStatus(formData: FormData): Promise<void> {
  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  // RLS ensures the user can only update their own company's submissions.
  const { error } = await supabase
    .from("submissions")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("updateStatus failed", error);
    return;
  }

  revalidatePath(`/dashboard/${parsed.data.id}`);
  revalidatePath("/dashboard");
}

export async function saveNotes(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!idSchema.safeParse(id).success) return;
  const notes = String(formData.get("internal_notes") ?? "").slice(0, 4000);

  const supabase = await createClient();
  const { error } = await supabase
    .from("submissions")
    .update({ internal_notes: notes || null })
    .eq("id", id);

  if (error) {
    console.error("saveNotes failed", error);
    return;
  }
  revalidatePath(`/dashboard/${id}`);
}

export async function toggleArchive(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!idSchema.safeParse(id).success) return;
  const archived = String(formData.get("archived") ?? "") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("submissions")
    .update({ archived })
    .eq("id", id);

  if (error) {
    console.error("toggleArchive failed", error);
    return;
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteSubmission(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!idSchema.safeParse(id).success) return;

  const supabase = await createClient();

  // Remove storage objects first (RLS scopes the media read to this company).
  const { data: media } = await supabase
    .from("submission_media")
    .select("storage_path")
    .eq("submission_id", id);

  if (media && media.length > 0 && serviceRoleConfigured) {
    const admin = createAdminClient();
    await admin.storage
      .from(STORAGE_BUCKET)
      .remove(media.map((m) => (m as { storage_path: string }).storage_path));
  }

  // Delete the submission; cascade removes its media rows. RLS scopes by company.
  const { error } = await supabase.from("submissions").delete().eq("id", id);
  if (error) {
    console.error("deleteSubmission failed", error);
    return;
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
