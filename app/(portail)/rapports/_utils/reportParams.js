const ARRAY_KEYS = { annees: 'annees', secteurs: 'secteurs', formats: 'formats', types: 'types' };

function getParam(params, key) {
  if (params instanceof URLSearchParams) return params.get(key);
  return params?.[key] ?? null;
}

function parseArrayParam(params, key) {
  const raw = getParam(params, key);
  if (!raw) return [];
  return raw.split(',').map((v) => v.trim()).filter(Boolean);
}

export function parseReportFiltersFromParams(params) {
  return {
    annees: parseArrayParam(params, ARRAY_KEYS.annees),
    secteurs: parseArrayParam(params, ARRAY_KEYS.secteurs),
    formats: parseArrayParam(params, ARRAY_KEYS.formats),
    types: parseArrayParam(params, ARRAY_KEYS.types),
  };
}

const VALID_SORT_KEYS = ['denomination', 'year', 'type', 'secteur'];

const DEFAULT_SORT = 'denomination';
const DEFAULT_DIR = 'asc';

export function parseReportSort(params) {
  const sortRaw = getParam(params, 'sort');
  const sort = VALID_SORT_KEYS.includes(sortRaw) ? sortRaw : DEFAULT_SORT;
  const dirRaw = getParam(params, 'dir');
  const dir = dirRaw === 'asc' || dirRaw === 'desc' ? dirRaw : DEFAULT_DIR;
  return { sort, dir };
}

export function reportFiltersToSearchParams(filters, sort, dir, currentParams) {
  const params = new URLSearchParams(currentParams);
  for (const key of Object.values(ARRAY_KEYS)) {
    const value = filters[key];
    if (value && value.length > 0) params.set(key, value.join(','));
    else params.delete(key);
  }
  if (sort && sort !== DEFAULT_SORT) params.set('sort', sort); else params.delete('sort');
  if (dir && dir !== DEFAULT_DIR) params.set('dir', dir); else params.delete('dir');
  params.delete('p'); // filter/sort changes reset pagination
  return params;
}

export function hasAnyReportFilter(filters) {
  return Object.values(filters).some((v) => Array.isArray(v) && v.length > 0);
}
