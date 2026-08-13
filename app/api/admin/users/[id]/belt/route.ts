import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { beltId } = body;

    if (typeof beltId !== "string" || !beltId) {
      return NextResponse.json({ error: "beltId is required" }, { status: 400 });
    }

    // Step 1 — verify the CALLER is an admin, using the regular server
    // client (respects RLS: they can only read their own row, which is
    // exactly what we need to check their own role). Same pattern as the
    // approve route.
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
      console.error("[belt route] SUPABASE_SECRET_KEY is not set in .env.local");
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();

    // Confirm the target belt actually exists before writing the FK —
    // avoids silently storing a bad belt_id if the client sent a stale id.
    const { data: belt, error: beltError } = await adminSupabase
      .from("belts")
      .select("id, sort_order")
      .eq("id", beltId)
      .single();

    if (beltError || !belt) {
      console.error("[belt route] belt lookup failed", { beltId, beltError });
      return NextResponse.json(
        { error: "Unknown belt", debugBeltIdSent: beltId, debugSupabaseError: beltError },
        { status: 400 }
      );
    }

    // Reaching the highest belt (max sort_order) = graduated, per project
    // rule — flip status automatically, same as the old mock confirmPromote.
    const { data: maxOrderRow } = await adminSupabase
      .from("belts")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const isTopBelt = maxOrderRow && belt.sort_order === maxOrderRow.sort_order;

    const update: { belt_id: string; status?: string } = { belt_id: beltId };
    if (isTopBelt) update.status = "graduated";

    const { data, error } = await adminSupabase
      .from("users")
      .update(update)
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
      console.error("[belt route] Supabase update error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("[belt route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error", stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}