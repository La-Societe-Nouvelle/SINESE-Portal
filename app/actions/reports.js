'use server';

import pool from '@/config/db';
import { getReportFormat } from '@/_libs/report-format';

const PER_PAGE = 20;

// Whitelisted sort columns — never interpolate the `sort` param directly into SQL.
const SORT_COLUMNS = {
  denomination: 'denomination',
  year: 'r.year',
  type: 'r.type',
  secteur: 'naf.libelle',
};

export async function listPublishedReports(filters = {}, sort = 'denomination', dir = 'asc', page = 1) {
  const offset = (Math.max(1, page) - 1) * PER_PAGE;
  const sortColumn = SORT_COLUMNS[sort] || SORT_COLUMNS.year;
  const sortDir = dir === 'asc' ? 'ASC' : 'DESC';

  const conditions = ['1=1'];
  const params = [];

  if (filters.annees?.length > 0) {
    params.push(filters.annees.map(Number).filter(Number.isInteger));
    conditions.push(`r.year = ANY($${params.length})`);
  }

  if (filters.secteurs?.length > 0) {
    params.push(filters.secteurs);
    // filters.secteurs holds 2-digit NAF division codes (see app/_libs/divisions.json),
    // while activiteprincipaleunitelegale stores the full NAF code (e.g. "01.11Z") —
    // match on the division prefix rather than equality.
    conditions.push(`LEFT(ul.activiteprincipaleunitelegale, 2) = ANY($${params.length})`);
  }

  if (filters.types?.length > 0) {
    params.push(filters.types);
    conditions.push(`r.type = ANY($${params.length})`);
  }

  // Format is derived from mime_type (source of truth) with a file_name
  // extension fallback for older rows uploaded before mime_type was recorded —
  // mirrors getReportFormat() in app/_libs/report-format.js.
  if (filters.formats?.length > 0) {
    const formatConditions = filters.formats.map((format) => {
      if (format === 'pdf') return `(r.mime_type = 'application/pdf' OR (r.mime_type IS NULL AND r.file_name ILIKE '%.pdf'))`;
      if (format === 'xbrl') return `(r.mime_type IN ('application/xml', 'text/xml') OR (r.mime_type IS NULL AND (r.file_name ILIKE '%.xbrl' OR r.file_name ILIKE '%.xml')))`;
      return `(
        (r.mime_type IS NOT NULL AND r.mime_type NOT IN ('application/pdf', 'application/xml', 'text/xml'))
        OR (r.mime_type IS NULL AND (r.file_name IS NULL OR r.file_name !~* '\\.(pdf|xbrl|xml)$'))
      )`;
    });
    conditions.push(`(${formatConditions.join(' OR ')})`);
  }

  const whereClause = conditions.join(' AND ');

  const fromJoin = `
    FROM footprints.reports r
    JOIN sirene.uniteslegales ul ON ul.siren = r.siren
    LEFT JOIN sirene.activiteprincipale_nafrev2 naf ON naf.code = ul.activiteprincipaleunitelegale
  `;

  const countSql = `SELECT COUNT(*) AS total ${fromJoin} WHERE ${whereClause}`;

  const denominationExpr = `
    COALESCE(
      NULLIF(TRIM(ul.denominationunitelegale), ''),
      NULLIF(TRIM(CONCAT(ul.prenom1unitelegale, ' ', ul.nomusageunitelegale)), ''),
      NULLIF(TRIM(ul.prenom1unitelegale), '')
    )
  `;

  const dataSql = `
    SELECT
      r.id,
      r.siren,
      ${denominationExpr} AS denomination,
      naf.libelle AS "activitePrincipaleLibelle",
      r.type,
      r.year,
      r.file_name AS "fileName",
      r.file_size AS "fileSize",
      r.mime_type AS "mimeType",
      r.storage_type AS "storageType",
      r.file_url AS "fileUrl"
    ${fromJoin}
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${sortDir} NULLS LAST, r.id ASC
    LIMIT ${PER_PAGE} OFFSET ${offset}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countSql, params),
    pool.query(dataSql, params),
  ]);

  const reports = dataResult.rows.map((row) => ({
    id: row.id,
    siren: row.siren,
    denomination: row.denomination,
    activitePrincipaleLibelle: row.activitePrincipaleLibelle,
    type: row.type,
    year: row.year,
    fileName: row.fileName,
    format: getReportFormat(row.fileName, row.mimeType),
    fileSize: row.fileSize,
    storageType: row.storageType,
    url: row.storageType === 'ovh' ? null : row.fileUrl,
  }));

  return {
    reports,
    total: parseInt(countResult.rows[0].total, 10),
    page,
    perPage: PER_PAGE,
  };
}

export async function getReportFilterOptions() {
  const result = await pool.query(
    `SELECT DISTINCT year FROM footprints.reports ORDER BY year DESC`
  );
  return { years: result.rows.map((r) => r.year) };
}
