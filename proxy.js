import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;

  // Utilisateur non authentifié → redirige vers connexion pour les routes protégées
  if (!token && pathname.startsWith("/publications/espace")) {
    return NextResponse.redirect(new URL("/publications/connexion", request.url));
  }

  // Protection de l'espace admin par rôle
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/publications/connexion", request.url));
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Utilisateur déjà connecté → redirige vers l'espace pour les pages d'auth
  if (
    token &&
    (pathname === "/publications/connexion" ||
      pathname === "/publications/inscription")
  ) {
    return NextResponse.redirect(new URL("/publications/espace", request.url));
  }

  // Autoriser le passage pour toutes les autres routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/publications/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
