"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const inputClass =
  "w-full min-h-12 rounded-[--radius-card] border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
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
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-base font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
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
        className="mt-1 inline-flex min-h-12 items-center justify-center rounded-[--radius-card] bg-forest px-6 text-base font-semibold text-white transition hover:bg-forest-deep disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
