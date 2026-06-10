import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/submissions";
import { getBillingState } from "@/lib/billing";
import { APP_URL } from "@/lib/env";
import { ArrowRightIcon } from "@/components/icons";
import { ShareLink } from "../ShareLink";
import { SettingsForm } from "./SettingsForm";
import { BillingPanel } from "./BillingPanel";

export const metadata = {
  title: "Settings — LimbList",
};

export default async function SettingsPage() {
  const context = await getDashboardContext();
  if (!context) redirect("/login?next=/dashboard/settings");

  const { company } = context;
  const intakeUrl = `${APP_URL}/intake/${company.slug}`;
  const billing = getBillingState(company);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-forest-deep"
      >
        <ArrowRightIcon className="h-4 w-4 rotate-180" />
        Back to requests
      </Link>

      <div>
        <h1 className="font-display text-3xl font-semibold text-forest-deep">
          Settings
        </h1>
        <p className="mt-1 text-base text-ink-soft">
          Update your company details and notification email.
        </p>
      </div>

      <ShareLink url={intakeUrl} />

      <section className="rounded-[--radius-xl2] border border-line bg-paper p-5 shadow-[var(--elevation-2)] sm:p-7">
        <SettingsForm
          name={company.name}
          notifyEmail={company.notify_email}
          phone={company.phone ?? ""}
        />
        <p className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
          Your intake link stays the same (
          <span className="font-medium text-forest-deep">
            /intake/{company.slug}
          </span>
          ) even if you rename your company, so links you&apos;ve already shared
          keep working.
        </p>
      </section>

      <BillingPanel billing={billing} />
    </div>
  );
}
