/**
 * API service functions for SINESE Portal
 * Handles all interactions with the SINESE API v2 (api.sinese.fr)
 */

import { buildLegalUnitSearchUrl, convertFiltersToApiFormat } from './apiUrlBuilder';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sinese.fr';

/**
 * Search for legal units using the API
 * TODO: Migrate to v2 search endpoint when available (GET /v2/legalunits/search)
 * Currently uses v1 endpoint /legalunit/{query}
 * @param {string} query - Search query (SIREN, partial SIREN, or text)
 * @param {Object} filters - Search filters
 * @param {Object} options - Additional options (pagination, etc.)
 * @returns {Promise<Object>} Search results
 */
export async function searchLegalUnits(query = "", filters = {}, options = {}) {
  try {
    const apiFilters = convertFiltersToApiFormat(filters);
    const apiUrl = buildLegalUnitSearchUrl(API_BASE_URL, query, apiFilters);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Search API Error:', error);
    throw error;
  }
}

/**
 * Get company footprint data by SIREN (API v2)
 * @param {string} siren - 9-digit SIREN number
 * @param {Object} options - Optional parameters
 * @param {string} options.year - Target year (default: current)
 * @param {boolean} options.includeHistory - Include historical data
 * @returns {Promise<Object>} Company footprint data
 */
export async function getCompanyFootprint(siren, options = {}) {
  try {
    const url = new URL(`${API_BASE_URL}/v2/legalunitfootprint/${siren}`);
    if (options.year) url.searchParams.set('year', options.year);
    if (options.includeHistory) url.searchParams.set('includeHistory', 'true');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Company Footprint API Error:', error);
    throw error;
  }
}

/**
 * Get default footprint data for an activity (API v2)
 * @param {string} code - Activity/division code
 * @param {Object} options - Optional parameters
 * @param {string} options.area - Geographic area (default: FRA)
 * @param {string} options.aggregate - Aggregate type (default: PRD)
 * @param {string} options.year - Target year
 * @returns {Promise<Object>} Default footprint data
 */
export async function getDivisionFootprint(code, options = {}) {
  try {
    const url = new URL(`${API_BASE_URL}/v2/defaultfootprint`);
    url.searchParams.set('code', code);
    url.searchParams.set('area', options.area || 'FRA');
    url.searchParams.set('aggregate', options.aggregate || 'PRD');
    if (options.year) url.searchParams.set('year', options.year);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Division Footprint API Error:', error);
    throw error;
  }
}

/**
 * Get macrodata from a specific dataset (API v2)
 * @param {string} dataset - Dataset name (e.g., 'macro_fpt_a88')
 * @param {Object} filters - Query filters (division, area, year, etc.)
 * @param {Object} pagination - Pagination options (page, limit)
 * @returns {Promise<Object>} Dataset data
 */
export async function getMacrodata(dataset, filters = {}, pagination = {}) {
  try {
    const url = new URL(`${API_BASE_URL}/v2/macrodata/${dataset}`);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
    if (pagination.page) url.searchParams.set('page', pagination.page);
    if (pagination.limit) url.searchParams.set('limit', pagination.limit);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Macrodata API Error:', error);
    throw error;
  }
}

/**
 * Get metadata for a specific dataset (API v2)
 * @param {string} dataset - Dataset name (e.g., 'macro_fpt')
 * @param {string} param - Optional specific parameter
 * @returns {Promise<Object>} Dataset metadata
 */
export async function getMacrodataMetadata(dataset, param) {
  try {
    const url = new URL(`${API_BASE_URL}/v2/macrodata/${dataset}/metadata`);
    if (param) url.searchParams.set('param', param);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Macrodata Metadata API Error:', error);
    throw error;
  }
}

/**
 * Get historical division footprint data (API v2)
 * Uses macrodata endpoint with macro_fpt_a88 dataset
 * @param {string} code - Division code
 * @returns {Promise<Object>} Historical division footprint data
 */
export async function getHistoricalDivisionFootprint(code) {
  return getMacrodata('macro_fpt_a88', {
    division: code,
    aggregate: 'PRD',
    area: 'FRA'
  });
}

/**
 * Search companies with specific filters only (no text query)
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} Search results
 */
export async function browseCompanies(filters) {
  return searchLegalUnits("", filters);
}

/**
 * Quick SIREN lookup (for exact 9-digit SIREN searches)
 * @param {string} siren - 9-digit SIREN number
 * @returns {Promise<Object>} Company data
 */
export async function quickSirenLookup(siren) {
  if (!/^\d{9}$/.test(siren)) {
    throw new Error('SIREN must be exactly 9 digits');
  }
  return searchLegalUnits(siren);
}

// ============================================================
// New v2 API service functions
// ============================================================

/**
 * Get all reports for a legal unit (API v2)
 * @param {string} siren - 9-digit SIREN number
 * @param {Object} options - Optional filters
 * @param {number} options.year - Filter by report year
 * @returns {Promise<Object>} Reports data
 */
export async function getReports(siren, options = {}) {
  try {
    const url = new URL(`${API_BASE_URL}/v2/legalunit/${siren}/reports`);
    if (options.year) url.searchParams.set('year', options.year);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Reports API Error:', error);
    throw error;
  }
}

/**
 * Get report counts for a legal unit (API v2)
 * @param {string} siren - 9-digit SIREN number
 * @returns {Promise<Object>} Report counts
 */
export async function getReportCounts(siren) {
  try {
    const response = await fetch(`${API_BASE_URL}/v2/legalunit/${siren}/reports/counts`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Report Counts API Error:', error);
    throw error;
  }
}

/**
 * Get report metadata by ID (API v2)
 * @param {number} reportId - Report ID
 * @returns {Promise<Object>} Report metadata
 */
export async function getReportById(reportId) {
  try {
    const response = await fetch(`${API_BASE_URL}/v2/reports/${reportId}`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Report API Error:', error);
    throw error;
  }
}

/**
 * Get download URL for a report (API v2)
 * @param {number} reportId - Report ID
 * @returns {string} Download URL
 */
export function getReportDownloadUrl(reportId) {
  return `${API_BASE_URL}/v2/reports/${reportId}/download`;
}

/**
 * Get published footprints across multiple legal units (API v2)
 * @param {Object} filters - Query filters
 * @param {string} filters.dateFrom - Start date (YYYY-MM-DD)
 * @param {string} filters.dateTo - End date (YYYY-MM-DD)
 * @param {string} filters.activity - Comma-separated activity codes
 * @param {string} filters.indicators - Comma-separated indicator codes
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Published footprints
 */
export async function getPublishedFootprints(filters = {}, pagination = {}) {
  try {
    const url = new URL(`${API_BASE_URL}/v2/footprints/published`);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
    if (pagination.page) url.searchParams.set('page', pagination.page);
    if (pagination.limit) url.searchParams.set('limit', pagination.limit);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Published Footprints API Error:', error);
    throw error;
  }
}

/**
 * List all available datasets (API v2)
 * @returns {Promise<Object>} Datasets list
 */
export async function getDatasets() {
  try {
    const response = await fetch(`${API_BASE_URL}/v2/datasets`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Datasets API Error:', error);
    throw error;
  }
}

/**
 * List all available metadata tables (API v2)
 * @returns {Promise<Object>} Metadata tables
 */
export async function getMetadataTables() {
  try {
    const response = await fetch(`${API_BASE_URL}/v2/metadata`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Metadata Tables API Error:', error);
    throw error;
  }
}

/**
 * Get entries from a specific metadata table (API v2)
 * @param {string} table - Metadata table name (e.g., 'divisions', 'branches', 'areas')
 * @returns {Promise<Object>} Metadata entries
 */
export async function getMetadata(table) {
  try {
    const response = await fetch(`${API_BASE_URL}/v2/metadata/${table}`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Metadata API Error:', error);
    throw error;
  }
}

/**
 * Get export info for footprints (API v2)
 * @param {Object} options - Optional filters (year, indicators)
 * @returns {Promise<Object>} Export info
 */
export async function getExportInfo(options = {}) {
  try {
    const url = new URL(`${API_BASE_URL}/v2/exports/footprints/info`);
    if (options.year) url.searchParams.set('year', options.year);
    if (options.indicators) url.searchParams.set('indicators', options.indicators);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Export Info API Error:', error);
    throw error;
  }
}

/**
 * Get export download URL for footprints (API v2)
 * @param {Object} options - Export options
 * @param {string} options.format - Format: csv, xlsx, parquet (default: csv)
 * @param {number} options.year - Filter by year
 * @param {string} options.indicators - Comma-separated indicator codes
 * @param {number} options.limit - Row limit
 * @returns {string} Export download URL
 */
export function getExportUrl(options = {}) {
  const url = new URL(`${API_BASE_URL}/v2/exports/footprints`);
  if (options.format) url.searchParams.set('format', options.format);
  if (options.year) url.searchParams.set('year', options.year);
  if (options.indicators) url.searchParams.set('indicators', options.indicators);
  if (options.limit) url.searchParams.set('limit', options.limit);
  return url.toString();
}
