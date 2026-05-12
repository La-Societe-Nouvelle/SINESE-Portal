import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Utilisateur non authentifié → redirige vers connexion
  if (!token && request.nextUrl.pathname.startsWith("/publications/espace")) {
    return NextResponse.redirect(new URL("/publications/connexion", request.url));
  }

  // Utilisateur déjà connecté → redirige vers l'espace
  if (
    token &&
    (request.nextUrl.pathname === "/publications/connexion" ||
      request.nextUrl.pathname === "/publications/inscription")
  ) {
    return NextResponse.redirect(new URL("/publications/espace", request.url));
  }
}

export const config = {
  matcher: [
    "/publications/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
