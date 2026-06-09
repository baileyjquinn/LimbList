"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured, APP_URL } from "@/lib/env";

export type ForgotState = { error?: string; success?: boolean };

export async function sendResetEmail(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  if (!supabaseConfigured) {
    return { error: "Supabase is not configured." };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Please enter your email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_URL}/reset-password`,
  });

  if (error) {
    console.error("reset password email error", error);
    return { error: "Something went wrong. Please try again." };
  }

  // Always return success — don't reveal whether the email exists.
  return { success: true };
}
