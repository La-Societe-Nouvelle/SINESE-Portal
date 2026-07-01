// Shared utilities for reading/writing search state in URL params.
// params can be a plain object (server searchParams) or URLSearchParams (client useSearchParams).

function get(params, key) {
  return typeof params.get === 'function' ? params.get(key) : (params[key] ?? null);
}

export function parseFiltersFromParams(params) {
  const sectors    = get(params, "sectors");
  const dept       = get(params, "dept");
  const indics     = get(params, "indics");
  const mission    = get(params, "mission");

  return {
    sectors:                         sectors  ? sectors.split(",")  : [],
    departements:                    dept     ? dept.split(",")     : [],
    trancheEffectifs:                get(params, "tranche") || "",
    economieSocialeSolidaire:        get(params, "ess")       === "1",
    societeMission:                  mission === "true" ? true : mission === "false" ? false : null,
    activitePrincipaleArtisanale:    get(params, "artisanal")  === "1",
    activitePrincipaleFormationRecherche: get(params, "formation") === "1",
    donneesPubliees:                 indics   ? indics.split(",")   : [],
    empreintePubliee:                get(params, "empreinte") === "1",
  };
}

export function hasAnyFilter(filters) {
  return (
    filters.sectors?.length > 0 ||
    filters.departements?.length > 0 ||
    !!filters.trancheEffectifs ||
    filters.economieSocialeSolidaire ||
    (filters.societeMission !== null && filters.societeMission !== undefined) ||
    filters.activitePrincipaleArtisanale ||
    filters.activitePrincipaleFormationRecherche ||
    filters.donneesPubliees?.length > 0 ||
    filters.empreintePubliee
  );
}

// Serializes filters back into URLSearchParams, preserving unrelated params (e.g. s, p).
// Always deletes p (page) so filter changes reset to page 1.
export function filtersToSearchParams(filters, baseParams) {
  const params = new URLSearchParams(baseParams);
  params.delete("p");

  const setOrDelete = (key, value) => {
    if (value) params.set(key, value); else params.delete(key);
  };

  setOrDelete("sectors",   filters.sectors?.join(","));
  setOrDelete("dept",      filters.departements?.join(","));
  setOrDelete("tranche",   filters.trancheEffectifs);
  setOrDelete("ess",       filters.economieSocialeSolidaire ? "1" : null);
  setOrDelete("artisanal", filters.activitePrincipaleArtisanale ? "1" : null);
  setOrDelete("formation", filters.activitePrincipaleFormationRecherche ? "1" : null);
  setOrDelete("indics",    filters.donneesPubliees?.join(","));
  setOrDelete("empreinte", filters.empreintePubliee ? "1" : null);

  if (filters.societeMission === true)       params.set("mission", "true");
  else if (filters.societeMission === false)  params.set("mission", "false");
  else                                        params.delete("mission");

  return params;
}
