/**
 * Central feature-detection for optional services.
 *
 * The app is designed to run in a "demo" mode when Supabase is not configured
 * so the intake UI can be previewed without a backend. Real persistence,
 * auth, and email only activate once the corresponding env vars are present.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const serviceRoleConfigured = Boolean(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const emailConfigured = Boolean(process.env.RESEND_API_KEY);

/**
 * Billing is "on" only when both the Stripe secret key and the recurring
 * price id are present. While off, the dashboard never paywalls — the app
 * behaves exactly as it did pre-billing. This lets billing ship dark and be
 * activated purely by setting env vars in Vercel.
 */
export const stripeConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID,
);

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Owner/admin emails (comma-separated) allowed to view the cross-company admin
 * page. Server-only — never prefixed with NEXT_PUBLIC. If unset, no one is an
 * admin and the page 404s for everyone.
 */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Server-only promo code. When a signup supplies this code the company is
 * activated immediately (subscription_status = 'active', no trial, no card).
 * Never prefixed with NEXT_PUBLIC — stays out of the client bundle.
 */
export const PROMO_CODE = process.env.PROMO_CODE ?? "";
