"use client";

import { useActionState } from "react";
import { updateCompany, type SettingsState } from "./actions";

const inputClass =
  "w-full min-h-12 rounded-[--radius-card] border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30";

type Props = {
  name: string;
  notifyEmail: string;
  phone: string;
};

export function SettingsForm({ name, notifyEmail, phone }: Props) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateCompany,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="Company name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          defaultValue={name}
          className={inputClass}
        />
      </Field>

      <Field
        label="Notification email"
        htmlFor="notify_email"
        hint="Where new job requests are sent — keep this current"
      >
        <input
          id="notify_email"
          name="notify_email"
          type="email"
          required
          defaultValue={notifyEmail}
          className={inputClass}
        />
      </Field>

      <Field label="Phone" htmlFor="phone" hint="Optional">
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          className={inputClass}
        />
      </Field>

      {state.error && (
        <p
          role="alert"
          className="rounded-[--radius-card] border border-amber-deep/40 bg-amber/15 px-4 py-2.5 text-sm font-medium text-amber-deep"
        >
          {state.error}
        </p>
      )}

      {state.success && (
        <p
          role="status"
          className="rounded-[--radius-card] border border-forest/30 bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest-deep"
        >
          Saved.
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[--radius-card] bg-forest px-6 text-base font-semibold text-white transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
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
