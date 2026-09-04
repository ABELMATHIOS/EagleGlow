import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const { program, beltId } = await request.json();

    if (program !== "wushu" && program !== "fitness") {
      return NextResponse.json({ error: "Invalid program value" }, { status: 400 });
    }

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

    const ALLOWED_CALLER_ROLES = ["admin", "super_admin"];
    if (!ALLOWED_CALLER_ROLES.includes(callerProfile?.role ?? "")) {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const adminSupabase = createAdminClient();

    // Wushu -> Fitness: only the program flag changes. belt_id is left
    // untouched (not cleared) so it's still there if they ever switch back.
    // Fitness -> Wushu: requires a beltId from the caller (picked/prefilled
    // in the UI) — this actually sets belt_id, since a Fitness member may
    // have never had one.
    const update: Record<string, unknown> = { program };
    if (program === "wushu") {
      if (!beltId) {
        return NextResponse.json(
          { error: "beltId is required when switching to Wushu" },
          { status: 400 }
        );
      }
      update.belt_id = beltId;
    }

    const { data, error } = await adminSupabase
      .from("users")
      .update(update)
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
      console.error("[program route] Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("[program route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}