import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Set new password — LimbList",
};

export default function ResetPasswordPage() {
  return (
    <main className="hero-glow grain relative flex min-h-full items-center justify-center px-4 py-16">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="mb-6 justify-center" />
          <h1 className="font-display text-3xl font-semibold text-forest-deep">
            Set a new password
          </h1>
          <p className="mt-2 text-base text-ink-soft">
            Choose something you&apos;ll remember.
          </p>
        </div>

        <div className="rounded-[--radius-xl2] border border-line bg-cream/70 p-6 sm:p-8">
          <Suspense
            fallback={
              <p className="py-8 text-center text-base text-ink-soft">
                Loading…
              </p>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
