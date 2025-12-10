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
    p.status
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
  return {
    ...pub,
    legalUnit: {
      id: pub.legal_unit_id,
      denomination: pub.denomination,
      siren: pub.siren,
    },
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
