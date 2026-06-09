"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardContext } from "@/lib/submissions";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your company name").max(120),
  notify_email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(160),
  phone: z.string().trim().max(40).optional().default(""),
});

export type SettingsState = { error?: string; success?: boolean };

export async function updateCompany(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const context = await getDashboardContext();
  if (!context) return { error: "You're not signed in." };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    notify_email: formData.get("notify_email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const { name, notify_email, phone } = parsed.data;

  const supabase = await createClient();
  // RLS scopes this update to the caller's own company.
  const { error } = await supabase
    .from("companies")
    .update({ name, notify_email, phone: phone || null })
    .eq("id", context.company.id);

  if (error) {
    console.error("updateCompany failed", error);
    return { error: "Could not save your changes. Please try again." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
