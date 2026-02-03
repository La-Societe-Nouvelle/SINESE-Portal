import pool from "@/config/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

/**
 * API admin pour récupérer les rapports en attente de validation
 * Filtre par le status de la publication parente (p.status = 'pending')
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  try {
    const result = await pool.query(
      `SELECT r.id, r.siren, r.type, r.year, r.file_url, r.file_name,
              r.file_size, r.file_origin, r.mime_type, r.storage_type,
              r.created_at, r.publication_id,
              p.status as publication_status,
              lu.denomination
         FROM publications.reports r
         JOIN publications.publications p ON p.id = r.publication_id
         JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
        WHERE p.status = 'pending'
        ORDER BY r.created_at DESC`
    );

    return NextResponse.json({ reports: result.rows });
  } catch (error) {
    console.error("Erreur récupération rapports en attente:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rapports" },
      { status: 500 }
    );
  }
}
