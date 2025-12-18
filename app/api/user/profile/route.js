import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import pool from "@/config/db";
import { authOptions } from "@/api/auth/[...nextauth]/route";

/**
 * GET /api/user/profile
 * Fetch current user's profile information
 */
export async function GET(request) {
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

    // Fetch user data (excluding password)
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, profile, role, created_at
       FROM publications.users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé." },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Format response with camelCase keys
    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profile: user.profile,
      role: user.role,
      createdAt: user.created_at,
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update current user's profile information
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
    const { firstName, lastName, profile } = await request.json();

    // Validation
    if (!firstName || !lastName || !profile) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    // Validate profile value
    const validProfiles = ['expert-comptable', 'entreprise', 'autre'];
    if (!validProfiles.includes(profile)) {
      return NextResponse.json(
        { error: "Profil invalide. Valeurs acceptées: expert-comptable, entreprise, autre." },
        { status: 400 }
      );
    }

    // Update user profile (email is not modifiable)
    const result = await pool.query(
      `UPDATE publications.users
       SET first_name = $1, last_name = $2, profile = $3
       WHERE id = $4
       RETURNING id, email, first_name, last_name, profile, role`,
      [firstName, lastName, profile, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé." },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        profile: updatedUser.profile,
        role: updatedUser.role,
      },
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil." },
      { status: 500 }
    );
  }
}
