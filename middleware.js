import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const middleware = withAuth(
  function middleware(req) {
    const hostname = req.headers.get("host") || "";
    const isPublicationsSubdomain = hostname.startsWith("publications.");

    // Rewrite pour le sous-domaine publications.sinese.fr
    if (isPublicationsSubdomain && !req.nextUrl.pathname.startsWith("/publications")) {
      const url = req.nextUrl.clone();
      url.pathname = `/publications${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    // If user is not authenticated and trying to access protected routes
    if (!req.nextauth.token && req.nextUrl.pathname.startsWith("/publications/espace")) {
      const redirectUrl = isPublicationsSubdomain
        ? new URL("/connexion", req.url)
        : new URL("/publications/connexion", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (
      req.nextauth.token &&
      (req.nextUrl.pathname === "/publications/connexion" ||
        req.nextUrl.pathname === "/publications/inscription" ||
        (isPublicationsSubdomain && (req.nextUrl.pathname === "/connexion" || req.nextUrl.pathname === "/inscription")))
    ) {
      const redirectUrl = isPublicationsSubdomain
        ? new URL("/espace", req.url)
        : new URL("/publications/espace", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const hostname = req.headers.get("host") || "";
        const isPublicationsSubdomain = hostname.startsWith("publications.");

        // Allow public routes
        const publicRoutes = [
          "/publications/connexion",
          "/publications/inscription",
          "/publications",
        ];

        // For subdomain, adjust routes
        if (isPublicationsSubdomain) {
          const subdomainPublicRoutes = ["/connexion", "/inscription", "/"];
          if (subdomainPublicRoutes.includes(req.nextUrl.pathname)) {
            return true;
          }
          // Require authentication for /espace routes on subdomain
          if (req.nextUrl.pathname.startsWith("/espace")) {
            return !!token;
          }
        }

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
