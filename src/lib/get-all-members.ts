import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { User } from "@/src/types";

type MemberRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: User["role"];
  status: User["status"];
  registration_type: User["registrationType"];
  previous_belt: string | null;
  year_joined: string | null;
  gap_reason: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  health_notes: string | null;
  photo_url: string | null;
  belt_id: string | null;
  admin_notes: User["adminNotes"] | null;
  name_correction_request: User["nameCorrectionRequest"];
  created_at: string;
};

function toUser(row: MemberRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    sex: "male", // not surfaced in AdminMembers — placeholder until the type is loosened
    emergencyContactName: row.emergency_contact_name ?? undefined,
    emergencyContactPhone: row.emergency_contact_phone ?? undefined,
    healthNotes: row.health_notes ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    beltId: row.belt_id ?? undefined,
    role: row.role,
    status: row.status,
    registrationType: row.registration_type,
    previousBelt: row.previous_belt ?? undefined,
    yearJoined: row.year_joined ?? undefined,
    gapReason: row.gap_reason ?? undefined,
    adminNotes: row.admin_notes ?? [],
    nameCorrectionRequest: row.name_correction_request ?? null,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS =
  "id, name, email, phone, role, status, registration_type, previous_belt, year_joined, gap_reason, emergency_contact_name, emergency_contact_phone, health_notes, photo_url, belt_id, admin_notes, name_correction_request, created_at";

// Admin-only (admin or super_admin). Verifies the caller before using the
// service-role client to read every non-admin member — RLS would otherwise
// only let a user read their own row. Excludes admin/super_admin rows so
// they never show up in the regular member list or exports.
export async function getAllMembers(): Promise<User[]> {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) return [];

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfile?.role !== "admin" && callerProfile?.role !== "super_admin") return [];

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("users")
    .select(SELECT_COLUMNS)
    .not("role", "in", '("admin","super_admin")')
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as MemberRow[]).map(toUser);
}

// Super_admin-only. Returns everyone with role admin or super_admin — the
// inverse of getAllMembers() — so a super_admin can see (and revoke) who
// currently has elevated access.
export async function getAllAdmins(): Promise<User[]> {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) return [];

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfile?.role !== "super_admin") return [];

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("users")
    .select(SELECT_COLUMNS)
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as MemberRow[]).map(toUser);
}

// Returns the logged-in caller's own role, or null if not signed in.
// Used to gate super_admin-only UI (Grant/Revoke Admin Access) without
// re-fetching the full member list.
export async function getCallerRole(): Promise<User["role"] | null> {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) return null;

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();

  return callerProfile?.role ?? null;
}