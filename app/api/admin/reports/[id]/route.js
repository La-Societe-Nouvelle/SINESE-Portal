import pool from "@/config/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

/**
 * API admin pour valider ou rejeter un rapport
 * Met à jour le status de la PUBLICATION parente (pas du rapport)
 * À la validation (status=published) : copie dans footprints.reports
 */
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const client = await pool.connect();

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!["published", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide. Valeurs acceptées: published, rejected" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Récupérer le rapport et sa publication parente
    const reportResult = await client.query(
      `SELECT r.*, p.id as pub_id
       FROM publications.reports r
       JOIN publications.publications p ON p.id = r.publication_id
       WHERE r.id = $1`,
      [id]
    );

    if (reportResult.rows.length === 0) {
      await client.query("ROLLBACK");
      console.error(`Rapport non trouvé: ${id}`);
      return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 });
    }

    const report = reportResult.rows[0];

    // Mettre à jour le status de la PUBLICATION parente
    await client.query(
      `UPDATE publications.publications
       SET status = $1, updated_at = NOW(), publication_date = CASE WHEN $1 = 'published' THEN NOW() ELSE publication_date END
       WHERE id = $2`,
      [status, report.publication_id]
    );

    // Si validé, copier dans footprints.reports
    if (status === "published") {
      await client.query(
        `INSERT INTO footprints.reports
          (siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          report.siren,
          report.type,
          report.year,
          report.mime_type,
          report.file_origin,
          report.file_url,
          report.storage_type,
          report.file_name,
          report.file_size,
          report.upload_date,
        ]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true, report: { id: report.id, status } });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur mise à jour rapport:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rapport" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * API admin pour voir les détails d'un rapport
 */
export async function GET(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT r.*, p.status as publication_status, lu.denomination
       FROM publications.reports r
       JOIN publications.publications p ON p.id = r.publication_id
       JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      console.error(`Rapport non trouvé: ${id}`);
      return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ report: result.rows[0] });
  } catch (error) {
    console.error("Erreur récupération rapport:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du rapport" },
      { status: 500 }
    );
  }
}
