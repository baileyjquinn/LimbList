import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getDashboardContext } from "@/lib/submissions";
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
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
