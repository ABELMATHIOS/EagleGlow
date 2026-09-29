import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,}$/;
const ADMIN_ROLES = ["admin", "super_admin"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: caller } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!ADMIN_ROLES.includes(caller?.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const emergencyName = String(body.emergencyName ?? "").trim();
  const emergencyPhone = String(body.emergencyPhone ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }
  if (!PHONE_RE.test(emergencyPhone)) {
    return NextResponse.json({ error: "Invalid emergency phone" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: target, error: targetError } = await admin
    .from("users")
    .select("role, email")
    .eq("id", id)
    .single();
  if (targetError || !target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Only a super_admin may change another admin's contact details.
  if (ADMIN_ROLES.includes(target.role) && caller?.role !== "super_admin") {
    return NextResponse.json({ error: "Only a super admin can edit an admin" }, { status: 403 });
  }

  const emailChanged = email.toLowerCase() !== String(target.email).toLowerCase();

  // 1) Login email first (Supabase Auth). email_confirm: true applies it
  //    immediately, with no confirmation email sent.
  if (emailChanged) {
    const { error: authError } = await admin.auth.admin.updateUserById(id, {
      email,
      email_confirm: true,
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
  }

  // 2) Then the users table copy.
  const { data, error } = await admin
    .from("users")
    .update({
      email,
      phone,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    // Roll the login email back so the two tables don't end up different.
    if (emailChanged) {
      await admin.auth.admin.updateUserById(id, { email: target.email, email_confirm: true });
    }
    return NextResponse.json({ error: error?.message ?? "Failed to update member" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}