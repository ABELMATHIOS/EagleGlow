import { Role } from "@/src/types";

// Mock session — replace with real Supabase/NextAuth session reads once the
// backend exists. Everything downstream (middleware, Navbar) reads through
// these two functions, so swapping the implementation later doesn't require
// touching any component.
export const SESSION_COOKIE = "eg_session";

export function setMockSession(role: Exclude<Role, "guest">) {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=${role}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function clearMockSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export function getMockSessionRole(): Role {
  if (typeof document === "undefined") return "guest";
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : "";
  return value === "admin" || value === "member" ? value : "guest";
}