import Link from "next/link";
import { Logo } from "@/components/Logo";

const STEPS = [
  {
    n: "1",
    title: "Send the link",
    body: "Text or email your customer your personal intake link. No app for them to download.",
  },
  {
    n: "2",
    title: "They send photos",
    body: "Two minutes of photos, a short video, and the answers you actually need — power lines, access, condition.",
  },
  {
    n: "3",
    title: "You quote with confidence",
    body: "Everything lands in your inbox and dashboard. Quote the easy ones without leaving the shop.",
  },
];

const KNOWS = [
  "Near a power line",
  "Near the house",
  "Dead or alive",
  "Rough height",
  "Truck access",
  "Photos + video",
];

export default function Home() {
  return (
    <div className="grain relative flex min-h-full flex-col">
      <div className="relative z-10 flex flex-1 flex-col">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo />
          <Link
            href="/login"
            className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-forest/40 hover:text-forest-deep"
          >
            Tree pro sign in
          </Link>
        </header>

        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/[0.06] px-3 py-1 text-sm font-semibold text-forest-deep">
                For tree companies
              </p>
              <h1 className="font-display text-[2.9rem] font-semibold leading-[1.02] tracking-tight text-forest-deep sm:text-6xl">
                Stop driving to jobs you can&apos;t quote.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-ink-soft sm:text-xl">
                LimbList lets your customers send photos and the details that
                matter{" "}
                <em className="font-display not-italic text-bark">before</em> you
                load the truck. Fewer wasted trips. Faster quotes.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/intake/demo"
                  className="inline-flex min-h-12 items-center justify-center rounded-[--radius-card] bg-forest px-6 text-base font-semibold text-white shadow-[var(--shadow-card)] transition hover:bg-forest-deep"
                >
                  See the customer form
                </Link>
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center justify-center rounded-[--radius-card] border border-line bg-paper px-6 text-base font-semibold text-ink transition hover:border-forest/40"
                >
                  Open the dashboard
                </Link>
              </div>
            </div>

            {/* Visual: the "what you'll know" card */}
            <div className="relative">
              <div className="rotate-1 rounded-[--radius-xl2] border border-line bg-paper p-6 shadow-[var(--shadow-lift)]">
                <p className="text-sm font-semibold uppercase tracking-wider text-forest-bright">
                  Before you arrive, you know
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-2.5">
                  {KNOWS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-[--radius-card] border border-line bg-cream/60 px-3 py-2.5 text-sm font-medium text-ink"
                    >
                      <span className="text-forest">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-[--radius-card] bg-amber/15 px-3 py-2.5 text-sm font-semibold text-amber-deep">
                  ⚡ Flags the dangerous ones automatically
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-forest-deep">
            How it works
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-[--radius-xl2] border border-line bg-paper p-6 shadow-[var(--shadow-card)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-base font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-base text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
          <div className="overflow-hidden rounded-[--radius-xl2] bg-forest-deep px-6 py-10 text-center sm:px-12 sm:py-14">
            <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
              Quote more jobs from the shop.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-lg text-cream/80">
              Try the customer intake yourself — it&apos;s the same form your
              homeowners will fill out.
            </p>
            <Link
              href="/intake/demo"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[--radius-card] bg-cream px-7 text-base font-semibold text-forest-deep transition hover:bg-paper"
            >
              Try the demo form
            </Link>
          </div>
        </section>

        <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-ink-soft sm:px-6">
          <div className="flex items-center justify-between border-t border-line pt-6">
            <Logo showWordmark />
            <span>© {new Date().getFullYear()} LimbList</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
