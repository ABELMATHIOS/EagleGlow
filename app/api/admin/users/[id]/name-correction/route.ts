import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const ADMIN_ROLES = ["admin", "super_admin"];
if (!ADMIN_ROLES.includes(adminProfile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const action = body.action;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const adminSupabase = createAdminClient(); // bypasses RLS — caller already verified admin above

  if (action === "approve") {
    const { data: target, error: fetchError } = await adminSupabase
      .from("users")
      .select("name_correction_request")
      .eq("id", id)
      .single();

    if (fetchError || !target?.name_correction_request) {
      return NextResponse.json({ error: "No pending correction request" }, { status: 404 });
    }

    const { error: updateError } = await adminSupabase
      .from("users")
      .update({
        name: target.name_correction_request.requestedName,
        name_correction_request: null,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to approve name correction" }, { status: 500 });
    }
  } else {
    const { error: updateError } = await adminSupabase
      .from("users")
      .update({ name_correction_request: null })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to reject name correction" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}