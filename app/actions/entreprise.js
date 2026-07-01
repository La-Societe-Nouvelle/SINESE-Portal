'use server'

import pool from '@/config/db';

const ESE_PANEL = ['ECO', 'ART', 'SOC', 'IDR', 'GEQ', 'KNW', 'GHG', 'NRG', 'WAT', 'MAT', 'WAS', 'HAZ'];

// Retourne les données de l'unité légale + son empreinte (ESE + hors-ESE)
export async function getLegalUnitData(siren) {
  const [unitResult, footprintResult] = await Promise.all([
    pool.query(
      `SELECT
        ul.siren,
        COALESCE(
          NULLIF(TRIM(ul.denominationunitelegale), ''),
          NULLIF(TRIM(CONCAT(ul.prenom1unitelegale, ' ', ul.nomusageunitelegale)), ''),
          NULLIF(TRIM(ul.prenom1unitelegale), '')
        )                                                   AS denomination,
        ul.activiteprincipaleunitelegale                    AS "activitePrincipaleCode",
        naf.libelle                                         AS "activitePrincipaleLibelle",
        ul.trancheeffectifsunitelegale                      AS "trancheEffectifs",
        (ul.economiesocialesolidaireunitelegale = 'O')      AS "economieSocialeSolidaire",
        (ul.societemissionunitelegale = 'O')                AS "societeMission",
        (ul.statutdiffusionunitelegale = 'O')               AS "statutdiffusion",
        e.codepostaletablissement                           AS "codeCommuneSiege",
        e.libellecommuneetablissement                       AS "communeSiege",
        (NULLIF(TRIM(e.activiteprincipaleregistremetiersetablissement), '') IS NOT NULL) AS "hasCraftedActivities"
      FROM sirene.uniteslegales ul
      LEFT JOIN sirene.etablissements e
        ON e.siren = ul.siren
        AND e.etablissementsiege = 'true'
        AND e.etatadministratifetablissement = 'A'
      LEFT JOIN sirene.activiteprincipale_nafrev2 naf
        ON naf.code = ul.activiteprincipaleunitelegale
      WHERE ul.siren = $1`,
      [siren]
    ),
    pool.query(
      `SELECT DISTINCT ON (indic)
        indic, year, value, flag, uncertainty, info, source, origin,
        TO_CHAR(lastupdate, 'YYYY-MM-DD') AS lastupdate
       FROM footprints.uniteslegales
       WHERE siren = $1
       ORDER BY indic, year DESC, lastupdate DESC`,
      [siren]
    ),
  ]);

  if (unitResult.rows.length === 0) return null;

  const legalUnit = unitResult.rows[0];

  const footprint = {};
  const additionnalData = {};

  for (const row of footprintResult.rows) {
    const entry = {
      value: row.value,
      flag: row.flag,
      uncertainty: row.uncertainty,
      year: row.year,
      info: row.info,
      source: row.source,
      origin: row.origin,
      lastupdate: row.lastupdate,
    };
    if (ESE_PANEL.includes(row.indic)) {
      footprint[row.indic] = entry;
    } else {
      additionnalData[row.indic] = entry;
    }
  }

  return { legalUnit, footprint, additionnalData };
}

// Historique de l'empreinte de l'unité légale (toutes années, indicateurs ESE publiés)
export async function getLegalUnitHistory(siren) {
  const result = await pool.query(
    `SELECT indic, year, value, flag, uncertainty
     FROM footprints.uniteslegales
     WHERE siren = $1
       AND flag IN ('p', 'e')
       AND indic = ANY($2)
     ORDER BY indic, year ASC`,
    [siren, ESE_PANEL]
  );

  const history = {};
  for (const row of result.rows) {
    if (!history[row.indic]) history[row.indic] = [];
    history[row.indic].push({ year: row.year, value: row.value, flag: row.flag, uncertainty: row.uncertainty });
  }
  return history;
}

// Empreinte par défaut du secteur (code sur 2 chiffres)
export async function getDivisionFootprint(code) {
  const result = await pool.query(
    `SELECT indic, value, uncertainty, year, source, info
     FROM defaultdata.divisionsdata
     WHERE code = $1 AND aggregate = 'PRD' AND area = 'FRA'
     ORDER BY indic, year DESC`,
    [code]
  );

  const footprint = {};
  for (const row of result.rows) {
    if (!footprint[row.indic]) {
      footprint[row.indic] = {
        value: row.value,
        uncertainty: row.uncertainty,
        year: row.year,
        source: row.source,
        info: row.info,
      };
    }
  }
  return footprint;
}

// Données historiques sectorielles (macro_fpt_a88)
export async function getHistoricalDivisionFootprint(division) {
  const result = await pool.query(
    `SELECT indic, year, value, flag, currency
     FROM macrodata.macro_fpt_a88
     WHERE division = $1 AND aggregate = 'PRD' AND area = 'FRA'
     ORDER BY indic, year`,
    [division]
  );

  const historical = {};
  for (const row of result.rows) {
    if (!historical[row.indic]) historical[row.indic] = [];
    historical[row.indic].push(row);
  }
  return historical;
}

// Rapports publiés pour un SIREN
export async function getPublishedReports(siren) {
  const result = await pool.query(
    `SELECT id, siren, type, year,
            mime_type, file_origin, file_url AS url, storage_type, file_name,
            file_size, upload_date, created_at, updated_at
       FROM footprints.reports
      WHERE siren = $1
      ORDER BY year DESC`,
    [siren]
  );

  if (result.rows.length === 0) return null;

  return {
    hasPublishedDocuments: true,
    documents: result.rows.map(r => ({
      id: r.id,
      siren: r.siren,
      type: r.type,
      year: r.year,
      url: r.url,
      fileOrigin: r.file_origin,
      fileName: r.file_name,
      fileSize: r.file_size,
      contentType: r.mime_type,
      uploadedAt: r.upload_date,
      storageType: r.storage_type,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  };
}
