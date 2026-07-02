'use server'

import pool from '@/config/db';
import { createError, createDatabaseError, ErrorCodes } from '@/_libs/errors';

export async function getMacroMetadata() {
  try {
    const result = await pool.query(
      `SELECT param, code, label FROM macrodata.macro_fpt_meta ORDER BY param, code`
    );

    const metadata = {};
    for (const { param, code, label } of result.rows) {
      if (!metadata[param]) metadata[param] = [];
      metadata[param].push({ code, label });
    }
    return metadata;
  } catch (error) {
    console.error('[macrodata] getMacroMetadata error:', error);
    return createDatabaseError(error, 'SELECT param, code, label FROM macrodata.macro_fpt_meta');
  }
}

export async function getMacroData(industry = 'TOTAL', country = 'FRA', aggregate = 'PRD') {
  try {
    const result = await pool.query(
      `SELECT indic, year, value, flag, currency
       FROM macrodata.macro_fpt
       WHERE industry = $1 AND country = $2 AND aggregate = $3
       ORDER BY indic, year`,
      [industry, country, aggregate]
    );
    return result.rows;
  } catch (error) {
    console.error('[macrodata] getMacroData error:', error);
    return createDatabaseError(error,
      'SELECT indic, year, value, flag, currency FROM macrodata.macro_fpt WHERE industry = $1 AND country = $2 AND aggregate = $3'
    );
  }
}
