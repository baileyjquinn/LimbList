import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { LoginForm } from "./LoginForm";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  if (supabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  return (
    <main className="grain relative flex min-h-full items-center justify-center px-4 py-16">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="mb-6 justify-center" />
          <h1 className="font-display text-3xl font-semibold text-forest-deep">
            Welcome back
          </h1>
          <p className="mt-2 text-base text-ink-soft">
            Sign in to see your tree job requests.
          </p>
        </div>

        <div className="rounded-[--radius-xl2] border border-line bg-cream/70 p-6 sm:p-8">
          {supabaseConfigured ? (
            <LoginForm next={next ?? "/dashboard"} />
          ) : (
            <p className="text-center text-base text-ink-soft">
              The dashboard needs Supabase configured. Add your keys to
              <code className="mx-1 rounded bg-cream-deep px-1.5 py-0.5 text-sm">
                .env.local
              </code>
              to enable sign in.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
