"use server";

import pool from "@/config/db";
import { requireAdmin } from "@/_libs/auth";

export async function getPendingReports() {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const result = await pool.query(
    `SELECT r.id, r.siren, r.type, r.year, r.file_url, r.file_name,
            r.file_size, r.file_origin, r.mime_type, r.storage_type,
            r.created_at, r.publication_id,
            p.status as publication_status, lu.denomination
     FROM publications.reports r
     JOIN publications.publications p ON p.id = r.publication_id
     JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
     WHERE p.status = 'pending'
     ORDER BY r.created_at DESC`
  );
  return { reports: result.rows };
}

export async function getAdminReport(id) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const result = await pool.query(
    `SELECT r.*, p.status as publication_status, lu.denomination
     FROM publications.reports r
     JOIN publications.publications p ON p.id = r.publication_id
     JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
     WHERE r.id = $1`,
    [id]
  );

  if (result.rows.length === 0) return { error: "Rapport non trouvé." };
  return { report: result.rows[0] };
}

export async function updateReportStatus(id, status) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  if (!["published", "rejected"].includes(status)) {
    return { error: "Statut invalide. Valeurs acceptées: published, rejected." };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const reportResult = await client.query(
      `SELECT r.*, p.id as pub_id
       FROM publications.reports r
       JOIN publications.publications p ON p.id = r.publication_id
       WHERE r.id = $1`,
      [id]
    );

    if (reportResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return { error: "Rapport non trouvé." };
    }

    const report = reportResult.rows[0];

    await client.query(
      `UPDATE publications.publications
       SET status = $1, updated_at = NOW(),
           publication_date = CASE WHEN $1 = 'published' THEN NOW() ELSE publication_date END
       WHERE id = $2`,
      [status, report.publication_id]
    );

    if (status === "published") {
      await client.query(
        `INSERT INTO footprints.reports
          (siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [report.siren, report.type, report.year, report.mime_type, report.file_origin,
         report.file_url, report.storage_type, report.file_name, report.file_size, report.upload_date]
      );
    }

    await client.query("COMMIT");
    return { success: true, report: { id: report.id, status } };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur mise à jour rapport:", error);
    return { error: "Erreur lors de la mise à jour du rapport." };
  } finally {
    client.release();
  }
}
