"use server";

import bcrypt from "bcrypt";
import pool from "@/config/db";
import { getSession } from "@/_libs/auth";
import {
  ErrorCodes, 
  createError,
  createNotFoundError,
  createUnauthorizedError 
} from "@/_libs/errors";

export async function getUserProfile() {
  const session = await getSession();
  if (!session?.user?.id) {
    return createUnauthorizedError();
  }

  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, profile, role, created_at
       FROM publications.users WHERE id = $1`,
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return createNotFoundError("Utilisateur", session.user.id);
    }

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
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return createError(ErrorCodes.DATABASE_ERROR, {
      details: error.message,
    });
  }
}

export async function updateUserProfile({ firstName, lastName, profile }) {
  const session = await getSession();
  if (!session?.user?.id) {
    return createUnauthorizedError();
  }

  // Validation des champs
  if (!firstName || !lastName || !profile) {
    return createError(ErrorCodes.MISSING_REQUIRED_FIELD, {
      message: "Tous les champs sont requis.",
    });
  }

  const validProfiles = ["expert-comptable", "entreprise", "autre"];
  if (!validProfiles.includes(profile)) {
    return createError(ErrorCodes.INVALID_INPUT, {
      message: "Profil invalide. Valeurs acceptées: expert-comptable, entreprise, autre.",
      field: "profile",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE publications.users
       SET first_name = $1, last_name = $2, profile = $3
       WHERE id = $4
       RETURNING id, email, first_name, last_name, profile, role`,
      [firstName, lastName, profile, session.user.id]
    );

    if (result.rows.length === 0) {
      return createNotFoundError("Utilisateur", session.user.id);
    }

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
  } catch (error) {
    console.error("Error updating user profile:", error);
    return createError(ErrorCodes.DATABASE_ERROR, {
      details: error.message,
    });
  }
}

export async function updateUserPassword({ currentPassword, newPassword }) {
  const session = await getSession();
  if (!session?.user?.id) {
    return createUnauthorizedError();
  }

  // Validation des champs
  if (!currentPassword || !newPassword) {
    return createError(ErrorCodes.MISSING_REQUIRED_FIELD, {
      message: "Le mot de passe actuel et le nouveau mot de passe sont requis.",
    });
  }

  if (newPassword.length < 8) {
    return createError(ErrorCodes.VALIDATION_ERROR, {
      message: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      field: "newPassword",
    });
  }

  try {
    const userResult = await pool.query(
      "SELECT id, password FROM publications.users WHERE id = $1",
      [session.user.id]
    );

    if (userResult.rows.length === 0) {
      return createNotFoundError("Utilisateur", session.user.id);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isPasswordValid) {
      return createError(ErrorCodes.INVALID_CREDENTIALS, {
        message: "Le mot de passe actuel est incorrect.",
        field: "currentPassword",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE publications.users SET password = $1 WHERE id = $2",
      [hashedPassword, session.user.id]
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating user password:", error);
    return createError(ErrorCodes.DATABASE_ERROR, {
      details: error.message,
    });
  }
}
