import "server-only";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { APP_URL } from "@/lib/env";

/** Lazily-built Stripe client. Throws if the secret key is missing. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

/**
 * Ensure a company has a Stripe customer, creating one (and persisting the id)
 * on first use. Returns the customer id.
 */
export async function ensureCustomer(args: {
  companyId: string;
  companyName: string;
  email: string;
  existingCustomerId?: string | null;
}): Promise<string> {
  if (args.existingCustomerId) return args.existingCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: args.email,
    name: args.companyName,
    metadata: { company_id: args.companyId },
  });

  const admin = createAdminClient();
  await admin
    .from("companies")
    .update({ stripe_customer_id: customer.id })
    .eq("id", args.companyId);

  return customer.id;
}

/** Build a Checkout session for the $99/mo plan and return its hosted URL. */
export async function createCheckoutUrl(args: {
  companyId: string;
  customerId: string;
}): Promise<string> {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_PRICE_ID is not set");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: args.customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: args.companyId,
    subscription_data: { metadata: { company_id: args.companyId } },
    allow_promotion_codes: true,
    success_url: `${APP_URL}/dashboard?billing=success`,
    cancel_url: `${APP_URL}/dashboard/settings?billing=cancelled`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/** Build a Billing Portal session (manage card / cancel) and return its URL. */
export async function createPortalUrl(customerId: string): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/dashboard/settings`,
  });
  return session.url;
}
