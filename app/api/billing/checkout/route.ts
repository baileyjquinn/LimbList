import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/submissions";
import { ensureCustomer, createCheckoutUrl } from "@/lib/stripe";
import { stripeConfigured } from "@/lib/env";

/**
 * Start a subscription. Posted to from the paywall / settings "Upgrade"
 * button. Authenticated; redirects to Stripe Checkout.
 */
export async function POST(): Promise<Response> {
  if (!stripeConfigured) redirect("/dashboard/settings");

  const context = await getDashboardContext();
  if (!context) redirect("/login?next=/dashboard/settings");

  const { company, userEmail } = context;

  const customerId = await ensureCustomer({
    companyId: company.id,
    companyName: company.name,
    email: company.notify_email || userEmail,
    existingCustomerId: company.stripe_customer_id,
  });

  const url = await createCheckoutUrl({ companyId: company.id, customerId });
  redirect(url);
}
