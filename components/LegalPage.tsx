import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className="min-h-full">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-forest-deep"
          >
            ← Home
          </Link>
        </header>

        <h1 className="font-display text-4xl font-semibold tracking-tight text-forest-deep">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Last updated: {updated}</p>

        <div className="mt-6 [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-forest-deep [&_li]:my-1.5 [&_li]:text-[1.0625rem] [&_li]:leading-relaxed [&_li]:text-ink-soft [&_p]:my-3 [&_p]:text-[1.0625rem] [&_p]:leading-relaxed [&_p]:text-ink-soft [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>

        <footer className="mt-12 flex gap-4 border-t border-line pt-6 text-sm text-ink-soft">
          <Link href="/privacy" className="hover:text-forest-deep">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-forest-deep">
            Terms
          </Link>
          <Link href="/" className="hover:text-forest-deep">
            Home
          </Link>
        </footer>
      </div>
    </main>
  );
}
