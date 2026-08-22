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
  const { beltId, title, description, videoUrl, durationMinutes, category, order, published } = body;

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("tutorials")
    .update({
      ...(beltId !== undefined && { belt_id: beltId }),
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(videoUrl !== undefined && { video_url: videoUrl?.trim() || null }),
      ...(durationMinutes !== undefined && { duration_minutes: durationMinutes }),
      ...(category !== undefined && { category }),
      ...(order !== undefined && { sort_order: order }),
      ...(published !== undefined && { published: !!published }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/tutorials");
  revalidatePath("/admin/tutorials");

  return NextResponse.json({ tutorial: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const { id } = await params;
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("tutorials").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/tutorials");
  revalidatePath("/admin/tutorials");

  return NextResponse.json({ success: true });
}