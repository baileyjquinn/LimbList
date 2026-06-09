"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { serviceRoleConfigured, supabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/slug";

const RESERVED = new Set([
  "demo",
  "dashboard",
  "login",
  "signup",
  "intake",
  "api",
  "admin",
  "app",
  "www",
]);

const schema = z.object({
  companyName: z.string().trim().min(2, "Enter your company name").max(120),
  fullName: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(160),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

export type SignupState = { error?: string };

type Admin = ReturnType<typeof createAdminClient>;

async function uniqueSlug(admin: Admin, base: string): Promise<string> {
  let candidate = RESERVED.has(base) ? `${base}-co` : base;
  for (let i = 0; i < 50; i++) {
    const { data } = await admin
      .from("companies")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

export async function signUp(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  // Honeypot
  if (String(formData.get("company_website") ?? "").trim() !== "") {
    return { error: "Something went wrong. Please try again." };
  }

  if (!supabaseConfigured || !serviceRoleConfigured) {
    return { error: "Signups aren't available yet." };
  }

  const parsed = schema.safeParse({
    companyName: formData.get("companyName"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const { companyName, fullName, email, password } = parsed.data;

  const admin = createAdminClient();

  // 1. Create the auth user (auto-confirmed so they can sign in immediately).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created?.user) {
    const already = createErr?.message?.toLowerCase().includes("already");
    return {
      error: already
        ? "An account with that email already exists — try signing in."
        : "Could not create your account. Please try again.",
    };
  }
  const userId = created.user.id;

  // 2. Company with a unique slug.
  const slug = await uniqueSlug(admin, slugify(companyName));
  const { data: company, error: compErr } = await admin
    .from("companies")
    .insert({ name: companyName, slug, notify_email: email })
    .select("id")
    .single();
  if (compErr || !company) {
    await admin.auth.admin.deleteUser(userId);
    return { error: "Could not create your company. Please try again." };
  }

  // 3. Link the user to the company.
  const { error: profErr } = await admin.from("profiles").insert({
    id: userId,
    company_id: company.id,
    full_name: fullName,
  });
  if (profErr) {
    await admin.from("companies").delete().eq("id", company.id);
    await admin.auth.admin.deleteUser(userId);
    return { error: "Could not finish setting up your account." };
  }

  // 4. Sign them in (sets the session cookies), then go to the dashboard.
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) {
    redirect("/login");
  }
  redirect("/dashboard");
}
