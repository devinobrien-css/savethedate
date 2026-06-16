import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * All database access happens server-side (API routes / server components),
 * so we use the service-role key and never expose it to the browser. The
 * client is created lazily so a missing env var doesn't break the build.
 */
export type RSVP = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  attending: boolean;
  party_size: number;
  note: string | null;
  phone: string | null;
  sms_opt_in: boolean;
  sms_opted_out: boolean;
  // Set from /admin/guests when an RSVP is matched to a party (household).
  party_id: string | null;
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  if (!cached) {
    cached = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return cached;
}

export const RSVP_TABLE = "rsvps";
