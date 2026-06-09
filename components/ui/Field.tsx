import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  hint,
  required = false,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={htmlFor} className="block">
        <span className="text-lg font-semibold text-ink">
          {label}
          {required && <span className="ml-1 text-amber-deep">*</span>}
        </span>
        {hint && (
          <span className="mt-0.5 block text-base font-normal text-ink-soft">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
