'use server'

import pool from '@/config/db';

// Inlined as a literal, not $1 — Postgres can't infer the type of a param
// unused by countSql (which doesn't reference this array).
const ESE_PANEL_SQL = `ARRAY['ECO','ART','SOC','IDR','GEQ','KNW','GHG','NRG','WAT','MAT','WAS','HAZ']::text[]`;

const PER_PAGE = 20;

export async function searchLegalUnits(query = "", filters = {}, page = 1) {
  const offset = (page - 1) * PER_PAGE;

  const conditions = [
    "ul.etatadministratifunitelegale = 'A'",
    "ul.statutdiffusionunitelegale = 'O'",
    "ul.siren NOT LIKE '000000%'" // demo/test sirens
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

  if (filters.secteurs?.length > 0) {
    params.push(filters.secteurs);
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

  // Correlated EXISTS (not a pre-resolved siren array) so the planner probes
  // idx_etablissements_siren_siege_actif per row instead of scanning/deduping
  // the whole department upfront — that took minutes for dense ones (Paris/75,
  // ~875k establishment rows).
  if (filters.departements?.length > 0) {
    const deptConditions = filters.departements.map((dept) => {
      params.push(`${dept}%`);
      return `e2.codecommuneetablissement LIKE $${params.length}`;
    });
    conditions.push(`EXISTS (
      SELECT 1 FROM sirene.etablissements e2
      WHERE e2.siren = ul.siren
        AND e2.etablissementsiege = 'true'
        AND e2.etatadministratifetablissement = 'A'
        AND (${deptConditions.join(' OR ')})
    )`);
  }

  if (filters.empreintePubliee === true) {
    conditions.push(
      `EXISTS (SELECT 1 FROM footprints.uniteslegales f WHERE f.siren = ul.siren)`
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

  if (filters.rapportPublie === true) {
    conditions.push(
      `EXISTS (SELECT 1 FROM footprints.reports r WHERE r.siren = ul.siren)`
    );
  }

  const whereClause = conditions.join(' AND ');

  const etablissementsJoin = `
    LEFT JOIN sirene.etablissements e
      ON e.siren = ul.siren
      AND e.etablissementsiege = 'true'
      AND e.etatadministratifetablissement = 'A'
  `;
  // Only join etablissements when a filter needs the `e` alias directly —
  // avoids paying that join for every candidate row before pagination otherwise.
  // (Departments now go through their own subquery above, not this join.)
  const conditionalEtablissementsJoin = filters.activitePrincipaleArtisanale === true ? etablissementsJoin : '';

  // COUNT capped at 1001 — avoids full scan, matches "> 1000" display in UI
  const countSql = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT 1
      FROM sirene.uniteslegales ul
      ${conditionalEtablissementsJoin}
      WHERE ${whereClause}
      LIMIT 1001
    ) sub
  `;
  const countPromise = pool.query(countSql, params);
  // Marks the rejection as handled up front so a later, unrelated throw in this
  countPromise.catch(() => {});

  // Rank companies by ESE panel status — published, then estimated, then the rest —
  // via 3 independently-paginated tiers instead of sorting the whole filtered set,
  // which would force a full materialize+sort before LIMIT/OFFSET could apply.
  const tierPublishedFrom = `
    FROM (SELECT DISTINCT siren FROM footprints.uniteslegales WHERE flag = 'p' AND indic = ANY(${ESE_PANEL_SQL})) fp
    JOIN sirene.uniteslegales ul ON ul.siren = fp.siren
    ${conditionalEtablissementsJoin}
    WHERE ${whereClause}
  `;
  const tierEstimatedFrom = `
    FROM (SELECT DISTINCT siren FROM footprints.uniteslegales WHERE flag = 'e' AND indic = ANY(${ESE_PANEL_SQL})) fp
    JOIN sirene.uniteslegales ul ON ul.siren = fp.siren
    ${conditionalEtablissementsJoin}
    WHERE ${whereClause}
      AND NOT EXISTS (SELECT 1 FROM footprints.uniteslegales f WHERE f.siren = ul.siren AND f.flag = 'p' AND f.indic = ANY(${ESE_PANEL_SQL}))
  `;
  const tierNoneFrom = `
    FROM sirene.uniteslegales ul
    ${conditionalEtablissementsJoin}
    WHERE ${whereClause}
      AND NOT EXISTS (SELECT 1 FROM footprints.uniteslegales f WHERE f.siren = ul.siren AND f.flag != 'd' AND f.indic = ANY(${ESE_PANEL_SQL}))
  `;

  // Bounded count — just enough to know if this tier covers the rest of the page.
  const tierCappedCount = async (fromSql, limit) => {
    const sql = `SELECT COUNT(*) AS n FROM (SELECT ul.siren ${fromSql} LIMIT ${limit}) sub`;
    return parseInt((await pool.query(sql, params)).rows[0].n);
  };

  const sirenQueries = [];
  let cursorOffset = offset;
  let cursorLimit = PER_PAGE;

  for (const tierFrom of [tierPublishedFrom, tierEstimatedFrom, tierNoneFrom]) {
    if (cursorLimit <= 0) break;

    // Last tier gets whatever's left directly — no capped count needed
    // since there's nothing after it to reserve room for.
    const isLastTier = tierFrom === tierNoneFrom;
    const tierCount = isLastTier ? Infinity : await tierCappedCount(tierFrom, cursorOffset + cursorLimit);

    const tierRows = Math.max(0, Math.min(cursorLimit, tierCount - cursorOffset));
    if (tierRows > 0) {
      sirenQueries.push(pool.query(
        `SELECT ul.siren ${tierFrom} ORDER BY ul.denominationunitelegale ASC NULLS LAST LIMIT ${tierRows} OFFSET ${cursorOffset}`,
        params
      ));
    }

    cursorOffset = Math.max(0, cursorOffset - tierCount);
    cursorLimit -= tierRows;
  }

  const sirenResults = await Promise.all(sirenQueries);
  const sirens = sirenResults.flatMap(r => r.rows);

  if (sirens.length === 0) {
    return { legalUnits: [], total: parseInt((await countPromise).rows[0].total), page, perPage: PER_PAGE };
  }

  // Tier order was already decided above — this just enriches those sirens.
  const sirenList = sirens.map(s => s.siren);
  const dataSql = `
    WITH footprint_summary AS (
      SELECT
        f.siren,
        COUNT(DISTINCT f.indic) FILTER (WHERE f.flag != 'd')                    AS total_indicators,
        array_agg(DISTINCT f.indic) FILTER (
          WHERE f.flag = 'p' AND f.indic = ANY(${ESE_PANEL_SQL})
        )                                                                         AS ese_published,
        array_agg(DISTINCT f.indic) FILTER (
          WHERE f.flag = 'p' AND NOT (f.indic = ANY(${ESE_PANEL_SQL}))
        )                                                                         AS external_published,
        array_agg(DISTINCT f.indic) FILTER (WHERE f.flag = 'e')                 AS estimated
      FROM footprints.uniteslegales f
      WHERE f.siren = ANY($1)
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
    FROM sirene.uniteslegales ul
    ${etablissementsJoin}
    LEFT JOIN footprint_summary fs ON fs.siren = ul.siren
    LEFT JOIN sirene.activiteprincipale_nafrev2 naf
      ON naf.code = ul.activiteprincipaleunitelegale
    LEFT JOIN sirene.categoriejuridique cj
      ON cj.code = ul.categoriejuridiqueunitelegale
    WHERE ul.siren = ANY($1)
  `;

  const [countResult, dataResult] = await Promise.all([
    countPromise,
    pool.query(dataSql, [sirenList]),
  ]);

  // Restore the tier order decided above — ANY($1) doesn't guarantee order.
  const rowBySiren = new Map(dataResult.rows.map(row => [row.siren, row]));
  const orderedRows = sirenList.map(siren => rowBySiren.get(siren)).filter(Boolean);

  const legalUnits = orderedRows.map(row => ({
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

// Runs on every keystroke, so kept cheap — no footprint join.
export async function suggestLegalUnits(query = "") {
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
