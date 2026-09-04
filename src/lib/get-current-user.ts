import { createClient } from "@/src/lib/supabase/server";
import type { User } from "@/src/types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  belt_id: string | null;
  role: User["role"];
  status: User["status"];
  registration_type: User["registrationType"];
  // Which program this member belongs to — used for route gating (see
  // DashboardPage's fitness redirect) and the admin Members program filter.
  program: User["program"];
  created_at: string;
  // health_notes, admin_notes, etc. deliberately omitted here — this is
  // for "who's logged in and what can they see" checks (Navbar, route
  // gating), not the full Profile page, which should query directly.
};

function toUser(row: UserRow): Pick<
  User,
  "id" | "name" | "email" | "phone" | "beltId" | "role" | "status" | "registrationType" | "program" | "createdAt"
> {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    beltId: row.belt_id ?? undefined,
    role: row.role,
    status: row.status,
    registrationType: row.registration_type,
    program: row.program,
    createdAt: row.created_at,
  };
}

// Server-side only — for use in Server Components / layouts to render
// "Welcome back, X" / role-based nav, and in Route Handlers before
// admin-only actions. Returns null if no one's logged in.
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, belt_id, role, status, registration_type, program, created_at")
    .eq("id", authUser.id)
    .single();

  if (error) throw error;
  return toUser(data as UserRow);
}