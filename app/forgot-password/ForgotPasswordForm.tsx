"use client";

import { useActionState } from "react";
import { sendResetEmail, type ForgotState } from "./actions";

const inputClass =
  "w-full min-h-12 rounded-[--radius-card] border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ForgotState, FormData>(
    sendResetEmail,
    {},
  );

  if (state.success) {
    return (
      <div className="rounded-[--radius-xl2] border border-forest/30 bg-forest/8 px-6 py-8 text-center">
        <p className="text-2xl font-semibold text-forest-deep">Check your email</p>
        <p className="mt-2 text-base text-ink-soft">
          If that address is in our system, we sent a reset link. It expires in
          one hour.
        </p>
        <a
          href="/login"
          className="mt-5 inline-block text-sm font-semibold text-forest-deep underline-offset-4 hover:underline"
        >
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-base font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-[--radius-card] border border-amber-deep/40 bg-amber/15 px-4 py-2.5 text-sm font-medium text-amber-deep"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[--radius-card] bg-forest px-6 text-base font-semibold text-white transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Remembered it?{" "}
        <a
          href="/login"
          className="font-semibold text-forest-deep underline-offset-4 hover:underline"
        >
          Back to sign in
        </a>
      </p>
    </form>
  );
}
