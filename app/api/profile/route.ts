import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

const PHONE_RE = /^[+\d][\d\s-]{6,}$/;

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await request.json();
    // `email` may still be sent by the profile form, but it is ignored on
    // purpose: the login email lives in Supabase Auth and is changed by an
    // admin only. See the sync trigger in the database.
    const { phone, emergencyName, emergencyPhone, healthNotes, avatar } = body;

    if (typeof phone !== "string" || !PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    if (typeof emergencyPhone !== "string" || !PHONE_RE.test(emergencyPhone)) {
      return NextResponse.json({ error: "Invalid emergency phone" }, { status: 400 });
    }
    if (avatar !== null && avatar !== undefined && typeof avatar !== "string") {
      return NextResponse.json({ error: "Invalid photo" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        phone,
        emergency_contact_name: emergencyName ?? "",
        emergency_contact_phone: emergencyPhone,
        health_notes: healthNotes ?? "",
        photo_url: avatar ?? null,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[profile PUT] Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("[profile PUT] Unexpected crash:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}