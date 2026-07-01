'use server'

import pool from '@/config/db';

// Inlined as SQL literal — avoids passing it as $1 which breaks the countSql
// that doesn't reference it (PostgreSQL can't infer the type of unused params)
const ESE_PANEL_SQL = `ARRAY['ECO','ART','SOC','IDR','GEQ','KNW','GHG','NRG','WAT','MAT','WAS','HAZ']::text[]`;

const PER_PAGE = 20;

export async function searchLegalUnits(query = "", filters = {}, page = 1) {
  const offset = (page - 1) * PER_PAGE;

  const conditions = [
    "ul.etatadministratifunitelegale = 'A'",
    "ul.statutdiffusionunitelegale = 'O'"
  ];
  const params = [];

  if (query && query.trim()) {
    const raw = query.trim();
    // Normalize to match SIRENE storage format (uppercase, no accents)
    const q = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
    if (/^\d{9}$/.test(q)) {
      params.push(q);
      conditions.push(`ul.siren = $${params.length}`);
    } else if (/^\d{3,8}$/.test(q)) {
      params.push(`${q}%`);
      conditions.push(`ul.siren LIKE $${params.length}`);
    } else {
      params.push(q);
      conditions.push(`(
        ul.ts @@ websearch_to_tsquery('french', $${params.length})
        OR ul.ts @@ websearch_to_tsquery('simple', $${params.length})
      )`);
    }
  }

  if (filters.sectors?.length > 0) {
    params.push(filters.sectors);
    conditions.push(`ul.activiteprincipaleunitelegale = ANY($${params.length})`);
  }

  if (filters.trancheEffectifs) {
    const tranches = Array.isArray(filters.trancheEffectifs)
      ? filters.trancheEffectifs
      : filters.trancheEffectifs.split(',').map(s => s.trim());
    params.push(tranches);
    conditions.push(`ul.trancheeffectifsunitelegale = ANY($${params.length})`);
  }

  if (filters.economieSocialeSolidaire === true) {
    conditions.push(`ul.economiesocialesolidaireunitelegale = 'O'`);
  }

  if (filters.societeMission === true) {
    conditions.push(`ul.societemissionunitelegale = 'O'`);
  } else if (filters.societeMission === false) {
    conditions.push(`ul.societemissionunitelegale = 'N'`);
  }

  if (filters.departements?.length > 0) {
    params.push(filters.departements);
    conditions.push(`(
      CASE
        WHEN LEFT(e.codecommuneetablissement, 2) IN ('97', '98')
        THEN LEFT(e.codecommuneetablissement, 3) = ANY($${params.length})
        ELSE LEFT(e.codecommuneetablissement, 2) = ANY($${params.length})
      END
    )`);
  }

  if (filters.empreintePubliee === true) {
    conditions.push(
      `EXISTS (SELECT 1 FROM footprints.uniteslegales f WHERE f.siren = ul.siren AND f.flag != 'd')`
    );
  }

  if (filters.donneesPubliees?.length > 0) {
    params.push(filters.donneesPubliees);
    conditions.push(
      `EXISTS (SELECT 1 FROM footprints.uniteslegales f WHERE f.siren = ul.siren AND f.indic = ANY($${params.length}) AND f.flag != 'd')`
    );
  }

  if (filters.activitePrincipaleArtisanale === true) {
    conditions.push(`e.activiteprincipaleregistremetiersetablissement IS NOT NULL`);
  }

  const whereClause = conditions.join(' AND ');

  const etablissementsJoin = `
    LEFT JOIN sirene.etablissements e
      ON e.siren = ul.siren
      AND e.etablissementsiege = 'true'
      AND e.etatadministratifetablissement = 'A'
  `;

  // COUNT capped at 1001 — avoids full scan, matches "> 1000" display in UI
  const countSql = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT 1
      FROM sirene.uniteslegales ul
      ${etablissementsJoin}
      WHERE ${whereClause}
      LIMIT 1001
    ) sub
  `;

  // Pattern: filter + paginate first (LIMIT/OFFSET applied early),
  // then footprint_summary only scans the 20 matching sirens.
  // ESE_PANEL inlined as SQL literal to avoid type-inference issues across two queries.
  const dataSql = `
    WITH filtered_sirens AS (
      SELECT ul.siren
      FROM sirene.uniteslegales ul
      ${etablissementsJoin}
      WHERE ${whereClause}
      ORDER BY ul.denominationunitelegale ASC NULLS LAST
      LIMIT ${PER_PAGE} OFFSET ${offset}
    ),
    footprint_summary AS (
      SELECT
        f.siren,
        COUNT(DISTINCT f.indic) FILTER (WHERE f.flag != 'd')                    AS total_indicators,
        array_agg(DISTINCT f.indic) FILTER (
          WHERE f.flag IN ('p', 'r') AND f.indic = ANY(${ESE_PANEL_SQL})
        )                                                                         AS ese_published,
        array_agg(DISTINCT f.indic) FILTER (
          WHERE f.flag IN ('p', 'r') AND NOT (f.indic = ANY(${ESE_PANEL_SQL}))
        )                                                                         AS external_published,
        array_agg(DISTINCT f.indic) FILTER (WHERE f.flag = 'e')                 AS estimated
      FROM footprints.uniteslegales f
      WHERE f.siren IN (SELECT siren FROM filtered_sirens)
      GROUP BY f.siren
    )
    SELECT
      ul.siren,
      COALESCE(
        NULLIF(TRIM(ul.denominationunitelegale), ''),
        NULLIF(TRIM(CONCAT(ul.prenom1unitelegale, ' ', ul.nomusageunitelegale)), ''),
        NULLIF(TRIM(ul.prenom1unitelegale), '')
      )                                                    AS denomination,
      ul.activiteprincipaleunitelegale                    AS "activitePrincipaleCode",
      naf.libelle                                         AS "activitePrincipaleLibelle",
      ul.trancheeffectifsunitelegale                      AS "trancheEffectifs",
      (ul.economiesocialesolidaireunitelegale = 'O')      AS "economieSocialeSolidaire",
      (ul.societemissionunitelegale = 'O')                AS "societeMission",
      cj.libelle                                          AS "categorieJuridiqueLibelle",
      e.codepostaletablissement                           AS "codeCommuneSiege",
      e.libellecommuneetablissement                       AS "communeSiege",
      COALESCE(fs.total_indicators, 0)                    AS "totalIndicators",
      COALESCE(fs.ese_published, ARRAY[]::text[])         AS "ese_published",
      COALESCE(fs.external_published, ARRAY[]::text[])    AS "external_published",
      COALESCE(fs.estimated, ARRAY[]::text[])             AS "estimated"
    FROM filtered_sirens b
    JOIN sirene.uniteslegales ul ON ul.siren = b.siren
    ${etablissementsJoin}
    LEFT JOIN footprint_summary fs ON fs.siren = ul.siren
    LEFT JOIN sirene.activiteprincipale_nafrev2 naf
      ON naf.code = ul.activiteprincipaleunitelegale
    LEFT JOIN sirene.categoriejuridique cj
      ON cj.code = ul.categoriejuridiqueunitelegale
    ORDER BY ul.denominationunitelegale ASC NULLS LAST
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countSql, params),
    pool.query(dataSql, params),
  ]);

  const legalUnits = dataResult.rows.map(row => ({
    siren: row.siren,
    denomination: row.denomination,
    activitePrincipaleCode: row.activitePrincipaleCode,
    activitePrincipaleLibelle: row.activitePrincipaleLibelle,
    trancheEffectifs: row.trancheEffectifs,
    economieSocialeSolidaire: row.economieSocialeSolidaire,
    societeMission: row.societeMission,
    categorieJuridiqueLibelle: row.categorieJuridiqueLibelle,
    codeCommuneSiege: row.codeCommuneSiege,
    communeSiege: row.communeSiege,
    totalIndicators: Number(row.totalIndicators),
    publishedIndicators: {
      ese: row.ese_published || [],
      external: row.external_published || []
    },
    estimatedIndicators: row.estimated || []
  }));

  return {
    legalUnits,
    total: parseInt(countResult.rows[0].total),
    page,
    perPage: PER_PAGE,
  };
}
