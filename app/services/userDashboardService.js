import pool from "@/config/db";

// Dernière publication de l'utilisateur
export async function getLastPublication(userId) {
  const res = await pool.query(
    `SELECT p.year, lu.denomination AS company_name
     FROM publications.publications p
     JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE ulu.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT 1`,
    [userId]
  );
  return res.rows[0];
}

// Nombre d'entreprises de l'utilisateur
export async function getCompaniesCount(userId) {
  const res = await pool.query(
    `SELECT COUNT(*) FROM publications.user_legal_unit WHERE user_id = $1`,
    [userId]
  );
  return parseInt(res.rows[0].count, 10);
}

// Nombre de publications en brouillon
export async function getDraftPublicationsCount(userId) {
  const res = await pool.query(
    `SELECT COUNT(*)
     FROM publications.publications p
     JOIN publications.legal_units lu ON p.legal_unit_id = lu.id
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE ulu.user_id = $1 AND p.status = 'draft'`,
    [userId]
  );
  return parseInt(res.rows[0].count, 10);
}
