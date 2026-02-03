import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../auth/[...nextauth]/route";

/**
 * Endpoint de rejet d'une publication
 * 
 * Met simplement le statut à 'rejected' sans copier dans footprints
 */
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await pool.query(
      `UPDATE publications.publications
       SET status = 'rejected', 
           updated_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING id, status`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Publication introuvable ou déjà traitée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Publication rejetée",
      publication: result.rows[0],
    });

  } catch (error) {
    console.error("Erreur lors du rejet:", error);
    return NextResponse.json(
      { error: "Erreur lors du rejet de la publication" },
      { status: 500 }
    );
  }
}
