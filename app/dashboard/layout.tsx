import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Paywall } from "@/components/Paywall";
import { getDashboardContext } from "@/lib/submissions";
import { getBillingState } from "@/lib/billing";
import { supabaseConfigured } from "@/lib/env";
import { signOut } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfigured) {
    return <NotConfigured />;
  }

  const context = await getDashboardContext();
  if (!context) {
    redirect("/login");
  }

  const billing = getBillingState(context.company);
  const showTrialBanner =
    billing.inTrial &&
    billing.trialDaysLeft !== null &&
    billing.trialDaysLeft <= 7;

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-cream/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink-soft sm:inline">
              {context.company.name}
            </span>
            <Link
              href="/dashboard/settings"
              className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:border-forest/40 hover:text-forest-deep"
            >
              Settings
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:border-forest/40 hover:text-forest-deep"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {showTrialBanner && (
        <div className="border-b border-amber/30 bg-amber/10">
          <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber/30 text-base">
                  ⏳
                </span>
                <div>
                  <p className="font-semibold text-bark">
                    {billing.trialDaysLeft === 1
                      ? "Last day of your free trial"
                      : `${billing.trialDaysLeft} days left in your free trial`}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    Subscribe to keep your dashboard, leads, and intake link active after your trial ends.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/settings#billing"
                className="shrink-0 inline-flex items-center justify-center rounded-[--radius-card] bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-deep"
              >
                Subscribe — $49/mo
              </Link>
            </div>
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {billing.hasAccess ? children : <Paywall />}
      </main>
    </div>
  );
}

function NotConfigured() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <Logo className="mb-6 justify-center" />
        <h1 className="font-display text-2xl font-semibold text-forest-deep">
          Dashboard needs Supabase
        </h1>
        <p className="mt-3 text-base text-ink-soft">
          Add your Supabase keys to <code>.env.local</code>, run the schema in
          <code className="mx-1">supabase/schema.sql</code>, then restart the dev
          server.
        </p>
      </div>
    </main>
  );
}
