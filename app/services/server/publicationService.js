import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";

export async function getPublications() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const userId = session.user.id;
  const { rows } = await pool.query(
    `
  SELECT
    p.id,
    p.legal_unit_id,
    lu.denomination AS legalunit,
    lu.siren,
    p.year,
    p.created_at,
    p.updated_at,
    p.publication_date,
    p.status,
    p.data,
    -- Compter les rapports associés
    (SELECT COUNT(*) FROM publications.reports r WHERE r.publication_id = p.id) as report_count,
    -- Récupérer le type du premier rapport associé (si présent)
    (SELECT r.type FROM publications.reports r WHERE r.publication_id = p.id LIMIT 1) as report_type,
    -- Déterminer le type de publication
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
  ORDER BY lu.denomination DESC, p.year DESC, p.created_at DESC
  `,
    [userId]
  );
  return rows;
}

export async function getPublicationById(id) {
  const session = await getServerSession(authOptions);
  if (!session) return undefined;

  const userId = session.user.id;

  const { rows } = await pool.query(
    `SELECT
      p.*,
      lu.denomination,
      lu.siren
    FROM publications.publications p
    JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
    JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
    WHERE p.id = $1 AND ulu.user_id = $2
    LIMIT 1`,
    [id, userId]
  );
  if (!rows[0]) return undefined;

  const pub = rows[0];

  const reportResult = await pool.query(
    `SELECT id, type, file_url, file_name, file_size, mime_type, storage_type, upload_date, file_origin
     FROM publications.reports
     WHERE publication_id = $1
     ORDER BY upload_date DESC
     LIMIT 1`,
    [pub.id]
  );

  const report = reportResult.rows[0];
  const isExternal = report && (report.storage_type === "external" || report.file_origin === "external");

  const documents = report && !isExternal && report.file_url
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
    legalUnit: {
      id: pub.legal_unit_id,
      denomination: pub.denomination,
      siren: pub.siren,
    },
    report_type: report?.type || "",
    report_id: report?.id || null,
    external_url: isExternal ? report.file_url : "",
    documents,
  };
}

export async function getPublicationStatusByLegalUnit(legalUnitId) {
  const session = await getServerSession(authOptions);
  if (!session) return { published: 0, draft: 0 };

  const userId = session.user.id;

  const { rows } = await pool.query(
    `
    SELECT
      COUNT(CASE WHEN p.status = 'published' THEN 1 END) AS published,
      COUNT(CASE WHEN p.status = 'draft' THEN 1 END) AS draft,
      COUNT(CASE WHEN p.status = 'pending' THEN 1 END) AS pending
    FROM publications.publications p
    JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
    JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
    WHERE p.legal_unit_id = $1 AND ulu.user_id = $2
    `,
    [legalUnitId, userId]
  );

  if (!rows[0]) return { published: 0, draft: 0, pending: 0 };

  return {
    published: parseInt(rows[0].published, 10),
    draft: parseInt(rows[0].draft, 10),
    pending: parseInt(rows[0].pending, 10),
  };
}
