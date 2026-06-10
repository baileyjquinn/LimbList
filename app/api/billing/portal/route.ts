import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/submissions";
import { createPortalUrl } from "@/lib/stripe";
import { stripeConfigured } from "@/lib/env";

/**
 * Open the Stripe Billing Portal (update card, view invoices, cancel).
 * Authenticated; requires an existing Stripe customer.
 */
export async function POST(): Promise<Response> {
  if (!stripeConfigured) redirect("/dashboard/settings");

  const context = await getDashboardContext();
  if (!context) redirect("/login?next=/dashboard/settings");

  const customerId = context.company.stripe_customer_id;
  if (!customerId) {
    // No customer yet → nothing to manage; send them to upgrade instead.
    redirect("/dashboard/settings?billing=no-customer");
  }

  const url = await createPortalUrl(customerId);
  redirect(url);
}
