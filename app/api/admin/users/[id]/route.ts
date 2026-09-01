import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

// Permanently deletes a member: removes their row from the `users` table
// AND their Supabase Auth account. This is separate from the Decline /
// Withdraw actions (which just set status to 'withdrawn' and keep the
// record) — this is the "gone entirely, no trace" action, used when the
// admin explicitly wants no data kept at all.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    // Step 1 — verify the CALLER is an admin, using the regular server
    // client (respects RLS: they can only read their own row).
    const supabase = await createClient();
    const {
      data: { user: caller },
    } = await supabase.auth.getUser();

    if (!caller) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", caller.id)
      .single();

    const ADMIN_ROLES = ["admin", "super_admin"];
    if (!ADMIN_ROLES.includes(callerProfile?.role ?? "")) {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    // Guard against an admin deleting their own account through this route.
    if (caller.id === targetUserId) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error("[user delete route] SUPABASE_SECRET_KEY is not set in .env.local");
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();

    // Step 2 — delete the `users` table row first. If this fails, we bail
    // before touching Auth, so we don't end up with an Auth account whose
    // profile row is already gone.
    const { error: dbError } = await adminSupabase
      .from("users")
      .delete()
      .eq("id", targetUserId);

    if (dbError) {
      console.error("[user delete route] Failed to delete users row:", dbError);
      return NextResponse.json({ error: dbError.message, details: dbError }, { status: 500 });
    }

    // Step 3 — delete the Supabase Auth account itself. If this fails, the
    // profile row is already gone but the Auth account remains — log it
    // clearly so it can be cleaned up manually, but don't fail the whole
    // request since the member is already effectively removed from the app.
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(targetUserId);

    if (authError) {
      console.error(
        "[user delete route] users row deleted, but Auth account deletion failed:",
        authError
      );
      return NextResponse.json(
        {
          warning:
            "Member record deleted, but their login account could not be removed. Contact support if this persists.",
          details: authError,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[user delete route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error", stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}