import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const VISITOR_COOKIE = "visitor_id";
// 13 mois = durée max recommandée par la CNIL pour un cookie de mesure d'audience.
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 396;

// Pose un identifiant anonyme par visiteur, utilisé pour dédupliquer les vues
// dans stats.sinese_views sans stocker d'IP ni de compte.
function ensureVisitorCookie(request, response) {
  if (request.cookies.get(VISITOR_COOKIE)) return;

  response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
    maxAge: VISITOR_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function proxy(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;

  // Utilisateur non authentifié → redirige vers connexion pour les routes protégées
  if (!token && pathname.startsWith("/publications/espace")) {
    const response = NextResponse.redirect(new URL("/publications/connexion", request.url));
    ensureVisitorCookie(request, response);
    return response;
  }

  // Protection de l'espace admin par rôle
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const response = NextResponse.redirect(new URL("/publications/connexion", request.url));
      ensureVisitorCookie(request, response);
      return response;
    }
    if (token.role !== "admin") {
      const response = NextResponse.redirect(new URL("/", request.url));
      ensureVisitorCookie(request, response);
      return response;
    }
  }

  // Utilisateur déjà connecté → redirige vers l'espace pour les pages d'auth
  if (
    token &&
    (pathname === "/publications/connexion" ||
      pathname === "/publications/inscription")
  ) {
    const response = NextResponse.redirect(new URL("/publications/espace", request.url));
    ensureVisitorCookie(request, response);
    return response;
  }

  // Autoriser le passage pour toutes les autres routes
  const response = NextResponse.next();
  ensureVisitorCookie(request, response);
  return response;
}

export const config = {
  matcher: [
    "/publications/:path*",
    "/((?!api/auth|api/download|api/portail/download|api/serve-file|api/publications/upload-document|_next/static|_next/image|favicon.ico).*)",
  ],
};
