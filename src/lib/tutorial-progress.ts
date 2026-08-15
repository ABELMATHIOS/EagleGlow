import { createClient } from "@/src/lib/supabase/server";

// Server-side only — returns the set of tutorial IDs the currently logged-in
// member has marked complete. RLS on tutorial_progress already restricts
// rows to auth.uid() = user_id, so no explicit filter is strictly required,
// but we filter by user.id anyway for clarity and to short-circuit when
// nobody's logged in.
export async function getUserProgress(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set();

  const { data, error } = await supabase
    .from("tutorial_progress")
    .select("tutorial_id")
    .eq("user_id", user.id);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.tutorial_id as string));
}