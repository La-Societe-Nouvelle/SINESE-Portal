import { buildLegalUnitSearchUrl, convertFiltersToApiFormat } from '@/_utils/apiUrlBuilder';

export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Await params in Next.js 15
    const resolvedParams = await params;
    
    // Get search query from URL path parameter
    const searchQuery = resolvedParams.searchQuery ? decodeURIComponent(resolvedParams.searchQuery) : "";
    
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
    const apiFilters = convertFiltersToApiFormat(frontendFilters);
    
    // Handle empty query and no filters case
    if (!searchQuery && Object.keys(apiFilters).length === 0) {
      return Response.json({ legalUnits: [] }, { status: 400 });
    }
    
    // Build the API URL using the new patterns
    const apiUrl = buildLegalUnitSearchUrl(process.env.API_BASE_URL, searchQuery, apiFilters);
    
    
    // Make the API call
    const apiRes = await fetch(apiUrl);
    
    if (!apiRes.ok) {
      console.error('API Error:', apiRes.status, apiRes.statusText);

      // 404 = pas de résultats trouvés, retourner un tableau vide avec 200
      if (apiRes.status === 404) {
        return Response.json({
          legalUnits: [],
          message: "Aucun résultat trouvé"
        });
      }

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