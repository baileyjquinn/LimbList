import { stripeConfigured } from "@/lib/env";
import type { Company } from "@/lib/types";

/**
 * Plan + access logic for LimbList subscriptions. Pure (no I/O) so it can be
 * imported by server components, route handlers, and the public pricing page.
 */

export const PLAN = {
  name: "LimbList Pro",
  priceMonthly: 49,
  currencySymbol: "$",
  trialDays: 14,
  tagline: "Everything you need to stop driving to dead leads.",
  features: [
    "Unlimited photo + video job requests",
    "Your own branded intake link",
    "Instant email alerts with safety flags",
    "Full dashboard: pipeline, notes, search",
    "Homeowner confirmation emails",
    "Cancel anytime",
  ],
} as const;

const DAY_MS = 1000 * 60 * 60 * 24;

export interface BillingState {
  /** Raw status from Stripe (or "trialing"/"none" locally). */
  status: string;
  /** Whether the dashboard should be unlocked. */
  hasAccess: boolean;
  /** Billing is configured at all (env vars present). */
  enabled: boolean;
  inTrial: boolean;
  trialDaysLeft: number | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / DAY_MS);
}

/**
 * Resolve a company's access state. When billing is not configured, everyone
 * has access (billing ships dark). Otherwise: active subscriptions are in;
 * trials are in until they expire; everything else is locked.
 */
export function getBillingState(company: Pick<
  Company,
  "subscription_status" | "trial_ends_at" | "current_period_end"
>): BillingState {
  const trialEndsAt = company.trial_ends_at ?? null;
  const currentPeriodEnd = company.current_period_end ?? null;

  if (!stripeConfigured) {
    return {
      status: company.subscription_status ?? "none",
      hasAccess: true,
      enabled: false,
      inTrial: false,
      trialDaysLeft: null,
      trialEndsAt,
      currentPeriodEnd,
    };
  }

  const status = company.subscription_status ?? "trialing";
  const trialDaysLeft = daysUntil(trialEndsAt);
  const trialActive =
    status === "trialing" && (trialEndsAt === null || (trialDaysLeft ?? 0) > 0);

  let hasAccess = false;
  if (status === "active") hasAccess = true;
  else if (trialActive) hasAccess = true;

  return {
    status,
    hasAccess,
    enabled: true,
    inTrial: trialActive,
    trialDaysLeft,
    trialEndsAt,
    currentPeriodEnd,
  };
}

/** Map a Stripe subscription status to the value we persist on the company. */
export function normalizeStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
      return stripeStatus;
    case "unpaid":
      return "past_due";
    case "incomplete_expired":
      return "canceled";
    default:
      return stripeStatus;
  }
}
