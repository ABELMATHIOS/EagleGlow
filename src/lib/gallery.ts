import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { GalleryAlbum } from "@/src/types";

type AlbumRow = {
  id: string;
  category: GalleryAlbum["category"];
  title: string;
  subtitle: string | null;
  album_url: string | null;
  youtube_id: string | null;
  video_only: boolean;
  preview_urls: string[];
  published: boolean;
  created_at: string;
};

function toAlbum(row: AlbumRow): GalleryAlbum {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    subtitle: row.subtitle ?? "",
    albumUrl: row.album_url,
    youtubeId: row.youtube_id,
    videoOnly: row.video_only,
    previews: row.preview_urls,
    published: row.published,
  };
}

// Public gallery page — published albums only, RLS-enforced.
export async function getPublishedAlbums(): Promise<GalleryAlbum[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AlbumRow[]).map(toAlbum);
}

// Admin gallery page — every album, published or not. Verifies caller is
// admin first, same pattern as getAllMembers().
export async function getAllAlbums(): Promise<GalleryAlbum[]> {
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
    .from("albums")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AlbumRow[]).map(toAlbum);
}