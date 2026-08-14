import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { Tutorial } from "@/src/types";

type TutorialRow = {
  id: string;
  belt_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  category: Tutorial["category"];
  sort_order: number;
  published: boolean;
  created_at: string;
};

function toTutorial(row: TutorialRow): Tutorial {
  return {
    id: row.id,
    beltId: row.belt_id,
    title: row.title,
    description: row.description ?? undefined,
    videoUrl: row.video_url ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    category: row.category,
    order: row.sort_order,
    published: row.published,
    createdAt: row.created_at,
  };
}

// Public / member-facing — published tutorials only, RLS-enforced.
export async function getPublishedTutorials(): Promise<Tutorial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tutorials")
    .select("*")
    .eq("published", true)
    .order("belt_id", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as TutorialRow[]).map(toTutorial);
}

// Admin — every tutorial, published or not. Verifies caller is admin first.
export async function getAllTutorials(): Promise<Tutorial[]> {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();
  if (!caller) return [];

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();
  if (callerProfile?.role !== "admin") return [];

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("tutorials")
    .select("*")
    .order("belt_id", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as TutorialRow[]).map(toTutorial);
}