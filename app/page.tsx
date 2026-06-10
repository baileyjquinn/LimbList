import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  HouseIcon,
  LeafIcon,
  RulerIcon,
  TruckIcon,
} from "@/components/icons";

const METRICS = [
  { value: "~2 min", label: "for the customer to send" },
  { value: "6+", label: "answers you get up front" },
  { value: "0", label: "wasted trips to dead ends" },
];

const STEPS = [
  {
    n: "01",
    title: "Send the link",
    body: "Text or email your customer your personal intake link. Nothing for them to download.",
  },
  {
    n: "02",
    title: "They send photos",
    body: "A couple minutes of photos, a short video, and the answers that matter — power lines, access, condition.",
  },
  {
    n: "03",
    title: "Quote with confidence",
    body: "It lands in your inbox and dashboard. Quote the easy ones without ever leaving the shop.",
  },
];

export default function Home() {
  return (
    <div className="hero-glow relative flex min-h-full flex-col">
      <div className="grain absolute inset-0 -z-0" aria-hidden />
      <div className="relative z-10 flex flex-1 flex-col">
        <SiteHeader />

        <main className="flex-1">
          <Hero />
          <MetricStrip />
          <BeforeAfter />
          <HowItWorks />
          <ClosingCta />
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}

function SiteHeader() {
  return (
    <div className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-line/80 bg-paper/80 px-4 py-2.5 shadow-[var(--elevation-2)] backdrop-blur-md sm:px-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-forest-deep sm:inline-flex"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-forest-deep"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-forest-deep"
          >
            Start free
          </Link>
        </div>
      </header>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rise-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/[0.07] px-3 py-1 text-sm font-semibold text-forest-deep">
            <LeafIcon className="h-4 w-4" />
            For tree companies
          </span>
          <h1 className="mt-5 font-display text-[2.9rem] font-semibold leading-[1.02] tracking-tight text-forest-deep sm:text-[3.75rem]">
            Stop driving to jobs you can&apos;t quote.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            LimbList lets your customers send photos and the details that matter{" "}
            <em className="font-display not-italic font-medium text-bark">
              before
            </em>{" "}
            you load the truck. Fewer wasted trips. Faster quotes.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/intake/demo"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[--radius-card] bg-forest px-6 text-base font-semibold text-white shadow-[var(--elevation-2)] transition-all duration-200 hover:bg-forest-deep hover:shadow-[var(--elevation-3)]"
            >
              See the customer form
              <ArrowRightIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-[--radius-card] border border-line bg-paper px-6 text-base font-semibold text-ink transition-colors duration-200 hover:border-forest/40"
            >
              Start free
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
            <CheckIcon className="h-4 w-4 text-forest" />
            Built with a working tree crew — no fluff, just what you need to quote.
          </p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="rise-in relative mx-auto w-full max-w-sm lg:max-w-none">
      {/* depth panel behind */}
      <div
        className="absolute -right-3 -top-4 hidden h-[88%] w-[78%] rotate-3 rounded-[--radius-xl2] bg-forest/[0.08] sm:block"
        aria-hidden
      />

      {/* phone */}
      <div className="relative mx-auto w-[270px] rounded-[2.6rem] bg-forest-deep p-2.5 shadow-[var(--elevation-4)]">
        <div className="overflow-hidden rounded-[2.1rem] bg-cream">
          <div className="flex items-center justify-between bg-paper px-4 py-3">
            <span className="font-display text-sm font-semibold text-forest-deep">
              Quinn Tree Co
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-ink-soft">
              Intake
            </span>
          </div>
          <div className="space-y-3.5 p-4">
            <MockField label="What do you need done?">
              <MockChip active>Tree removal</MockChip>
              <MockChip>Trimming</MockChip>
            </MockField>
            <MockField label="Near a power line?">
              <MockChip flag>Yes</MockChip>
              <MockChip>No</MockChip>
              <MockChip>Not sure</MockChip>
            </MockField>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-ink">Photos</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-forest/15 to-bark/15 text-forest/50"
                  >
                    <LeafIcon className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating "flagged" chip */}
      <div className="absolute -right-1 top-6 flex items-center gap-1.5 rounded-full border border-amber-deep/25 bg-paper px-3 py-1.5 shadow-[var(--elevation-3)] sm:-right-3">
        <BoltIcon className="h-4 w-4 text-amber-deep" />
        <span className="text-xs font-semibold text-amber-deep">
          Power line flagged
        </span>
      </div>

      {/* overlapping "what you know" card */}
      <div className="absolute -bottom-6 -left-2 hidden w-56 rounded-[--radius-xl2] border border-line bg-paper/95 p-4 shadow-[var(--elevation-4)] backdrop-blur-sm sm:block">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-bright">
          Before you arrive
        </p>
        <ul className="mt-2.5 space-y-2">
          {[
            { icon: BoltIcon, text: "Power line proximity" },
            { icon: HouseIcon, text: "Near the house?" },
            { icon: RulerIcon, text: "Rough height" },
            { icon: TruckIcon, text: "Truck access" },
          ].map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2.5 text-sm font-medium text-ink"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                <Icon className="h-3.5 w-3.5" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MockField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold text-ink">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function MockChip({
  children,
  active,
  flag,
}: {
  children: React.ReactNode;
  active?: boolean;
  flag?: boolean;
}) {
  const cls = flag
    ? "bg-amber-deep text-white"
    : active
      ? "bg-forest text-white"
      : "bg-paper text-ink-soft border border-line";
  return (
    <span className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

function MetricStrip() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[--radius-xl2] border border-line bg-line shadow-[var(--elevation-2)] sm:grid-cols-3">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-paper px-6 py-7 text-center">
            <div className="font-display text-4xl font-semibold text-forest-deep">
              {m.value}
            </div>
            <div className="mt-1 text-sm text-ink-soft">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <h2 className="font-display text-3xl font-semibold text-forest-deep sm:text-4xl">
          The phone call only tells you so much.
        </h2>
        <p className="mt-3 text-lg text-ink-soft">
          &quot;It&apos;s a big tree out back&quot; can mean ten different jobs.
          LimbList turns a vague call into a real picture.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* before */}
        <div className="rounded-[--radius-xl2] border border-line bg-cream-deep/50 p-6 sm:p-7">
          <span className="inline-flex rounded-full bg-bark/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-bark-soft">
            The old way
          </span>
          <ul className="mt-5 space-y-3.5">
            {[
              "Vague description over the phone",
              "Drive 30 minutes to take a look",
              "Can't reach it / power line / dead end",
              "No quote, no job, lost morning",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bark-soft/50" />
                <span className="text-base line-through decoration-bark-soft/30">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* after */}
        <div className="edge-light rounded-[--radius-xl2] border border-forest/20 bg-paper p-6 sm:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-deep">
            <LeafIcon className="h-3.5 w-3.5" />
            With LimbList
          </span>
          <ul className="mt-5 space-y-3.5">
            {[
              "Photos + video from every angle",
              "Power lines & access flagged up front",
              "Decide what's worth a visit",
              "Quote the easy ones from the shop",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-white">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="text-base font-medium text-ink">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="font-display text-3xl font-semibold text-forest-deep sm:text-4xl">
        How it works
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.n}
            className="group rounded-[--radius-xl2] border border-line bg-paper p-6 shadow-[var(--elevation-1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--elevation-3)]"
          >
            <span className="font-display text-sm font-semibold tracking-widest text-forest-bright">
              {step.n}
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold text-ink">
              {step.title}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-ink-soft">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6">
      <div className="relative overflow-hidden rounded-[--radius-xl2] bg-forest-deep px-6 py-12 text-center shadow-[var(--elevation-4)] sm:px-12 sm:py-16">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 80% at 80% 0%, oklch(58% 0.13 150 / 0.35), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold text-cream sm:text-4xl">
            Quote more jobs from the shop.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-cream/80">
            Try the customer intake yourself — it&apos;s the exact form your
            homeowners fill out.
          </p>
          <Link
            href="/intake/demo"
            className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-[--radius-card] bg-cream px-7 text-base font-semibold text-forest-deep shadow-[var(--elevation-2)] transition-all duration-200 hover:bg-paper hover:shadow-[var(--elevation-3)]"
          >
            Try the demo form
            <ArrowRightIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
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
  );
}
