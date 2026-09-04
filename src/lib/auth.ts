import { createClient } from "@/src/lib/supabase/client";

// Real Supabase Auth — replaces the mock eg_session cookie functions.
// signUp/signIn/signOut all run client-side (they need to talk to
// Supabase's auth endpoint directly); middleware.ts + server.ts handle
// reading the resulting session server-side.

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  sex: "male" | "female";
  dateOfBirth?: string;
  heightCm?: string;
  weightKg?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthNotes?: string;
  // Which program this registration is for — drives the users.program
  // column read by the admin Members program filter / switch-program action.
  program: "wushu" | "fitness";
  registrationType: "new" | "existing";
  previousBelt?: string;
  yearJoined?: string;
};

export async function signUp(input: SignUpInput) {
  const supabase = createClient();

  // Everything under `data` lands in auth.users.raw_user_meta_data, which
  // the on_auth_user_created trigger reads to populate public.users.
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
        phone: input.phone,
        sex: input.sex,
        dateOfBirth: input.dateOfBirth,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        emergencyContactName: input.emergencyContactName,
        emergencyContactPhone: input.emergencyContactPhone,
        healthNotes: input.healthNotes,
        program: input.program,
        registrationType: input.registrationType,
        previousBelt: input.previousBelt,
        yearJoined: input.yearJoined,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Sends a real Supabase password-reset email. The link in that email lands
// the member back on /auth/reset-password with a recovery session, where
// they set a new password. Always resolves without throwing on a
// not-found email — confirming/denying an account exists by email is an
// account-enumeration risk, so the caller shows the same "check your
// email" message either way.
export async function sendPasswordReset(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

// Client-side role read — for components like Navbar that run in the
// browser and just need "guest / member / admin" to decide what to show.
// Relies on the "Users can read their own row" RLS policy.
export async function getCurrentSessionRole(): Promise<"guest" | "member" | "admin" | "super_admin"> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "guest";

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return (data?.role as "guest" | "member" | "admin" | "super_admin") ?? "guest";
}
// Client-side role + program read — used right after login to decide
// which dashboard to send the member to (Wushu vs Fitness), without a
// second separate query.
export async function getCurrentSessionInfo(): Promise<{
  role: "guest" | "member" | "admin" | "super_admin";
  program: "wushu" | "fitness" | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { role: "guest", program: null };

  const { data } = await supabase
    .from("users")
    .select("role, program")
    .eq("id", user.id)
    .single();

  return {
    role: (data?.role as "guest" | "member" | "admin" | "super_admin") ?? "guest",
    program: (data?.program as "wushu" | "fitness") ?? null,
  };
}