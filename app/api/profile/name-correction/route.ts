import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const requestedName = typeof body.requestedName === "string" ? body.requestedName.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!requestedName) {
    return NextResponse.json({ error: "A corrected name is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({
      name_correction_request: {
        requestedName,
        note,
        submittedAt: new Date().toISOString(),
      },
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to submit correction request" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}