/**
 * ==============================================================================
 * MIRATH (ميراث) — GLOBAL CLOUD CONFIGURATION
 * ==============================================================================
 * Configures the live Supabase PostgreSQL backend for visitor intelligence,
 * telemetry streaming, and multi-user curator sync.
 *
 * NOTE: The publishable API key is safe for public client-side static hosts
 * because all database operations are enforced by PostgreSQL Row-Level Security (RLS).
 */

window.MIRATH_CONFIG = {
  supabaseUrl: 'https://qhsryqtgkojmvulnkmfh.supabase.co',
  supabaseAnonKey: 'sb_publishable_66GHB0ToIeESgeSVcyeNQQ_fUQWtxpc'
};
