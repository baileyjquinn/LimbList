"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SUBMISSION_STATUSES } from "@/lib/constants";

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
