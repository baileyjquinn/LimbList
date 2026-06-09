import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceRoleConfigured, supabaseConfigured } from "@/lib/env";
import type { Company } from "@/lib/types";

const DEMO_COMPANY: Company = {
  id: "demo",
  name: "Demo Tree Co",
  slug: "demo",
  notify_email: "demo@example.com",
  phone: null,
  created_at: new Date().toISOString(),
};

/**
 * Look up a company by its public intake slug. Uses the service role so
 * companies can stay locked down from anon reads. In demo mode (no Supabase)
 * any slug resolves to a placeholder company so the UI is previewable.
 */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  // Genuine local/preview mode: no backend at all -> placeholder company.
  if (!supabaseConfigured) {
    return { ...DEMO_COMPANY, slug, name: "Demo Tree Co" };
  }

  // Supabase IS configured but the service role key is missing. This is a real
  // server misconfiguration, NOT demo mode. Returning a fake demo company here
  // would make the intake form silently swallow real leads, so fail loudly.
  if (!serviceRoleConfigured) {
    console.error(
      "getCompanyBySlug: SUPABASE_SERVICE_ROLE_KEY missing in a configured environment",
    );
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getCompanyBySlug failed", error);
    return null;
  }

  return data as Company | null;
}

export const isDemoCompany = (company: Company) => company.id === "demo";
