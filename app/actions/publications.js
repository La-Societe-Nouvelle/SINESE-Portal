"use server";

import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

export async function getPublications() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const { rows } = await pool.query(
    `SELECT
      p.id, p.legal_unit_id,
      lu.denomination AS legalunit, lu.siren,
      p.year, p.created_at, p.updated_at, p.publication_date,
      p.status, p.data, p.rejection_comment,
      (SELECT COUNT(*) FROM publications.reports r WHERE r.publication_id = p.id) as report_count,
      (SELECT r.type FROM publications.reports r WHERE r.publication_id = p.id LIMIT 1) as report_type,
      CASE
        WHEN (p.data IS NULL OR p.data = '{}'::jsonb OR p.data = 'null'::jsonb)
             AND EXISTS (SELECT 1 FROM publications.reports r WHERE r.publication_id = p.id)
        THEN 'report_only'
        WHEN EXISTS (SELECT 1 FROM publications.reports r WHERE r.publication_id = p.id)
        THEN 'full'
        ELSE 'indicators_only'
      END as publication_type
    FROM publications.publications p
    JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
    JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
    WHERE ulu.user_id = $1
    ORDER BY lu.denomination DESC, p.year DESC, p.created_at DESC`,
    [session.user.id]
  );
  return rows;
}

export async function getPublicationById(id) {
  const session = await getServerSession(authOptions);
  if (!session) return undefined;

  const { rows } = await pool.query(
    `SELECT p.*, lu.denomination, lu.siren
     FROM publications.publications p
     JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE p.id = $1 AND ulu.user_id = $2
     LIMIT 1`,
    [id, session.user.id]
  );
  if (!rows[0]) return undefined;

  const pub = rows[0];
  const reportResult = await pool.query(
    `SELECT id, type, file_url, file_name, file_size, mime_type, storage_type, upload_date, file_origin
     FROM publications.reports WHERE publication_id = $1 ORDER BY upload_date DESC LIMIT 1`,
    [pub.id]
  );

  const report = reportResult.rows[0];
  const isExternal = report && (report.storage_type === "external" || report.file_origin === "external");
  const documents =
    report && !isExternal && report.file_url
      ? [
          {
            id: report.id,
            name: report.file_name || report.file_url.split("/").pop(),
            size: report.file_size || null,
            type: report.mime_type || "application/octet-stream",
            url: report.file_url,
            uploadedAt: report.upload_date || null,
          },
        ]
      : [];

  return {
    ...pub,
    legalUnit: { id: pub.legal_unit_id, denomination: pub.denomination, siren: pub.siren },
    report_type: report?.type || "",
    report_id: report?.id || null,
    external_url: isExternal ? report.file_url : "",
    documents,
  };
}

export async function getPublicationStatusByLegalUnit(legalUnitId) {
  const session = await getServerSession(authOptions);
  if (!session) return { published: 0, draft: 0, pending: 0 };

  const { rows } = await pool.query(
    `SELECT
      COUNT(CASE WHEN p.status = 'published' THEN 1 END) AS published,
      COUNT(CASE WHEN p.status = 'draft' THEN 1 END) AS draft,
      COUNT(CASE WHEN p.status = 'pending' THEN 1 END) AS pending
     FROM publications.publications p
     JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE p.legal_unit_id = $1 AND ulu.user_id = $2`,
    [legalUnitId, session.user.id]
  );

  if (!rows[0]) return { published: 0, draft: 0, pending: 0 };
  return {
    published: parseInt(rows[0].published, 10),
    draft: parseInt(rows[0].draft, 10),
    pending: parseInt(rows[0].pending, 10),
  };
}

export async function addPublication({ legalUnit, declarationData, documents = [], year, status, periodStart, periodEnd }) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé. Veuillez vous connecter." };

  if (!year) return { error: "L'année est requise." };
  if (!legalUnit?.id) return { error: "Aucune unité légale sélectionnée." };

  const result = await pool.query(
    `INSERT INTO publications.publications (legal_unit_id, year, data, status, period_start, period_end)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (legal_unit_id, year)
     DO UPDATE SET
       data = data || EXCLUDED.data,
       status = EXCLUDED.status,
       period_start = EXCLUDED.period_start,
       period_end = EXCLUDED.period_end,
       updated_at = NOW()
     RETURNING id, created_at`,
    [legalUnit.id, year, JSON.stringify(declarationData), status, periodStart || null, periodEnd || null]
  );

  return { success: true, publicationId: result.rows[0].id };
}

export async function updatePublicationStatus(id, status) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé. Veuillez vous connecter." };

  if (status !== "draft") return { error: "Seul le retour au brouillon est autorisé." };

  const result = await pool.query(
    `UPDATE publications.publications p
     SET status = $1, updated_at = NOW()
     FROM publications.legal_units lu
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE p.legal_unit_id = lu.id AND p.id = $2 AND ulu.user_id = $3 AND p.status = 'pending'
     RETURNING p.id`,
    [status, id, session.user.id]
  );

  if (result.rows.length === 0) {
    return { error: "Publication introuvable, accès refusé, ou non en statut 'en attente'." };
  }
  return { success: true };
}

export async function deletePublication(id) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé. Veuillez vous connecter." };

  const checkRes = await pool.query(
    `SELECT p.id, p.status
     FROM publications.publications p
     JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE p.id = $1 AND ulu.user_id = $2`,
    [id, session.user.id]
  );

  if (checkRes.rows.length === 0) return { error: "Publication introuvable ou accès refusé." };
  if (checkRes.rows[0].status !== "draft") return { error: "Seules les publications en brouillon peuvent être supprimées." };

  await pool.query("DELETE FROM publications.publications WHERE id = $1", [id]);
  return { success: true };
}

export async function getLastPublication() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const res = await pool.query(
    `SELECT p.year, lu.denomination AS company_name
     FROM publications.publications p
     JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE ulu.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT 1`,
    [session.user.id]
  );
  return res.rows[0] || null;
}

export async function getCompaniesCount() {
  const session = await getServerSession(authOptions);
  if (!session) return 0;

  const res = await pool.query(
    `SELECT COUNT(*) FROM publications.user_legal_unit WHERE user_id = $1`,
    [session.user.id]
  );
  return parseInt(res.rows[0].count, 10);
}

export async function getDraftPublicationsCount() {
  const session = await getServerSession(authOptions);
  if (!session) return 0;

  const res = await pool.query(
    `SELECT COUNT(*)
     FROM publications.publications p
     JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE ulu.user_id = $1 AND p.status = 'draft'`,
    [session.user.id]
  );
  return parseInt(res.rows[0].count, 10);
}

export async function addReport({ reportId, publicationId, type, fileUrl, fileName, fileSize, mimeType, storageType }) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Non autorisé. Veuillez vous connecter." };

  if (!publicationId) return { error: "L'identifiant de publication est requis." };
  if (!type) return { error: "Le type de rapport est requis." };
  if (!fileUrl) return { error: "Un fichier ou un lien vers le rapport est requis." };

  const pubCheck = await pool.query(
    `SELECT p.id, p.year, lu.siren
     FROM publications.publications p
     JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE p.id = $1 AND ulu.user_id = $2`,
    [publicationId, session.user.id]
  );

  if (pubCheck.rows.length === 0) return { error: "Publication non trouvée ou accès refusé." };

  const { siren, year } = pubCheck.rows[0];
  const isExternal = storageType === "external";
  const fileOrigin = isExternal ? "external" : "ovh";
  const dbStorageType = isExternal ? "external" : "ovh";

  try {
    if (reportId) {
      const result = await pool.query(
        `UPDATE publications.reports
         SET type = $1, mime_type = $2, file_origin = $3, file_url = $4,
             storage_type = $5, file_name = $6, file_size = $7, updated_at = NOW()
         WHERE id = $8 AND publication_id = $9
         RETURNING id`,
        [type, mimeType || null, fileOrigin, fileUrl, dbStorageType, fileName || null, fileSize ? parseInt(fileSize) : null, reportId, publicationId]
      );
      if (result.rows.length === 0) return { error: "Rapport non trouvé ou accès refusé." };
      return { success: true, reportId: result.rows[0].id };
    }

    const result = await pool.query(
      `INSERT INTO publications.reports
       (publication_id, siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id`,
      [publicationId, siren, type, year, mimeType || null, fileOrigin, fileUrl, dbStorageType, fileName || null, fileSize ? parseInt(fileSize) : null]
    );
    return { success: true, reportId: result.rows[0].id };
  } catch (e) {
    console.error("Error creating report:", e);
    let userMessage = "Erreur lors de la soumission du rapport. Veuillez réessayer.";
    if (e.code === "22P02") userMessage = "Erreur de format de données.";
    else if (e.code === "23505") userMessage = "Un rapport pour cette publication existe déjà.";
    else if (e.code === "23503") userMessage = "Publication non trouvée. Veuillez d'abord créer une publication.";
    return { error: userMessage };
  }
}
