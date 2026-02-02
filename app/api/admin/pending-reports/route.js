import pool from "@/config/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

/**
 * API admin pour récupérer les rapports en attente de validation
 * Lit depuis publications.reports (table de staging)
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
              r.status, r.created_at, r.user_id,
              u.email as user_email
         FROM publications.reports r
         LEFT JOIN publications.users u ON u.id = r.user_id
        WHERE r.status = 'pending'
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
