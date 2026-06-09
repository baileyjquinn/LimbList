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

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
