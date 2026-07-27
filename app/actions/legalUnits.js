"use server";

import pool from "@/config/db";
import { requireAuth } from "@/_libs/auth";

export async function getLegalUnits() {
  const auth = await requireAuth();
  if (auth.error) return [];
  const { session } = auth;

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
  const auth = await requireAuth();
  if (auth.error) return null;
  const { session } = auth;

  const { rows } = await pool.query(
    `SELECT lu.id, lu.denomination, lu.siren, lu.data
     FROM publications.legal_units lu
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE ulu.user_id = $1 AND lu.id = $2`,
    [session.user.id, legalUnitId]
  );
  return rows[0] || null;
}

// Recherche une unité légale par SIREN dans le référentiel SIRENE local
export async function lookupLegalUnitBySiren(siren) {
  if (!/^\d{9}$/.test(siren)) {
    return { error: "SIREN invalide." };
  }

  const { rows } = await pool.query(
    `SELECT
      ul.siren,
      COALESCE(
        NULLIF(TRIM(ul.denominationunitelegale), ''),
        NULLIF(TRIM(CONCAT(ul.prenom1unitelegale, ' ', ul.nomusageunitelegale)), ''),
        NULLIF(TRIM(ul.prenom1unitelegale), '')
      )                                       AS denomination,
      ul.etatadministratifunitelegale         AS "etatAdministratifUniteLegale"
     FROM sirene.uniteslegales ul
     WHERE ul.siren = $1`,
    [siren]
  );

  if (rows.length === 0) {
    return { error: "Aucune entreprise trouvée pour ce SIREN." };
  }

  return { legalUnits: rows };
}

export async function addLegalUnit({ siren, denomination }) {
  const auth = await requireAuth();
  if (auth.error) return auth;
  const { session } = auth;

  if (!siren || !denomination) {
    return { error: "SIREN et dénomination sont requis." };
  }

  const lookup = await lookupLegalUnitBySiren(siren);
  if (lookup.error) {
    return { error: "Entreprise non trouvée dans le répertoire SINESE." };
  }

  if (lookup.legalUnits[0].etatAdministratifUniteLegale !== "A") {
    return { error: "Cette entreprise est radiée ou fermée et ne peut pas être ajoutée." };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      "INSERT INTO publications.legal_units (siren, denomination, data) VALUES ($1, $2, $3) RETURNING id",
      [siren, denomination, lookup.legalUnits[0]]
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
  const auth = await requireAuth();
  if (auth.error) return auth;
  const { session } = auth;

  const userId = session.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const checkRes = await client.query(
      `SELECT lu.id FROM publications.legal_units lu
       JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
       WHERE lu.id = $1 AND ulu.user_id = $2`,
      [id, userId]
    );

    if (checkRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return { error: "Entreprise non trouvée ou accès refusé." };
    }

    const publicationsRes = await client.query(
      `SELECT id, status FROM publications.publications WHERE legal_unit_id = $1`,
      [id]
    );

    const hasNonDraft = publicationsRes.rows.some(
      (pub) => pub.status === "pending" || pub.status === "published"
    );

    if (hasNonDraft) {
      await client.query("ROLLBACK");
      return { error: "Impossible de supprimer une entreprise ayant des publications en attente ou publiées." };
    }

    const draftIds = publicationsRes.rows.filter((p) => p.status === "draft").map((p) => p.id);
    if (draftIds.length > 0) {
      await client.query(
        `DELETE FROM publications.publications WHERE legal_unit_id = $1 AND status = 'draft'`,
        [id]
      );
    }

    await client.query(
      `DELETE FROM publications.user_legal_unit WHERE legal_unit_id = $1 AND user_id = $2`,
      [id, userId]
    );
    await client.query(`DELETE FROM publications.legal_units WHERE id = $1`, [id]);

    await client.query("COMMIT");
    return { success: true, deletedDrafts: draftIds.length };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erreur lors de la suppression de l'entreprise :", error);
    return { error: "Erreur lors de la suppression de l'entreprise." };
  } finally {
    client.release();
  }
}

export async function checkLegalUnitAttachment(siren) {
  const auth = await requireAuth();
  if (auth.error) return auth;
  const { session } = auth;

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
