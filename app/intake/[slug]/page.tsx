import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LeafIcon } from "@/components/icons";
import { getCompanyBySlug, isDemoCompany } from "@/lib/companies";
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

  const isDemo = isDemoCompany(company);
  const canUpload = supabaseConfigured && serviceRoleConfigured && !isDemo;

  return (
    <main className="hero-glow relative min-h-full">
      <div className="grain absolute inset-0 -z-0" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-8 sm:px-6">
        <header className="mb-8 flex items-center justify-between">
          <Logo />
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-sm font-medium text-ink-soft">
            for {company.name}
          </span>
        </header>

        {isDemo && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[--radius-card] border border-forest/25 bg-forest/[0.06] px-4 py-3">
            <p className="text-sm font-medium text-forest-deep">
              This is a live preview — the exact form your customers fill out.
              Nothing you enter here is sent or saved.
            </p>
            <Link
              href="/signup"
              className="shrink-0 rounded-full bg-forest px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deep"
            >
              Get your own link
            </Link>
          </div>
        )}

        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/[0.07] px-3 py-1 text-sm font-semibold text-forest-deep">
            <LeafIcon className="h-4 w-4" />
            Tree job request
          </span>
          <h1 className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-forest-deep sm:text-5xl">
            Show {company.name} your tree.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
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
