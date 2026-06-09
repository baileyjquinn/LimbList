"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full min-h-12 rounded-[--radius-card] border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenHash = searchParams.get("token_hash");

  const [sessionReady, setSessionReady] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Exchange the recovery token for a session on mount.
  useEffect(() => {
    if (!tokenHash) {
      setTokenError("Invalid reset link. Please request a new one.");
      return;
    }
    const supabase = createClient();
    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: "recovery" })
      .then(({ error }) => {
        if (error) {
          setTokenError("This link has expired. Please request a new one.");
        } else {
          setSessionReady(true);
        }
      });
  }, [tokenHash]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setFormError("Could not update password. Please try again.");
        return;
      }
      router.push("/dashboard");
    });
  }

  if (tokenError) {
    return (
      <div className="rounded-[--radius-xl2] border border-amber-deep/30 bg-amber/10 px-6 py-8 text-center">
        <p className="text-base font-medium text-amber-deep">{tokenError}</p>
        <a
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-semibold text-forest-deep underline-offset-4 hover:underline"
        >
          Request a new link →
        </a>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <p className="py-8 text-center text-base text-ink-soft">Verifying…</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-base font-semibold text-ink">
          New password
          <span className="ml-2 text-sm font-normal text-ink-soft">
            At least 8 characters
          </span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className="text-base font-semibold text-ink">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-[--radius-card] border border-amber-deep/40 bg-amber/15 px-4 py-2.5 text-sm font-medium text-amber-deep"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[--radius-card] bg-forest px-6 text-base font-semibold text-white transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
