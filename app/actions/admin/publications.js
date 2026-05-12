"use server";

import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé." };
  if (session.user.role !== "admin") return { error: "Accès réservé aux administrateurs." };
  return { session };
}

export async function getPendingPublications() {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const { rows } = await pool.query(
    `SELECT p.id, p.year, p.status, p.created_at, p.updated_at,
            lu.id as legal_unit_id, lu.denomination, lu.siren,
            u.id as user_id, u.email as user_email
     FROM publications.publications p
     JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     JOIN publications.users u ON u.id = ulu.user_id
     WHERE p.status = 'pending'
     ORDER BY p.created_at DESC`
  );
  return { publications: rows };
}

export async function getPublicationsStats() {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const [statsRes, recentRes, timelineRes, usersRes, legalUnitsRes] = await Promise.all([
    pool.query(`SELECT status, COUNT(*) as count FROM publications.publications GROUP BY status`),
    pool.query(
      `SELECT * FROM (
        SELECT DISTINCT ON (p.id) p.id, p.year, p.status, p.created_at, p.updated_at,
               lu.denomination, lu.siren, u.email as user_email
        FROM publications.publications p
        JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
        JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
        JOIN publications.users u ON u.id = ulu.user_id
        ORDER BY p.id, u.id
      ) AS unique_pubs ORDER BY created_at DESC LIMIT 50`
    ),
    pool.query(
      `SELECT DATE_TRUNC('month', created_at) as month, status, COUNT(*) as count
       FROM publications.publications
       WHERE created_at >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at), status
       ORDER BY month DESC`
    ),
    pool.query(
      `SELECT COUNT(DISTINCT u.id) as total_users FROM publications.users u
       JOIN publications.user_legal_unit ulu ON ulu.user_id = u.id`
    ),
    pool.query(`SELECT COUNT(*) as total_legal_units FROM publications.legal_units`),
  ]);

  return {
    byStatus: statsRes.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, { draft: 0, pending: 0, published: 0 }),
    recentPublications: recentRes.rows,
    timeline: timelineRes.rows,
    totalUsers: parseInt(usersRes.rows[0]?.total_users || 0),
    totalLegalUnits: parseInt(legalUnitsRes.rows[0]?.total_legal_units || 0),
  };
}

export async function getAdminPublication(id) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const { rows } = await pool.query(
    `SELECT p.id, p.year, p.status, p.created_at, p.updated_at,
            p.period_start, p.period_end, p.data, p.publication_date,
            lu.id as legal_unit_id, lu.denomination, lu.siren,
            (SELECT u.email FROM publications.users u
             JOIN publications.user_legal_unit ulu2 ON ulu2.user_id = u.id
             WHERE ulu2.legal_unit_id = lu.id LIMIT 1) as user_email
     FROM publications.publications p
     JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
     WHERE p.id = $1`,
    [id]
  );

  if (rows.length === 0) return { error: "Publication introuvable." };

  const reportRes = await pool.query(
    `SELECT id, siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date
     FROM publications.reports WHERE publication_id = $1 ORDER BY upload_date DESC LIMIT 1`,
    [id]
  );

  return { publication: { ...rows[0], report: reportRes.rows[0] || null } };
}

export async function approvePublication(id) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pubResult = await client.query(
      `SELECT p.id, p.legal_unit_id, p.year, p.data, p.status, lu.siren, lu.denomination
       FROM publications.publications p
       JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
       WHERE p.id = $1`,
      [id]
    );

    if (pubResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return { error: "Publication introuvable." };
    }

    const publication = pubResult.rows[0];
    if (publication.status === "published") {
      await client.query("ROLLBACK");
      return { error: "Cette publication est déjà approuvée." };
    }

    await client.query(
      `UPDATE publications.publications SET status = 'published', updated_at = NOW(), publication_date = NOW() WHERE id = $1`,
      [id]
    );

    const reportResult = await client.query(
      `SELECT siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date
       FROM publications.reports WHERE publication_id = $1 ORDER BY upload_date DESC LIMIT 1`,
      [id]
    );

    if (reportResult.rows.length > 0) {
      const report = reportResult.rows[0];
      const footprintStorageType = report.storage_type === "external" ? "ovh" : report.storage_type;
      await client.query(
        `INSERT INTO footprints.reports
          (siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         ON CONFLICT (siren, year, type) DO UPDATE SET
           mime_type = EXCLUDED.mime_type, file_origin = EXCLUDED.file_origin,
           file_url = EXCLUDED.file_url, storage_type = EXCLUDED.storage_type,
           file_name = EXCLUDED.file_name, file_size = EXCLUDED.file_size,
           upload_date = EXCLUDED.upload_date, updated_at = NOW()`,
        [report.siren, report.type, report.year, report.mime_type, report.file_origin,
         report.file_url, footprintStorageType, report.file_name, report.file_size, report.upload_date]
      );
    }

    await client.query("COMMIT");
    return { success: true, publication: { id: publication.id, siren: publication.siren, denomination: publication.denomination, year: publication.year, status: "published" } };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error approving publication:", error);
    return { error: "Erreur lors de l'approbation de la publication." };
  } finally {
    client.release();
  }
}

export async function rejectPublication(id, comment = null) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  const result = await pool.query(
    `UPDATE publications.publications
     SET status = 'rejected', rejection_comment = $2, updated_at = NOW()
     WHERE id = $1 AND status = 'pending'
     RETURNING id, status`,
    [id, comment]
  );

  if (result.rows.length === 0) {
    return { error: "Publication introuvable ou déjà traitée." };
  }
  return { success: true, publication: result.rows[0] };
}

export async function adminUpdatePublicationStatus(id, status) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  if (!["published", "rejected"].includes(status)) {
    return { error: "Statut invalide. Valeurs acceptées : published, rejected." };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pubRes = await client.query(
      `UPDATE publications.publications
       SET status = $1::varchar, updated_at = NOW(),
           publication_date = CASE WHEN $1::varchar = 'published' THEN NOW() ELSE publication_date END
       WHERE id = $2 RETURNING id`,
      [status, id]
    );

    if (pubRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return { error: "Publication introuvable." };
    }

    if (status === "published") {
      const reportRes = await client.query(
        `SELECT id, siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date
         FROM publications.reports WHERE publication_id = $1 ORDER BY upload_date DESC LIMIT 1`,
        [id]
      );

      if (reportRes.rows.length > 0) {
        const report = reportRes.rows[0];
        const footprintStorageType = report.storage_type === "external" ? "ovh" : report.storage_type;

        const existing = await client.query(
          `SELECT id FROM footprints.reports WHERE siren = $1 AND year = $2 AND type = $3 LIMIT 1`,
          [report.siren, report.year, report.type]
        );

        if (existing.rows.length > 0) {
          await client.query(
            `UPDATE footprints.reports
             SET mime_type = $1, file_origin = $2, file_url = $3, storage_type = $4,
                 file_name = $5, file_size = $6, upload_date = $7, updated_at = NOW()
             WHERE id = $8`,
            [report.mime_type, report.file_origin, report.file_url, footprintStorageType,
             report.file_name, report.file_size, report.upload_date, existing.rows[0].id]
          );
        } else {
          await client.query(
            `INSERT INTO footprints.reports
              (siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
            [report.siren, report.type, report.year, report.mime_type, report.file_origin,
             report.file_url, footprintStorageType, report.file_name, report.file_size, report.upload_date]
          );
        }
      }
    }

    await client.query("COMMIT");
    return { success: true, publication: { id, status } };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating publication status:", error);
    return { error: "Erreur lors de la mise à jour du statut." };
  } finally {
    client.release();
  }
}

export async function createAdminPublication({ siren, year, reportType, reportUrl, storageType, fileName, fileSize, mimeType }) {
  const auth = await requireAdmin();
  if (auth.error) return auth;

  if (!siren || !year || !reportType || !reportUrl) {
    return { error: "SIREN, année, type de rapport et URL sont requis." };
  }

  const footprintStorageType = storageType === "ovh" ? "ovh" : "ovh";
  const fileOrigin = storageType === "external" ? "external" : null;

  try {
    await pool.query(
      `INSERT INTO footprints.reports
         (siren, type, year, file_origin, file_url, storage_type, file_name, file_size, mime_type, upload_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
       ON CONFLICT (siren, year, type) DO UPDATE SET
         file_origin = EXCLUDED.file_origin, file_url = EXCLUDED.file_url,
         storage_type = EXCLUDED.storage_type, file_name = EXCLUDED.file_name,
         file_size = EXCLUDED.file_size, mime_type = EXCLUDED.mime_type,
         upload_date = NOW(), updated_at = NOW()`,
      [siren, reportType, year, fileOrigin, reportUrl, footprintStorageType, fileName || null, fileSize || null, mimeType || null]
    );
    return { success: true };
  } catch (error) {
    console.error("Error inserting into footprints.reports:", error);
    return { error: "Erreur lors de la publication." };
  }
}
