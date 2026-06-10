import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeStripeStatus } from "@/lib/billing";

/**
 * Stripe webhook. Keeps `companies` billing columns in sync with Stripe.
 * Raw body is required for signature verification, so we read req.text().
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return new Response("Webhook not configured", { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return new Response(`Invalid signature: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const companyId = session.client_reference_id;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (companyId && subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await persistSubscription(companyId, sub);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const companyId = sub.metadata?.company_id ?? null;
        await persistSubscription(companyId, sub);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // Log and 500 so Stripe retries rather than dropping the update.
    console.error(`[stripe webhook] handler failed for ${event.type}`, err);
    return new Response("Handler error", { status: 500 });
  }

  return Response.json({ received: true });
}

function periodEndIso(sub: Stripe.Subscription): string | null {
  const s = sub as unknown as {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  const epoch = s.current_period_end ?? s.items?.data?.[0]?.current_period_end;
  return epoch ? new Date(epoch * 1000).toISOString() : null;
}

/** Update the matching company row from a Stripe subscription. */
async function persistSubscription(
  companyId: string | null,
  sub: Stripe.Subscription,
): Promise<void> {
  const admin = createAdminClient();
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const update = {
    subscription_status: normalizeStripeStatus(sub.status),
    stripe_subscription_id: sub.id,
    stripe_customer_id: customerId,
    current_period_end: periodEndIso(sub),
  };

  // Prefer matching by company_id from metadata; fall back to subscription id.
  if (companyId) {
    await admin.from("companies").update(update).eq("id", companyId);
  } else {
    await admin
      .from("companies")
      .update(update)
      .eq("stripe_subscription_id", sub.id);
  }
}
