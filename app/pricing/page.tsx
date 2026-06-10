import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PLAN } from "@/lib/billing";
import { ArrowRightIcon, CheckIcon, LeafIcon } from "@/components/icons";

export const metadata = {
  title: "Pricing — LimbList",
  description: `One simple plan. ${PLAN.currencySymbol}${PLAN.priceMonthly}/month after a ${PLAN.trialDays}-day free trial. Cancel anytime.`,
};

const FAQ = [
  {
    q: "Do I need a credit card to start?",
    a: `No. Sign up free and use everything for ${PLAN.trialDays} days. Add a card only when you're ready to keep going.`,
  },
  {
    q: "What if I cancel?",
    a: "Your intake link and any leads already sent to you keep working. You just lose access to the dashboard view. Re-subscribe any time.",
  },
  {
    q: "Is there a setup fee or contract?",
    a: "Neither. One flat monthly price, month to month. Cancel in two clicks.",
  },
  {
    q: "How many job requests can I get?",
    a: "Unlimited. Send your link to as many customers as you want — the price never changes.",
  },
];

export default function PricingPage() {
  return (
    <div className="hero-glow relative flex min-h-full flex-col">
      <div className="grain absolute inset-0 -z-0" aria-hidden />
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
          <header className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-line/80 bg-paper/80 px-4 py-2.5 shadow-[var(--elevation-2)] backdrop-blur-md sm:px-5">
            <Link href="/">
              <Logo />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-deep"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-deep"
              >
                Start free
              </Link>
            </div>
          </header>
        </div>

        <main className="flex-1">
          <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/[0.07] px-3 py-1 text-sm font-semibold text-forest-deep">
              <LeafIcon className="h-4 w-4" />
              Simple, honest pricing
            </span>
            <h1 className="mx-auto mt-5 max-w-2xl font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-forest-deep sm:text-[3.5rem]">
              One plan. One price.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
              {PLAN.tagline} One saved trip across town more than covers it.
            </p>
          </section>

          <section className="mx-auto w-full max-w-md px-4 pb-16 sm:px-6">
            <div className="overflow-hidden rounded-[--radius-xl2] border border-forest/20 bg-paper shadow-[var(--elevation-4)]">
              <div className="border-b border-line px-7 py-8 text-center">
                <div className="font-display text-lg font-semibold text-forest-deep">
                  {PLAN.name}
                </div>
                <div className="mt-3 flex items-baseline justify-center gap-1.5">
                  <span className="font-display text-6xl font-semibold text-forest-deep">
                    {PLAN.currencySymbol}
                    {PLAN.priceMonthly}
                  </span>
                  <span className="text-lg text-ink-soft">/month</span>
                </div>
                <p className="mt-3 text-sm text-ink-soft">
                  {PLAN.trialDays}-day free trial · no card to start · cancel
                  anytime
                </p>
              </div>

              <div className="px-7 py-7">
                <ul className="flex flex-col gap-3">
                  {PLAN.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-ink">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-white">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      <span className="text-base">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="group mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-[--radius-card] bg-forest px-6 text-base font-semibold text-white shadow-[var(--elevation-2)] transition-all hover:bg-forest-deep hover:shadow-[var(--elevation-3)]"
                >
                  Start your free trial
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/intake/demo"
                  className="mt-3 block text-center text-sm font-medium text-ink-soft transition-colors hover:text-forest-deep"
                >
                  Or see the customer form first →
                </Link>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-2xl px-4 pb-20 sm:px-6">
            <h2 className="font-display text-2xl font-semibold text-forest-deep">
              Questions
            </h2>
            <div className="mt-6 flex flex-col gap-3">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-1)]"
                >
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {item.q}
                  </h3>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
            <Logo />
            <div className="flex items-center gap-5 text-sm text-ink-soft">
              <Link href="/privacy" className="transition-colors hover:text-forest-deep">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-forest-deep">
                Terms
              </Link>
              <span>© {new Date().getFullYear()} LimbList</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
