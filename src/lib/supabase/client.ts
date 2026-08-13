import { createBrowserClient } from "@supabase/ssr";

// Client component / browser usage — safe to import anywhere on the client.
// Reads the publishable key, which is meant to be public (RLS does the
// actual access control on the database side).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}