import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getCompanyBySlug } from "@/lib/companies";
import { supabaseConfigured, serviceRoleConfigured } from "@/lib/env";
import { IntakeForm } from "./IntakeForm";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function IntakePage({ params }: PageProps) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return <NotActive />;
  }

  const canUpload = supabaseConfigured && serviceRoleConfigured;

  return (
    <main className="relative grain min-h-full">
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-8 sm:px-6">
        <header className="mb-8 flex items-center justify-between">
          <Logo />
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-sm font-medium text-ink-soft">
            for {company.name}
          </span>
        </header>

        <div className="mb-9">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-forest-bright">
            Tree job request
          </p>
          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-forest-deep sm:text-5xl">
            Show {company.name} your tree.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            A few quick questions and some photos give them everything they need
            to quote your job — so nobody wastes a trip. Takes about 2 minutes.
          </p>
        </div>

        <IntakeForm
          slug={company.slug}
          companyId={company.id}
          companyName={company.name}
          canUpload={canUpload}
        />
      </div>
    </main>
  );
}

function NotActive() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <Logo className="mb-6 justify-center" />
        <h1 className="font-display text-3xl font-semibold text-forest-deep">
          This intake link isn&apos;t active
        </h1>
        <p className="mt-3 text-lg text-ink-soft">
          Double-check the link your tree company sent you, or reach out to them
          directly.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-base font-semibold text-forest underline-offset-4 hover:underline"
        >
          About LimbList
        </Link>
      </div>
    </main>
  );
}
