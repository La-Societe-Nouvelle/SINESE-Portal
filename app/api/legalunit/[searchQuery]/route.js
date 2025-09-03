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
    
    // Parse departements array
    const departements = searchParams.getAll("departements[]");
    if (departements.length > 0) {
      frontendFilters.departements = departements;
    }
    
    // Parse codesNaf array  
    const codesNaf = searchParams.getAll("codesNaf[]");
    if (codesNaf.length > 0) {
      frontendFilters.codesNaf = codesNaf;
    }
    
    // Parse donneesPubliees as comma-separated string
    const donneesPubliees = searchParams.get("donneesPubliees");
    if (donneesPubliees) {
      frontendFilters.donneesPubliees = donneesPubliees.split(',').map(s => s.trim()).filter(s => s);
    }
    
    // Parse single filters
    if (searchParams.get("effectif")) {
      frontendFilters.effectif = searchParams.get("effectif");
    }
    
    if (searchParams.get("ess") === "true") {
      frontendFilters.economieSocialeSolidaire = true;
    }
    
    if (searchParams.get("societeMission")) {
      frontendFilters.societeMission = searchParams.get("societeMission") === "true";
    }
    
    // Convert frontend filters to API format
    const apiFilters = convertFiltersToApiFormat(frontendFilters);
    
    // Handle empty query and no filters case
    if (!searchQuery && Object.keys(apiFilters).length === 0) {
      return Response.json({ legalUnits: [] }, { status: 400 });
    }
    
    // Build the API URL using the new patterns
    const apiUrl = buildLegalUnitSearchUrl(process.env.API_BASE_URL, searchQuery, apiFilters);
    
    console.log('Calling API:', apiUrl);
    
    // Make the API call
    const apiRes = await fetch(apiUrl);
    
    if (!apiRes.ok) {
      console.error('API Error:', apiRes.status, apiRes.statusText);
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