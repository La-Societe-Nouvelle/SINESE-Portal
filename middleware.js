import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const middleware = withAuth(
  function middleware(req) {
    // If user is not authenticated and trying to access protected routes
    if (!req.nextauth.token && req.nextUrl.pathname.startsWith("/publications/espace")) {
      const redirectUrl = new URL("/publications/connexion", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (
      req.nextauth.token &&
      (req.nextUrl.pathname === "/publications/connexion" ||
        req.nextUrl.pathname === "/publications/inscription")
    ) {
      const redirectUrl = new URL("/publications/espace", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        const publicRoutes = [
          "/publications/connexion",
          "/publications/inscription",
          "/publications",
        ];

        if (publicRoutes.includes(req.nextUrl.pathname)) {
          return true;
        }

        // Require authentication for /publications/espace routes
        if (req.nextUrl.pathname.startsWith("/publications/espace")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/publications/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
