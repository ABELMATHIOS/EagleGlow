import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { AdminNote } from "@/src/types";

// Grants or revokes admin access on a member. Only callable by a
// super_admin — a regular admin can do everything else on AdminMembers.tsx
// but cannot create or remove other admins. Body: { grant: boolean }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { grant } = body;

    if (typeof grant !== "boolean") {
      return NextResponse.json({ error: "grant must be a boolean" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();

    if (!caller) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    // Prevent a super_admin from accidentally revoking (or "granting" —
    // a no-op, but still blocked for consistency) their own admin access.
    if (targetUserId === caller.id) {
      return NextResponse.json(
        { error: "You cannot change your own admin access" },
        { status: 400 }
      );
    }

    const { data: callerProfile } = await supabase
      .from("users")
      .select("role, name")
      .eq("id", caller.id)
      .single();

    if (callerProfile?.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden — super admin only" },
        { status: 403 }
      );
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error("[role route] SUPABASE_SECRET_KEY is not set in .env.local");
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();

    // Never allow granting/revoking super_admin itself through this route —
    // that stays Supabase-dashboard-only. Also refuse to touch an existing
    // super_admin's role (shouldn't be reachable via the UI, but guard
    // server-side too).
    const { data: targetBefore, error: fetchError } = await adminSupabase
      .from("users")
      .select("role, admin_notes")
      .eq("id", targetUserId)
      .single();

    if (fetchError) {
      console.error("[role route] fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (targetBefore?.role === "super_admin") {
      return NextResponse.json(
        { error: "Cannot change a super admin's role here" },
        { status: 400 }
      );
    }

    const newRole = grant ? "admin" : "member";

    // Refuse a no-op grant/revoke that doesn't actually change anything —
    // avoids adding a duplicate audit note.
    if (targetBefore?.role === newRole) {
      return NextResponse.json(
        { error: grant ? "This member is already an admin" : "This member is not an admin" },
        { status: 400 }
      );
    }

    // Audit note: same pattern as admin_notes elsewhere — a dated,
    // system-generated entry so there's a record of who was granted or
    // revoked admin access, and when. Falls back to email if name is
    // somehow missing on the caller's profile row.
    const auditNote: AdminNote = {
      id: `n${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      note: grant
        ? ` Granted admin access — by ${callerProfile?.name ?? caller.email}.`
        : ` Admin access revoked — by ${callerProfile?.name ?? caller.email}.`,
    };
    const updatedNotes: AdminNote[] = [auditNote, ...((targetBefore?.admin_notes as AdminNote[]) ?? [])];

    const { data, error } = await adminSupabase
      .from("users")
      .update({ role: newRole, admin_notes: updatedNotes })
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
      console.error("[role route] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("[role route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}