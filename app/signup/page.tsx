import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { serviceRoleConfigured, supabaseConfigured } from "@/lib/env";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const canSignUp = supabaseConfigured && serviceRoleConfigured;

  if (supabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  return (
    <main className="hero-glow grain relative flex min-h-full items-center justify-center px-4 py-16">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mb-6 justify-center" />
          <h1 className="font-display text-3xl font-semibold text-forest-deep">
            Start taking photo intakes
          </h1>
          <p className="mt-2 text-base text-ink-soft">
            Create your company account and get a shareable intake link in under
            a minute.
          </p>
        </div>

        <div className="rounded-[--radius-xl2] border border-line bg-cream/70 p-6 shadow-[var(--elevation-2)] sm:p-8">
          {canSignUp ? (
            <SignupForm />
          ) : (
            <p className="text-center text-base text-ink-soft">
              Signups aren&apos;t available in this environment yet.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-base text-ink-soft">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-forest-deep underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
