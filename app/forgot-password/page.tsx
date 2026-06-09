import { Logo } from "@/components/Logo";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Forgot password — LimbList",
};

export default function ForgotPasswordPage() {
  return (
    <main className="hero-glow grain relative flex min-h-full items-center justify-center px-4 py-16">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="mb-6 justify-center" />
          <h1 className="font-display text-3xl font-semibold text-forest-deep">
            Reset your password
          </h1>
          <p className="mt-2 text-base text-ink-soft">
            Enter your email and we&apos;ll send you a link.
          </p>
        </div>

        <div className="rounded-[--radius-xl2] border border-line bg-cream/70 p-6 sm:p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
