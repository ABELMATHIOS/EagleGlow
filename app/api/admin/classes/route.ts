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
  const { day, time, title, type, level, instructor, durationMinutes } = body;

  if (!day || !time || !title || !type || !durationMinutes) {
    return NextResponse.json({ error: "Day, time, title, type, and duration are required" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("classes")
    .insert({
      day,
      time: time.trim(),
      title: title.trim(),
      type,
      level: level?.trim() || null,
      instructor: instructor?.trim() || null,
      duration_minutes: Number(durationMinutes),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/classes");
  revalidatePath("/");
  revalidatePath("/admin/classes");

  return NextResponse.json({ class: data });
}