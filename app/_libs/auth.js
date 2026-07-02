import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { createUnauthorizedError, createForbiddenError } from "@/_libs/errors";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return createUnauthorizedError();
  if (session.user.role !== "admin") {
    return createForbiddenError("Accès réservé aux administrateurs.");
  }
  return { session };
}
