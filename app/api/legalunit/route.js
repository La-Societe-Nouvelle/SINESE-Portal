import { buildLegalUnitSearchUrl, convertFiltersToApiFormat } from '@/_utils/apiUrlBuilder';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // This route handles filters-only search (no search term in path)
    // Search term queries are handled by [searchQuery]/route.js
    
    // Parse filters from search params
    const frontendFilters = {};
    
    // Parse departements as comma-separated string
    const departements = searchParams.get("departements");
    if (departements) {
      frontendFilters.departements = departements.split(',').map(s => s.trim()).filter(s => s);
    }
    
    // Parse sectors as comma-separated string  
    const sectors = searchParams.get("sectors");
    if (sectors) {
      frontendFilters.sectors = sectors.split(',').map(s => s.trim()).filter(s => s);
    }
    
    // Parse donneesPubliees as comma-separated string
    const donneesPubliees = searchParams.get("donneesPubliees");
    if (donneesPubliees) {
      frontendFilters.donneesPubliees = donneesPubliees.split(',').map(s => s.trim()).filter(s => s);
    }
    // Parse single filters
    if (searchParams.get("trancheEffectifs")) {
      frontendFilters.trancheEffectifs = searchParams.get("trancheEffectifs");
    }
    
    if (searchParams.get("economieSocialeSolidaire") === "true") {
      frontendFilters.economieSocialeSolidaire = true;
    }
    
    if (searchParams.get("societeMission")) {
      frontendFilters.societeMission = searchParams.get("societeMission") === "true";
    }

    if (searchParams.get("empreintePubliee")) {
      frontendFilters.empreintePubliee = searchParams.get("empreintePubliee") === "true";
    }

    // Convert frontend filters to API format
    // Must have at least one filter for filters-only search
    if (Object.keys(frontendFilters).length === 0) {
      return Response.json({ 
        legalUnits: [], 
        message: "Au moins un filtre est requis pour la recherche" 
      }, { status: 400 });
    }
    
    // Build the API URL (empty query, filters only)
    const apiUrl = buildLegalUnitSearchUrl(process.env.API_BASE_URL, "", frontendFilters);
    
    
    // Make the API call
    const apiRes = await fetch(apiUrl);
    
    if (!apiRes.ok) {
      console.error('API Error:', apiRes.status, apiRes.statusText);

      // 404 = pas de résultats trouvés, retourner un tableau vide avec 200
      if (apiRes.status === 404) {
        console.error(`[API 404] GET ${req.url} - Aucun résultat trouvé. Filters: ${JSON.stringify(frontendFilters)}`);
        return Response.json({
          legalUnits: [],
          message: "Aucun résultat trouvé"
        });
      }

      // Autres erreurs = vraies erreurs serveur
      return Response.json({
        legalUnits: [],
        error: `API returned ${apiRes.status}`
      }, { status: 502 });
    }
    
    const data = await apiRes.json();
    return Response.json(data);
    
  } catch (error) {
    console.error('Search API Error:', error);
    return Response.json({ 
      legalUnits: [], 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
