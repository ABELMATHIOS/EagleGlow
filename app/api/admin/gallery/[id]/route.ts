import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  const ADMIN_ROLES = ["admin", "super_admin"];
return profile?.role && ADMIN_ROLES.includes(profile.role) ? user : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { category, title, subtitle, albumUrl, youtubeId, videoOnly, previewUrls, published } = body;

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("albums")
    .update({
      ...(category !== undefined && { category }),
      ...(title !== undefined && { title: title.trim() }),
      ...(subtitle !== undefined && { subtitle: subtitle?.trim() || null }),
      ...(albumUrl !== undefined && { album_url: albumUrl?.trim() || null }),
      ...(youtubeId !== undefined && { youtube_id: youtubeId?.trim() || null }),
      ...(videoOnly !== undefined && { video_only: !!videoOnly }),
      ...(previewUrls !== undefined && { preview_urls: previewUrls }),
      ...(published !== undefined && { published: !!published }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  return NextResponse.json({ album: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const { id } = await params;
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("albums").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  return NextResponse.json({ success: true });
}