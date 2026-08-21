import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const MEMBER_ROUTES = ["/dashboard", "/profile", "/tutorials"];
const ADMIN_ROUTES = ["/admin"];
const PROTECTED_ROUTES = [...MEMBER_ROUTES, ...ADMIN_ROUTES];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_ROUTES.some((p) => pathname.startsWith(p));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Only hit the DB for role/status when we actually need to gate on it —
  // skip the extra query on public pages.
  if (needsAuth && user) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {}, // already handled by updateSession above
        },
      }
    );

    const { data: profile } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", user.id)
      .single();

        // Admin routes: role must be admin or super_admin, full stop.
    const ADMIN_ROLES = ["admin", "super_admin"];
    if (needsAdmin && !ADMIN_ROLES.includes(profile?.role ?? "")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Member routes (dashboard/profile): status must be active, graduated,
    // or serving — all three mean the member is in good standing and has
    // full access. Only pending/paused/withdrawn get gated to /auth/pending.
    // Admins and super_admins bypass the approval gate entirely.
    const APPROVED_STATUSES = ["active", "graduated", "serving"];
    const isApproved =
      APPROVED_STATUSES.includes(profile?.status ?? "") || ADMIN_ROLES.includes(profile?.role ?? "");
    if (!needsAdmin && !isApproved) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/pending";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*", "/tutorials/:path*"],
};