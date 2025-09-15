/**
 * API service functions for SINESE Portal
 * Handles all interactions with La Société Nouvelle API
 */

import { buildLegalUnitSearchUrl, convertFiltersToApiFormat, getQueryType } from './apiUrlBuilder';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lasocietenouvelle.org';

/**
 * Search for legal units using the new API patterns
 * @param {string} query - Search query (SIREN, partial SIREN, or text)
 * @param {Object} filters - Search filters
 * @param {Object} options - Additional options (pagination, etc.)
 * @returns {Promise<Object>} Search results
 */
export async function searchLegalUnits(query = "", filters = {}, options = {}) {
  try {
    // Convert frontend filters to API format
    const apiFilters = convertFiltersToApiFormat(filters);
    
    // Build the API URL using our utility
    const apiUrl = buildLegalUnitSearchUrl(API_BASE_URL, query, apiFilters);
    
    console.log(`Search type: ${getQueryType(query)}, URL: ${apiUrl}`);
    
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
 * Get company footprint data by SIREN
 * @param {string} siren - 9-digit SIREN number
 * @returns {Promise<Object>} Company footprint data
 */
export async function getCompanyFootprint(siren) {
  try {
    const response = await fetch(`${API_BASE_URL}/legalunitFootprint/${siren}`);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Company Footprint API Error:', error);
    throw error;
  }
}

/**
 * Get division footprint data
 * @param {string} code - Division code
 * @returns {Promise<Object>} Division footprint data
 */
export async function getDivisionFootprint(code) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/defaultfootprint/?code=${code}&aggregate=PRD&area=FRA`
    );
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Division Footprint API Error:', error);
    throw error;
  }
}

/**
 * Get historical division footprint data
 * @param {string} code - Division code
 * @returns {Promise<Object>} Historical division footprint data
 */
export async function getHistoricalDivisionFootprint(code) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/macrodata/macro_fpt_a88?division=${code}&aggregate=PRD&area=FRA`
    );
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Historical Division Footprint API Error:', error);
    throw error;
  }
}

/**
 * Search companies with specific filters only (no text query)
 * Useful for "Browse by region", "Browse by sector" type functionality
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} Search results
 */
export async function browseCompanies(filters) {
  return searchLegalUnits("", filters);
}

/**
 * Quick SIREN lookup (for exact 9-digit SIREN searches)
 * Uses the optimized direct endpoint
 * @param {string} siren - 9-digit SIREN number
 * @returns {Promise<Object>} Company data
 */
export async function quickSirenLookup(siren) {
  if (!/^\d{9}$/.test(siren)) {
    throw new Error('SIREN must be exactly 9 digits');
  }
  
  return searchLegalUnits(siren);
}