/**
 * Utility functions for building API URLs for La Société Nouvelle API
 * Supports all search patterns: exact SIREN, partial SIREN, text search, and filters
 */


/**
 * Build API URL for legal unit search
 * @param {string} baseUrl - Base API URL (e.g., 'https://api.lasocietenouvelle.org')
 * @param {string} query - Search query (SIREN, partial SIREN, or text)
 * @param {Object} filters - Search filters
 * @param {string[]} filters.sectors - Sector codes (e.g., ['62.01A', '43.21A'])
 * @param {string[]} filters.trancheEffectifs - Size ranges (e.g., ['12', '21', '22'])
 * @param {boolean} filters.economieSocialeSolidaire - ESS filter
 * @param {boolean} filters.societeMission - Mission company filter
 * @returns {string} Complete API URL
 */
export function buildLegalUnitSearchUrl(baseUrl = null, query = "", filters = {}) {
  // Use environment variable if no baseUrl provided
  const apiBaseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'https://api.lasocietenouvelle.org';
  
  // Determine the search path based on query type
  let searchPath = '/legalunit';
  
  if (query && query.trim()) {
    // If query is provided, append it to the path
    searchPath += `/${encodeURIComponent(query.trim())}`;
  } else {
    // If no query, add trailing slash for filters-only search
    searchPath += '/';
  }
  
  const url = new URL(searchPath, apiBaseUrl);
 
  
  if (filters.departements && filters.departements.length > 0) {
    url.searchParams.set('departements', filters.departements.join(','));
  }
  
  if (filters.sectors && filters.sectors.length > 0) {
    url.searchParams.set('sectors', filters.sectors.join(','));
  }
  
  if (filters.trancheEffectifs) {
    // Handle both array and string formats
    const trancheValue = Array.isArray(filters.trancheEffectifs) 
      ? filters.trancheEffectifs.join(',')
      : filters.trancheEffectifs;
    url.searchParams.set('trancheEffectifs', trancheValue);
  }
  
  if (filters.economieSocialeSolidaire === true) {
    url.searchParams.set('economieSocialeSolidaire', 'true');
  }
  
  if (filters.societeMission === true) {
    url.searchParams.set('societeMission', 'true');
  }
  
  if (filters.societeMission === false) {
    url.searchParams.set('societeMission', 'false');
  }
  if (filters.donneesPubliees && filters.donneesPubliees.length > 0) {
    url.searchParams.set('donneesPubliees', filters.donneesPubliees.join(','));
  }

  if (filters.empreintePubliee !== undefined) {
    url.searchParams.set('empreintePubliee', filters.empreintePubliee.toString());
  }

  return url.toString();
}

/**
 * Convert frontend filters to API filters format
 * @param {Object} frontendFilters - Filters from the frontend
 * @returns {Object} Filters formatted for the API
 */
export function convertFiltersToApiFormat(frontendFilters) {
  const apiFilters = {};
  
  // Keep departements as departements (API will handle the mapping)
  if (frontendFilters.departements && frontendFilters.departements.length > 0) {
    apiFilters.departements = frontendFilters.departements;
  }
  
  // Convert sectors to sectors
  if (frontendFilters.sectors && frontendFilters.sectors.length > 0) {
    apiFilters.sectors = frontendFilters.sectors;
  }
  
  // Convert trancheEffectifs to trancheEffectifs (keep as single value for comma-separated format)
  if (frontendFilters.trancheEffectifs) {
    apiFilters.trancheEffectifs = frontendFilters.trancheEffectifs;
  }
  
  // Boolean filters
  if (frontendFilters.economieSocialeSolidaire !== undefined) {
    apiFilters.economieSocialeSolidaire = frontendFilters.economieSocialeSolidaire;
  }
  
  if (frontendFilters.societeMission !== undefined) {
    apiFilters.societeMission = frontendFilters.societeMission;
  }

  if (frontendFilters.empreintePubliee !== undefined) {
    apiFilters.empreintePubliee = frontendFilters.empreintePubliee;
  }

  return apiFilters;
}

/**
 * Determine query type for analytics/debugging
 * @param {string} query - Search query
 * @returns {string} Query type: 'siren_exact', 'siren_partial', 'text', or 'empty'
 */
export function getQueryType(query) {
  if (!query || !query.trim()) {
    return 'empty';
  }
  
  const trimmedQuery = query.trim();
  
  // Check if it's all digits
  if (/^\d+$/.test(trimmedQuery)) {
    if (trimmedQuery.length === 9) {
      return 'siren_exact';
    } else if (trimmedQuery.length >= 3 && trimmedQuery.length <= 8) {
      return 'siren_partial';
    }
  }
  
  return 'text';
}

/**
 * Examples of different search URL patterns:
 * 
 * 1. SIREN exact (9 digits) - Direct optimized query:
 * buildLegalUnitSearchUrl(baseUrl, '123456789') 
 * → GET /legalunit/123456789
 * 
 * 2. SIREN partial (3-8 digits) - Mixed SIREN/denomination search:
 * buildLegalUnitSearchUrl(baseUrl, '123') 
 * → GET /legalunit/123
 * 
 * 3. Text search - Denomination search only:
 * buildLegalUnitSearchUrl(baseUrl, 'Electricite') 
 * → GET /legalunit/Electricite
 * 
 * 4. Text search with geographical filters:
 * buildLegalUnitSearchUrl(baseUrl, 'Electricite', { regions: ['69', '75', '13'] })
 * → GET /legalunit/Electricite?regions=69,75,13
 * 
 * 5. Numeric search with sectoral filters:
 * buildLegalUnitSearchUrl(baseUrl, '123', { sectors: ['62.01A', '62.02A'] })
 * → GET /legalunit/123?sectors=62.01A,62.02A
 * 
 * 6. Combined filters:
 * buildLegalUnitSearchUrl(baseUrl, 'Electricite', { 
 *   regions: ['69'], 
 *   sectors: ['43'], 
 *   trancheEffectifs: ['12', '21'] 
 * })
 * → GET /legalunit/Electricite?regions=69&sectors=43&trancheEffectifs=12,21
 * 
 * 7. Filters only (no search query):
 * buildLegalUnitSearchUrl(baseUrl, '', { regions: ['69'] })
 * → GET /legalunit/?regions=69
 * 
 * 8. Boolean filters:
 * buildLegalUnitSearchUrl(baseUrl, '', { 
 *   regions: ['75'], 
 *   economieSocialeSolidaire: true, 
 *   societeMission: false 
 * })
 * → GET /legalunit/?regions=75&economieSocialeSolidaire=true&societeMission=false
 */