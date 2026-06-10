import { PLAN } from "@/lib/billing";
import { CheckIcon, LockIcon } from "@/components/icons";

/**
 * Shown in place of the dashboard once a company's trial ends without an active
 * subscription. Intake links and lead emails keep working regardless — this
 * only gates the internal dashboard view.
 */
export function Paywall({ trialExpired = true }: { trialExpired?: boolean }) {
  return (
    <div className="mx-auto max-w-lg py-10">
      <div className="overflow-hidden rounded-[--radius-xl2] border border-line bg-paper shadow-[var(--elevation-3)]">
        <div className="bg-forest-deep px-6 py-7 text-cream sm:px-8">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-cream/75">
            <LockIcon className="h-4 w-4" />
            {trialExpired ? "Your free trial has ended" : "Subscription needed"}
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold">
            Keep your dashboard open
          </h1>
          <p className="mt-2 text-cream/85">
            Your intake link and email alerts are still live — no leads are being
            lost. Subscribe to {PLAN.name} to get back into your dashboard.
          </p>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-semibold text-forest-deep">
              {PLAN.currencySymbol}
              {PLAN.priceMonthly}
            </span>
            <span className="text-ink-soft">/month</span>
          </div>

          <ul className="mt-5 flex flex-col gap-2.5">
            {PLAN.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-ink">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <form action="/api/billing/checkout" method="post" className="mt-7">
            <button
              type="submit"
              className="w-full rounded-full bg-forest px-6 py-3.5 text-center text-base font-semibold text-cream shadow-[var(--elevation-2)] transition hover:bg-forest-deep"
            >
              Subscribe — {PLAN.currencySymbol}
              {PLAN.priceMonthly}/mo
            </button>
          </form>
          <p className="mt-3 text-center text-sm text-ink-soft">
            Secure checkout via Stripe · cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
