"use server";

import pool from "@/config/db";
import { getSession } from "@/_libs/auth";

export async function getLegalUnits() {
  const session = await getSession();
  if (!session) return [];

  const { rows } = await pool.query(
    `SELECT lu.id, lu.denomination, lu.siren, lu.data,
            COALESCE(
              (SELECT json_agg(json_build_object('year', p.year, 'status', p.status) ORDER BY p.year DESC)
               FROM publications.publications p
               WHERE p.legal_unit_id = lu.id),
              '[]'
            ) AS "publishedYears"
     FROM publications.legal_units lu
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE ulu.user_id = $1
     ORDER BY lu.denomination`,
    [session.user.id]
  );
  return rows;
}

export async function getLegalUnitById(legalUnitId) {
  const session = await getSession();
  if (!session) return null;

  const { rows } = await pool.query(
    `SELECT lu.id, lu.denomination, lu.siren, lu.data
     FROM publications.legal_units lu
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE ulu.user_id = $1 AND lu.id = $2`,
    [session.user.id, legalUnitId]
  );
  return rows[0] || null;
}

export async function addLegalUnit({ siren, denomination }) {
  const session = await getSession();
  if (!session) return { error: "Non autorisé. Veuillez vous connecter." };

  if (!siren || !denomination) {
    return { error: "SIREN et dénomination sont requis." };
  }

  const apiRes = await fetch(`https://api.lasocietenouvelle.org/legalUnitfootprint/${siren}`);
  if (!apiRes.ok) {
    return { error: "Entreprise non trouvée dans le répertoire SINESE." };
  }
  const apiData = await apiRes.json();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      "INSERT INTO publications.legal_units (siren, denomination, data) VALUES ($1, $2, $3) RETURNING id",
      [siren, denomination, apiData.legalUnit]
    );
    const legalUnitId = res.rows[0].id;
    await client.query(
      "INSERT INTO publications.user_legal_unit (user_id, legal_unit_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [session.user.id, legalUnitId]
    );
    await client.query("COMMIT");
    return { success: true, id: legalUnitId, siren, denomination };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur lors de l'ajout de l'entreprise :", error);
    return { error: "Erreur lors de l'ajout de l'entreprise." };
  } finally {
    client.release();
  }
}

export async function deleteLegalUnit(id) {
  const session = await getSession();
  if (!session) return { error: "Non autorisé. Veuillez vous connecter." };

  const userId = session.user.id;

  const checkRes = await pool.query(
    `SELECT lu.id FROM publications.legal_units lu
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE lu.id = $1 AND ulu.user_id = $2`,
    [id, userId]
  );

  if (checkRes.rows.length === 0) {
    return { error: "Entreprise non trouvée ou accès refusé." };
  }

  const publicationsRes = await pool.query(
    `SELECT id, status FROM publications.publications WHERE legal_unit_id = $1`,
    [id]
  );

  const hasNonDraft = publicationsRes.rows.some(
    (pub) => pub.status === "pending" || pub.status === "published"
  );

  if (hasNonDraft) {
    return { error: "Impossible de supprimer une entreprise ayant des publications en attente ou publiées." };
  }

  const draftIds = publicationsRes.rows.filter((p) => p.status === "draft").map((p) => p.id);
  if (draftIds.length > 0) {
    await pool.query(
      `DELETE FROM publications.publications WHERE legal_unit_id = $1 AND status = 'draft'`,
      [id]
    );
  }

  await pool.query(
    `DELETE FROM publications.user_legal_unit WHERE legal_unit_id = $1 AND user_id = $2`,
    [id, userId]
  );
  await pool.query(`DELETE FROM publications.legal_units WHERE id = $1`, [id]);

  return { success: true, deletedDrafts: draftIds.length };
}

export async function checkLegalUnitAttachment(siren) {
  const session = await getSession();
  if (!session) return { error: "Non autorisé." };

  if (!siren) return { error: "SIREN requis." };

  const result = await pool.query(
    `SELECT ulu.user_id
     FROM publications.legal_units lu
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE lu.siren = $1`,
    [siren]
  );

  const attachedUserIds = result.rows.map((r) => r.user_id);
  return {
    attachedToCurrentUser: attachedUserIds.includes(session.user.id),
    attachedToOtherUser: attachedUserIds.some((id) => id !== session.user.id),
  };
}
