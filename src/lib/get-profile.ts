import { createClient } from "@/src/lib/supabase/server";
import type { User } from "@/src/types";

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  health_notes: string | null;
  photo_url: string | null;
  belt_id: string | null;
  status: User["status"];
  created_at: string;
};

function toProfile(row: ProfileRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    emergencyContactName: row.emergency_contact_name ?? "",
    emergencyContactPhone: row.emergency_contact_phone ?? "",
    healthNotes: row.health_notes ?? "",
    photoUrl: row.photo_url ?? undefined,
    beltId: row.belt_id ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

export type CurrentUserProfile = ReturnType<typeof toProfile>;

// Server-side only — full profile fetch for the Profile page specifically.
// Includes health_notes and emergency contact fields that getCurrentUser()
// deliberately omits (that one's for lightweight nav/gating checks).
export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, name, email, phone, emergency_contact_name, emergency_contact_phone, health_notes, photo_url, belt_id, status, created_at"
    )
    .eq("id", authUser.id)
    .single();

  if (error) throw error;
  return toProfile(data as ProfileRow);
}