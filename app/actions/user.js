"use server";

import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import pool from "@/config/db";
import { authOptions } from "@/api/auth/[...nextauth]/route";

export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const result = await pool.query(
    `SELECT id, email, first_name, last_name, profile, role, created_at
     FROM publications.users WHERE id = $1`,
    [session.user.id]
  );

  if (result.rows.length === 0) return null;

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profile: user.profile,
    role: user.role,
    createdAt: user.created_at,
  };
}

export async function updateUserProfile({ firstName, lastName, profile }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Non autorisé. Veuillez vous connecter." };

  if (!firstName || !lastName || !profile) {
    return { error: "Tous les champs sont requis." };
  }

  const validProfiles = ["expert-comptable", "entreprise", "autre"];
  if (!validProfiles.includes(profile)) {
    return { error: "Profil invalide. Valeurs acceptées: expert-comptable, entreprise, autre." };
  }

  const result = await pool.query(
    `UPDATE publications.users
     SET first_name = $1, last_name = $2, profile = $3
     WHERE id = $4
     RETURNING id, email, first_name, last_name, profile, role`,
    [firstName, lastName, profile, session.user.id]
  );

  if (result.rows.length === 0) return { error: "Utilisateur non trouvé." };

  const u = result.rows[0];
  return {
    success: true,
    user: {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      profile: u.profile,
      role: u.role,
    },
  };
}

export async function updateUserPassword({ currentPassword, newPassword }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Non autorisé. Veuillez vous connecter." };

  if (!currentPassword || !newPassword) {
    return { error: "Le mot de passe actuel et le nouveau mot de passe sont requis." };
  }

  if (newPassword.length < 8) {
    return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  }

  const userResult = await pool.query(
    "SELECT id, password FROM publications.users WHERE id = $1",
    [session.user.id]
  );

  if (userResult.rows.length === 0) return { error: "Utilisateur non trouvé." };

  const isPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
  if (!isPasswordValid) return { error: "Le mot de passe actuel est incorrect." };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query(
    "UPDATE publications.users SET password = $1 WHERE id = $2",
    [hashedPassword, session.user.id]
  );

  return { success: true };
}
