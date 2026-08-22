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

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const body = await request.json();
  const { beltId, title, description, videoUrl, durationMinutes, category, order, published } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!beltId) {
    return NextResponse.json({ error: "Belt is required" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("tutorials")
    .insert({
      belt_id: beltId,
      title: title.trim(),
      description: description?.trim() || null,
      video_url: videoUrl?.trim() || null,
      duration_minutes: durationMinutes ?? null,
      category: category ?? "general",
      sort_order: order ?? 0,
      published: !!published,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/tutorials");
  revalidatePath("/admin/tutorials");

  return NextResponse.json({ tutorial: data });
}