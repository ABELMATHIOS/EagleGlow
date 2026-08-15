import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { day, time, title, type, level, instructor, durationMinutes } = body;

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("classes")
    .update({
      ...(day !== undefined && { day }),
      ...(time !== undefined && { time: time.trim() }),
      ...(title !== undefined && { title: title.trim() }),
      ...(type !== undefined && { type }),
      ...(level !== undefined && { level: level?.trim() || null }),
      ...(instructor !== undefined && { instructor: instructor?.trim() || null }),
      ...(durationMinutes !== undefined && { duration_minutes: Number(durationMinutes) }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/classes");
  revalidatePath("/");
  revalidatePath("/admin/classes");

  return NextResponse.json({ class: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const { id } = await params;
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("classes").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/classes");
  revalidatePath("/");
  revalidatePath("/admin/classes");

  return NextResponse.json({ success: true });
}