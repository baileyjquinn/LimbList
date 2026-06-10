import { PLAN, type BillingState } from "@/lib/billing";
import { CheckIcon } from "@/components/icons";

/**
 * Billing card on the settings page. Renders one of three states:
 *   - active subscription → manage via Stripe portal
 *   - trialing/lapsed (billing on) → subscribe CTA
 *   - billing not configured → hidden entirely
 */
export function BillingPanel({ billing }: { billing: BillingState }) {
  if (!billing.enabled) return null;

  const isActive = billing.status === "active";
  const isPastDue = billing.status === "past_due";

  return (
    <section
      id="billing"
      className="scroll-mt-24 rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-2)] sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-forest-deep">
          Billing
        </h2>
        <StatusPill billing={billing} />
      </div>

      {isActive ? (
        <>
          <p className="mt-3 text-base text-ink-soft">
            You&apos;re subscribed to {PLAN.name} — {PLAN.currencySymbol}
            {PLAN.priceMonthly}/month.
            {billing.currentPeriodEnd
              ? ` Renews ${formatDate(billing.currentPeriodEnd)}.`
              : ""}
          </p>
          <form action="/api/billing/portal" method="post" className="mt-5">
            <button
              type="submit"
              className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-forest/40 hover:text-forest-deep"
            >
              Manage billing
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="mt-3 text-base text-ink-soft">
            {isPastDue
              ? "Your last payment didn't go through. Update your card to keep your dashboard open."
              : billing.inTrial
                ? `You're on a free trial${
                    billing.trialDaysLeft !== null
                      ? ` — ${billing.trialDaysLeft} day${
                          billing.trialDaysLeft === 1 ? "" : "s"
                        } left`
                      : ""
                  }. Subscribe any time to lock in your dashboard.`
                : "Subscribe to keep your dashboard open. Your intake link keeps working either way."}
          </p>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-semibold text-forest-deep">
              {PLAN.currencySymbol}
              {PLAN.priceMonthly}
            </span>
            <span className="text-ink-soft">/month</span>
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PLAN.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <form
            action={isPastDue ? "/api/billing/portal" : "/api/billing/checkout"}
            method="post"
            className="mt-6"
          >
            <button
              type="submit"
              className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream shadow-[var(--elevation-2)] transition hover:bg-forest-deep"
            >
              {isPastDue
                ? "Update payment method"
                : `Subscribe — ${PLAN.currencySymbol}${PLAN.priceMonthly}/mo`}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

function StatusPill({ billing }: { billing: BillingState }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-forest/10 text-forest-deep" },
    trialing: { label: "Trial", cls: "bg-amber/15 text-bark" },
    past_due: { label: "Past due", cls: "bg-amber/20 text-amber-deep" },
    canceled: { label: "Canceled", cls: "bg-line text-ink-soft" },
  };
  const meta = map[billing.status] ?? {
    label: billing.inTrial ? "Trial" : "Inactive",
    cls: "bg-line text-ink-soft",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
