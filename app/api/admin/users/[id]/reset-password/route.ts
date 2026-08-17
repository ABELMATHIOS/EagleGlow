import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

// Sets a member's password directly via the Supabase admin API — no email
// is sent, so this bypasses the auth-email rate limit entirely. Used from
// AdminMembers.tsx when a member forgets their password and asks an admin
// in person (WhatsApp/etc.) rather than using the email-based reset flow.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const { newPassword } = await request.json();

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

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

    if (callerProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    // Step 2 — the caller IS an admin, so use the admin client to set the
    // target user's password directly. updateUserById does NOT send any
    // email — this is the whole point (sidesteps the 2/hour SMTP cap).
    if (!process.env.SUPABASE_SECRET_KEY) {
      console.error("[reset-password route] SUPABASE_SECRET_KEY is not set in .env.local");
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    });

    if (error) {
      console.error("[reset-password route] Supabase admin error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reset-password route] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
