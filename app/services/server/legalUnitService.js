import { authOptions } from "@/api/auth/[...nextauth]/route";
import pool from "@/config/db";
import { getServerSession } from "next-auth";

export async function getLegalUnits() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const userId = session.user.id;
  const { rows } = await pool.query(
    `
    SELECT
      lu.id,
      lu.denomination,
      lu.siren,
      lu.data
    FROM publications.legal_units lu
    JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
    WHERE ulu.user_id = $1
    ORDER BY lu.denomination
  `,
    [userId]
  );
  return rows;
}

export async function getLegalUnitById(legalUnitId) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userId = session.user.id;
  const { rows } = await pool.query(
    `
    SELECT
      lu.id,
      lu.denomination,
      lu.siren,
      lu.data
    FROM publications.legal_units lu
    JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
    WHERE ulu.user_id = $1 AND lu.id = $2
  `,
    [userId, legalUnitId]
  );
  return rows[0] || null;
}
