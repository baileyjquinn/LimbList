/** Parts of a property address collected on the intake form. */
export interface AddressParts {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

/**
 * Compose the structured address parts into a single human-readable line,
 * e.g. "123 Oak St, Springfield, IL 62704". Empty parts are skipped so a
 * partial address still reads cleanly. This is the string stored in the
 * `address` column and used for display, search, and the Google Maps link.
 */
export function composeAddress(parts: AddressParts): string {
  const street = parts.street?.trim() ?? "";
  const city = parts.city?.trim() ?? "";
  const state = parts.state?.trim() ?? "";
  const zip = parts.zip?.trim() ?? "";
  const stateZip = [state, zip].filter(Boolean).join(" ");
  const cityStateZip = [city, stateZip].filter(Boolean).join(", ");
  return [street, cityStateZip].filter(Boolean).join(", ");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}
