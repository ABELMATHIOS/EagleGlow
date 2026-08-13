import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

// One endpoint for every status transition an admin can make from
// AdminMembers.tsx (Decline, Suspend, Reactivate, Mark Serving). Approve
// stays on its own dedicated route because it also flips role -> member,
// not just status.
const ALLOWED_STATUSES = ["active", "paused", "withdrawn", "serving", "graduated"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { status } = body;

    if (typeof status !== "string" || !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Step 1 — verify the CALLER is an admin. Same pattern as approve/belt.
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

    if (callerProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error("[status route] SUPABASE_SECRET_KEY is not set in .env.local");
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("users")
      .update({ status })
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
      console.error("[status route] Supabase update error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("[status route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error", stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}