"use client";

import { useState } from "react";

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[--radius-xl2] border border-forest/20 bg-forest/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-forest-deep">
          Your intake link
        </p>
        <p className="truncate text-sm text-ink-soft">{url}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-[--radius-card] bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-deep"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
