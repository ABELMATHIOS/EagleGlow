import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    // Step 1 — verify the CALLER is an admin, using the regular server
    // client (respects RLS: they can only read their own row, which is
    // exactly what we need to check their own role).
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

    // Step 2 — the caller IS an admin, so use the admin client (bypasses
    // RLS) to actually approve the target user.
    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error("[approve route] SUPABASE_SECRET_KEY is not set in .env.local");
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();

    // Determine the belt to assign on approval, so a returning/training
    // member's self-reported belt takes effect immediately rather than
    // requiring the admin to separately remember to use "Promote Belt"
    // after approving. Only applied if the member doesn't already have a
    // belt_id set (e.g. re-approving someone shouldn't reset a belt an
    // admin has since adjusted by hand).
    const { data: target } = await adminSupabase
      .from("users")
      .select("registration_type, previous_belt, belt_id")
      .eq("id", targetUserId)
      .single();

    const update: Record<string, unknown> = { status: "active", role: "member" };

    if (target && !target.belt_id) {
      const { data: belts } = await adminSupabase
        .from("belts")
        .select("id, name, order")
        .order("order", { ascending: true });

      if (belts && belts.length > 0) {
        const lowestBelt = belts[0]; // order ascending, so [0] = White
        const isReturning =
          target.registration_type === "training" || target.registration_type === "returning";
        const matchedBelt = isReturning
          ? belts.find((b) => b.name === target.previous_belt)
          : undefined;

        update.belt_id = (matchedBelt ?? lowestBelt).id;
      }
    }

    const { data, error } = await adminSupabase
      .from("users")
      .update(update)
      .eq("id", targetUserId)
      .select()
      .single();

    if (error) {
      console.error("[approve route] Supabase update error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("[approve route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error", stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}