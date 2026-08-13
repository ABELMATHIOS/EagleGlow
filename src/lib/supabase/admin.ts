import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the secret key — bypasses RLS entirely. Never import
// this from a "use client" component or anything that ships to the
// browser; only from Route Handlers / Server Actions, after verifying the
// caller is actually an admin (see approve-user route for the pattern).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}