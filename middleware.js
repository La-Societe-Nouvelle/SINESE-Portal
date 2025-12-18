import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const middleware = withAuth(
  function middleware(req) {
    const hostname = req.headers.get("host") || "";
    const isPublicationSubdomain = hostname.startsWith("publication.");

    // Rewrite pour le sous-domaine publication.sinese.fr
    if (isPublicationSubdomain && !req.nextUrl.pathname.startsWith("/publications")) {
      const url = req.nextUrl.clone();
      url.pathname = `/publications${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    // If user is not authenticated and trying to access protected routes
    if (!req.nextauth.token && req.nextUrl.pathname.startsWith("/publications/espace")) {
      const redirectUrl = isPublicationSubdomain
        ? new URL("/connexion", req.url)
        : new URL("/publications/connexion", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (
      req.nextauth.token &&
      (req.nextUrl.pathname === "/publications/connexion" ||
        req.nextUrl.pathname === "/publications/inscription" ||
        (isPublicationSubdomain && (req.nextUrl.pathname === "/connexion" || req.nextUrl.pathname === "/inscription")))
    ) {
      const redirectUrl = isPublicationSubdomain
        ? new URL("/espace", req.url)
        : new URL("/publications/espace", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const hostname = req.headers.get("host") || "";
        const isPublicationSubdomain = hostname.startsWith("publication.");

        // Allow public routes
        const publicRoutes = [
          "/publications/connexion",
          "/publications/inscription",
          "/publications",
        ];

        // For subdomain, adjust routes
        if (isPublicationSubdomain) {
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
