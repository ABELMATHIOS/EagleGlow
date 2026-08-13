import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    const { email, phone, emergencyName, emergencyPhone, healthNotes } = body;

    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (typeof phone !== "string" || !PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    if (typeof emergencyPhone !== "string" || !PHONE_RE.test(emergencyPhone)) {
      return NextResponse.json({ error: "Invalid emergency phone" }, { status: 400 });
    }

    // NOTE: this only updates the `users` table row, not Supabase Auth's
    // own login email — changing the login email is a separate, more
    // involved flow (auth.updateUser + confirmation). Not handled here.
    const { data, error } = await supabase
      .from("users")
      .update({
        email,
        phone,
        emergency_contact_name: emergencyName ?? "",
        emergency_contact_phone: emergencyPhone,
        health_notes: healthNotes ?? "",
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