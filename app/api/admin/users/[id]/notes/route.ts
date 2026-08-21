import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { AdminNote } from "@/src/types";

// Verifies the caller is an admin. Shared by both handlers below — same
// pattern as the status route.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) {
    return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();

    const ADMIN_ROLES = ["admin", "super_admin"];
  if (!ADMIN_ROLES.includes(callerProfile?.role ?? "")) {
    return { error: NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 }) };
  }

  if (!process.env.SUPABASE_SECRET_KEY) {
    console.error("[notes route] SUPABASE_SECRET_KEY is not set in .env.local");
    return {
      error: NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SECRET_KEY missing" },
        { status: 500 }
      ),
    };
  }

  return { error: null };
}

// Add a note. Body: { note: string }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { note } = body;

    if (typeof note !== "string" || !note.trim()) {
      return NextResponse.json({ error: "note must be a non-empty string" }, { status: 400 });
    }

    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const adminSupabase = createAdminClient();

    // Read-modify-write: fetch current notes, prepend the new one, save.
    const { data: existing, error: fetchError } = await adminSupabase
      .from("users")
      .select("admin_notes")
      .eq("id", targetUserId)
      .single();

    if (fetchError) {
      console.error("[notes route] fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const entry: AdminNote = {
      id: `n${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      note: note.trim(),
    };

    const updatedNotes: AdminNote[] = [entry, ...((existing?.admin_notes as AdminNote[]) ?? [])];

    const { data, error } = await adminSupabase
      .from("users")
      .update({ admin_notes: updatedNotes })
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
      console.error("[notes route] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("[notes route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Delete a note. Body: { noteId: string }
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { noteId } = body;

    if (typeof noteId !== "string" || !noteId) {
      return NextResponse.json({ error: "noteId must be a non-empty string" }, { status: 400 });
    }

    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const adminSupabase = createAdminClient();

    const { data: existing, error: fetchError } = await adminSupabase
      .from("users")
      .select("admin_notes")
      .eq("id", targetUserId)
      .single();

    if (fetchError) {
      console.error("[notes route] fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const updatedNotes: AdminNote[] = ((existing?.admin_notes as AdminNote[]) ?? []).filter(
      (n) => n.id !== noteId
    );

    const { data, error } = await adminSupabase
      .from("users")
      .update({ admin_notes: updatedNotes })
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
      console.error("[notes route] delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("[notes route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}