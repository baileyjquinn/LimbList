"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/lib/slug";
import { signUp, type SignupState } from "./actions";

const inputClass =
  "w-full min-h-12 rounded-[--radius-card] border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    signUp,
    {},
  );
  const [companyName, setCompanyName] = useState("");
  const slug = slugify(companyName || "your-company");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Honeypot */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
      />

      <Labeled label="Company name" htmlFor="companyName">
        <input
          id="companyName"
          name="companyName"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
          placeholder="Quinn Tree Co"
        />
        <p className="mt-1.5 text-sm text-ink-soft">
          Your link:{" "}
          <span className="font-medium text-forest-deep">
            limb-list.vercel.app/intake/{slug}
          </span>
        </p>
      </Labeled>

      <Labeled label="Your name" htmlFor="fullName">
        <input
          id="fullName"
          name="fullName"
          required
          autoComplete="name"
          className={inputClass}
        />
      </Labeled>

      <Labeled label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </Labeled>

      <Labeled label="Password" htmlFor="password" hint="At least 8 characters">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </Labeled>

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
        {pending ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}

function Labeled({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-base font-semibold text-ink">
        {label}
        {hint && (
          <span className="ml-2 text-sm font-normal text-ink-soft">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}
