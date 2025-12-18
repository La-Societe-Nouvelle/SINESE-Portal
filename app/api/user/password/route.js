import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import pool from "@/config/db";
import { authOptions } from "@/api/auth/[...nextauth]/route";

/**
 * PUT /api/user/password
 * Update user password with current password verification
 */
export async function PUT(request) {
  try {
    // Verify session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { currentPassword, newPassword } = await request.json();

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Le mot de passe actuel et le nouveau mot de passe sont requis." },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    // Fetch current user with password
    const userResult = await pool.query(
      "SELECT id, password FROM publications.users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé." },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Le mot de passe actuel est incorrect." },
        { status: 400 }
      );
    }

    // Hash new password (using bcrypt rounds of 10, consistent with register route)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE publications.users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    return NextResponse.json({
      success: true,
      message: "Mot de passe mis à jour avec succès.",
    });

  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du mot de passe." },
      { status: 500 }
    );
  }
}
