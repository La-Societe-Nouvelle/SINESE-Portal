import { NextResponse } from "next/server";
import pool from "@/config/db";


const SUGGEST_LIMIT = 8;
const SUGGEST_MIN_CHARS = 3;

const SUGGEST_SELECT = `
  ul.siren,
  COALESCE(
    NULLIF(TRIM(ul.denominationunitelegale), ''),
    NULLIF(TRIM(CONCAT(ul.prenom1unitelegale, ' ', ul.nomusageunitelegale)), ''),
    NULLIF(TRIM(ul.prenom1unitelegale), '')
  )                                 AS denomination,
  naf.libelle                       AS "activitePrincipaleLibelle",
  e.codepostaletablissement         AS "codePostal"
`;

const SUGGEST_FROM = `
  FROM sirene.uniteslegales ul
  LEFT JOIN sirene.etablissements e
    ON e.siren = ul.siren
    AND e.etablissementsiege = 'true'
    AND e.etatadministratifetablissement = 'A'
  LEFT JOIN sirene.activiteprincipale_nafrev2 naf
    ON naf.code = ul.activiteprincipaleunitelegale
`;

const SUGGEST_BASE_WHERE = `
  ul.etatadministratifunitelegale = 'A'
  AND ul.statutdiffusionunitelegale = 'O'
  AND ul.siren NOT LIKE '000000%'
`;

function mapSuggestRow(row) {
  return {
    siren: row.siren,
    denomination: row.denomination,
    activitePrincipaleLibelle: row.activitePrincipaleLibelle,
    codePostal: row.codePostal,
  };
}

async function suggestLegalUnits(query) {
  const raw = query.trim();
  if (raw.length < SUGGEST_MIN_CHARS) return [];

  const q = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

  if (/^\d{3,9}$/.test(q)) {
    const sql = `
      SELECT ${SUGGEST_SELECT}
      ${SUGGEST_FROM}
      WHERE ${SUGGEST_BASE_WHERE} AND ul.siren LIKE $1
      ORDER BY ul.siren ASC
      LIMIT ${SUGGEST_LIMIT}
    `;
    const result = await pool.query(sql, [`${q}%`]);
    return result.rows.map(mapSuggestRow);
  }

  // Mirrors the production API: ul.ts @@ plainto_tsquery($1), plus a priority
  // boost for names that start with the query so prefix matches surface first.
  const matchPriorityOrder = `
    CASE WHEN ul.denominationunitelegale LIKE $1 || '%' THEN 0 ELSE 1 END,
    ul.denominationunitelegale ASC NULLS LAST
  `;

  const plainSql = `
    SELECT ${SUGGEST_SELECT}
    ${SUGGEST_FROM}
    WHERE ${SUGGEST_BASE_WHERE}
      AND ul.ts @@ plainto_tsquery($1)
    ORDER BY ${matchPriorityOrder}
    LIMIT ${SUGGEST_LIMIT}
  `;
  const plainResult = await pool.query(plainSql, [q]);

  if (plainResult.rows.length >= SUGGEST_LIMIT) {
    return plainResult.rows.map(mapSuggestRow);
  }

  // Fallback only, since it's more expensive (can match tens of thousands of
  // rows for a short prefix): prefix (:*) match on the last word, for when it's
  // still mid-typed and plainto_tsquery found nothing/not enough.
  const words = q.match(/[A-Z0-9]+/g) || [];
  if (words.length === 0) {
    return plainResult.rows.map(mapSuggestRow);
  }
  const prefixTsQuery = words.map((w, i) => (i === words.length - 1 ? `${w}:*` : w)).join(' & ');
  const excludeSirens = plainResult.rows.map(r => r.siren);

  const prefixSql = `
    SELECT ${SUGGEST_SELECT}
    ${SUGGEST_FROM}
    WHERE ${SUGGEST_BASE_WHERE}
      AND NOT (ul.siren = ANY($2))
      AND ul.ts @@ to_tsquery($3)
    ORDER BY ${matchPriorityOrder}
    LIMIT $4
  `;
  const prefixResult = await pool.query(prefixSql, [
    q,
    excludeSirens,
    prefixTsQuery,
    SUGGEST_LIMIT - plainResult.rows.length,
  ]);

  return [...plainResult.rows, ...prefixResult.rows].map(mapSuggestRow);
}

export async function GET(request) {
  const q = request.nextUrl.searchParams.get("q") || "";

  try {
    const suggestions = await suggestLegalUnits(q);
    return NextResponse.json(suggestions, {
      headers: {
        // Les mêmes préfixes reviennent souvent d'un utilisateur à l'autre —
        // le SIRENE ne bouge pas à la minute.
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Suggest query failed:", error.message);
    // Les suggestions sont un confort : un échec ne doit rien casser côté UI.
    return NextResponse.json([], { status: 500 });
  }
}
