import { betterFetch } from "@better-fetch/fetch";
import type { Session, User } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check for session token (Optimistic check)
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  // 2. Define Route Guards
  const publicRoutes = ["/sign-in", "/sign-up"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const protectedRoutes = [
    "/dashboard",
    "/catalog",
    "/inventory",
    "/pos",
    "/expenses",
    "/reservations",
    "/sales",
    "/settings",
    "/admin",
  ];

  // Also protect root if it redirects to dashboard
  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/";

  // 3. Proxy Logic: Intercept and Redirect
  if (!sessionToken && isProtectedRoute) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 4. Session Verification & RBAC via Proxy
  if (sessionToken) {
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL || request.nextUrl.origin;

      const { data } = await betterFetch<{ session: Session; user: User }>(
        "/api/auth/get-session",
        {
          baseURL,
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        },
      );

      if (!data) {
        if (isProtectedRoute) {
          return NextResponse.redirect(new URL("/sign-in", request.url));
        }
      } else {
        // Valid session
        const user = data.user;
        const userRole = (user as any).role || "user";

        // Redirect logged-in users away from auth pages
        if (isPublicRoute) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // RBAC Logic
        if (userRole === "seller") {
          const sellerAllowedRoutes = [
            "/dashboard",
            "/expenses",
            "/catalog",
            "/inventory",
            "/pos",
            "/sales",
            "/log-out",
          ];
          const isSellerAllowed = sellerAllowedRoutes.some((route) =>
            pathname.startsWith(route),
          );
          const adminOnlyRoutes = ["/settings", "/admin"];
          const isAdminRoute = adminOnlyRoutes.some((route) =>
            pathname.startsWith(route),
          );

          if (
            isAdminRoute ||
            (!isSellerAllowed && isProtectedRoute && pathname !== "/")
          ) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        }

        // Default User RBAC
        const adminOnlyRoutes = ["/settings", "/admin"];
        const isAdminRoute = adminOnlyRoutes.some((route) =>
          pathname.startsWith(route),
        );
        if (isAdminRoute && userRole !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    } catch (error) {
      console.error("Proxy auth error:", error);
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  // 5. Forward request if allowed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).)"],
};
