import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/src/lib/auth";

// Mock gating — reads the same cookie src/lib/auth.ts sets client-side.
// Once real auth exists, swap the cookie read below for a real session
// check (e.g. Supabase's server client); everything else here — the route
// matcher and the role rules — stays the same.
const MEMBER_ROUTES = ["/dashboard", "/profile"];
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(SESSION_COOKIE)?.value ?? "guest";

  const needsAdmin = ADMIN_ROUTES.some((p) => pathname.startsWith(p));
  const needsMember = MEMBER_ROUTES.some((p) => pathname.startsWith(p));

  if (needsAdmin && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (needsMember && role !== "member" && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*"],
};