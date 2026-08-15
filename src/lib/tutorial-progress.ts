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

export type LastWatchedTutorial = {
  tutorialId: string;
  title: string;
  beltSlug: string;
};

export type ProgressSummary = {
  totalTutorials: number;      // published tutorials up to and including the member's current belt
  completedCount: number;      // of those, how many the member has completed
  lastWatched: LastWatchedTutorial | null;
};

// Server-side only — powers the Dashboard's progress bar + "resume last
// tutorial" card. Scoped to tutorials at or below the member's current
// belt (same access rule as the tutorials pages), so the bar reflects
// what they can actually reach, not the whole catalog.
export async function getProgressSummary(currentUserBeltOrder: number): Promise<ProgressSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { totalTutorials: 0, completedCount: 0, lastWatched: null };

  const { data: tutorials, error: tutorialsError } = await supabase
    .from("tutorials")
    .select("id, belts!inner(sort_order)")
    .eq("published", true)
    .lte("belts.sort_order", currentUserBeltOrder);

  if (tutorialsError) throw tutorialsError;
  const totalTutorials = (tutorials ?? []).length;

  const { data: progressRows, error: progressError } = await supabase
    .from("tutorial_progress")
    .select("tutorial_id, completed_at, tutorials(title, belts(slug))")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (progressError) throw progressError;

  const reachableIds = new Set((tutorials ?? []).map((t) => t.id as string));
  const completedCount = (progressRows ?? []).filter((row) => reachableIds.has(row.tutorial_id as string)).length;

  const mostRecent = (progressRows ?? [])[0] as
    | {
        tutorial_id: string;
        tutorials: { title: string; belts: { slug: string }[] }[] | { title: string; belts: { slug: string }[] } | null;
      }
    | undefined;

  const mostRecentTutorial = Array.isArray(mostRecent?.tutorials)
    ? mostRecent?.tutorials[0]
    : mostRecent?.tutorials;
  const mostRecentBelt = mostRecentTutorial
    ? (Array.isArray(mostRecentTutorial.belts) ? mostRecentTutorial.belts[0] : mostRecentTutorial.belts)
    : undefined;

  const lastWatched: LastWatchedTutorial | null =
    mostRecent && mostRecentTutorial && mostRecentBelt
      ? {
          tutorialId: mostRecent.tutorial_id,
          title: mostRecentTutorial.title,
          beltSlug: mostRecentBelt.slug,
        }
      : null;

  return { totalTutorials, completedCount, lastWatched };
}