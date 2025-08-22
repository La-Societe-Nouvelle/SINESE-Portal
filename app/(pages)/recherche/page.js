"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Row } from "react-bootstrap";

// Components
import SearchHeader from "./_components/SearchHeader";
import SearchFilters from "./_components/SearchFilters";
import SearchControls from "./_components/SearchControls";
import SearchResults from "./_components/SearchResults";
import { NoResultsState, InitialState } from "./_components/EmptyStates";

export default function RecherchePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("s") || "";
  
  // Search and results state
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

  // Filters state
  const [filters, setFilters] = useState({
    secteur: "",
    codesNaf: [], // Nouveau filtre pour les codes NAF multiples
    departements: [], // Remplace region par departements (multi-sélection)
    effectif: "",
    formeJuridique: "",
    sortBy: "pertinence",
    // Filtres bonus
    economieSocialeSolidaire: false,
    societeMission: false,
    activitePrincipaleArtisanale: false,
    activitePrincipaleExtractive: false,
    activitePrincipaleFormationRecherche: false,
    // Filtre données publiées (multi-sélection)
    donneesPubliees: []
  });




  // UI state
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  // Remettre à la première page à chaque nouvelle recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Mock data for UI development (commented API call)
  useEffect(() => {
    if (query.length > 2) {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        // Mock data based on your API response structure
        const mockResults = [
          {
            siren: "123456789",
            denomination: "SARL TechnoVerte Innovation",
            activitePrincipaleCode: "62.01Z",
            activitePrincipaleLibelle: "Programmation informatique",
            communeSiege: "Paris 11ème",
            trancheEffectifs: "10-19 salariés",
            categorieJuridiqueLibelle: "Société à responsabilité limitée",
            economieSocialeSolidaire: false,
            societeMission: true,
            donneesPubliees: ["ECO", "GHG", "WAT", "SOC", "KNW"],
            donneesEstimees: 3,
            donneesDefaut: 4,
            indicateursHorsESE: 2
          },
          {
            siren: "987654321", 
            denomination: "Coopérative Bio des Jardins",
            activitePrincipaleCode: "01.13Z",
            activitePrincipaleLibelle: "Culture de légumes, de melons, de racines et de tubercules",
            communeSiege: "Lyon 3ème",
            trancheEffectifs: "3-5 salariés",
            categorieJuridiqueLibelle: "Société coopérative agricole",
            economieSocialeSolidaire: true,
            societeMission: false,
            donneesPubliees: ["ECO", "GHG", "MAT"],
            donneesEstimees: 5,
            donneesDefaut: 4,
            indicateursHorsESE: 0
          },
          {
            siren: "456789123",
            denomination: "Entreprise Recyclage Durable SARL",
            activitePrincipaleCode: "38.32Z", 
            activitePrincipaleLibelle: "Récupération de déchets triés",
            communeSiege: "Marseille 1er",
            trancheEffectifs: "20-49 salariés",
            categorieJuridiqueLibelle: "Société à responsabilité limitée",
            economieSocialeSolidaire: false,
            societeMission: true,
            donneesPubliees: ["WAS", "GHG", "ECO", "SOC", "MAT", "NRG", "WAT", "KNW"],
            donneesEstimees: 2,
            donneesDefaut: 2,
            indicateursHorsESE: 5
          },
          {
            siren: "321654987",
            denomination: "Association Formation Numérique Solidaire",
            activitePrincipaleCode: "85.59A",
            activitePrincipaleLibelle: "Formation continue d'adultes",
            communeSiege: "Toulouse",
            trancheEffectifs: "6-9 salariés", 
            categorieJuridiqueLibelle: "Association déclarée",
            economieSocialeSolidaire: true,
            societeMission: false,
            donneesPubliees: ["KNW", "SOC", "ECO"],
            donneesEstimees: 0,
            donneesDefaut: 9,
            indicateursHorsESE: 1
          },
          {
            siren: "789123456",
            denomination: "SAS Énergie Verte Atlantique",
            activitePrincipaleCode: "35.11Z",
            activitePrincipaleLibelle: "Production d'électricité",
            communeSiege: "Nantes",
            trancheEffectifs: "50-99 salariés",
            categorieJuridiqueLibelle: "Société par actions simplifiée", 
            economieSocialeSolidaire: false,
            societeMission: true,
            donneesPubliees: ["NRG", "GHG", "ECO", "WAT", "MAT", "SOC"],
            donneesEstimees: 4,
            donneesDefaut: 2,
            indicateursHorsESE: 3
          },
          {
            siren: "654321987",
            denomination: "Micro-Entreprise Artisan Local",
            activitePrincipaleCode: "43.32A",
            activitePrincipaleLibelle: "Travaux de menuiserie bois et PVC",
            communeSiege: "Bordeaux",
            trancheEffectifs: "1-2 salariés",
            categorieJuridiqueLibelle: "Entreprise individuelle",
            economieSocialeSolidaire: false,
            societeMission: false,
            donneesPubliees: [],
            donneesEstimees: 8,
            donneesDefaut: 4,
            indicateursHorsESE: 0
          },
          {
            siren: "147258369",
            denomination: "Grande Distribution Responsable SA",
            activitePrincipaleCode: "47.11D",
            activitePrincipaleLibelle: "Supermarchés",
            communeSiege: "Lille",
            trancheEffectifs: "500-999 salariés",
            categorieJuridiqueLibelle: "Société anonyme",
            economieSocialeSolidaire: false,
            societeMission: true,
            donneesPubliees: ["ECO", "GHG", "WAT", "SOC", "KNW", "MAT", "WAS", "NRG", "HAZ", "ART", "EQU", "GEQ"],
            donneesEstimees: 0,
            donneesDefaut: 0,
            indicateursHorsESE: 8
          },
          {
            siren: "963852741",
            denomination: "Startup GreenTech Solutions",
            activitePrincipaleCode: "72.19Z",
            activitePrincipaleLibelle: "Autres activités de recherche-développement en sciences physiques et naturelles",
            communeSiege: "Montpellier",
            trancheEffectifs: "20-49 salariés",
            categorieJuridiqueLibelle: "Société par actions simplifiée",
            economieSocialeSolidaire: false,
            societeMission: true,
            donneesPubliees: ["ECO", "GHG", "KNW"],
            donneesEstimees: 7,
            donneesDefaut: 2,
            indicateursHorsESE: 1
          },
          {
            siren: "852741963",
            denomination: "Fondation Environnement & Société",
            activitePrincipaleCode: "94.99Z",
            activitePrincipaleLibelle: "Autres organisations fonctionnant par adhésion volontaire",
            communeSiege: "Strasbourg",
            trancheEffectifs: "10-19 salariés",
            categorieJuridiqueLibelle: "Fondation",
            economieSocialeSolidaire: true,
            societeMission: false,
            donneesPubliees: ["SOC", "ECO", "KNW", "WAT", "GHG"],
            donneesEstimees: 1,
            donneesDefaut: 6,
            indicateursHorsESE: 0
          },
          {
            siren: "741852963",
            denomination: "Industriel Traditionnel SARL",
            activitePrincipaleCode: "25.11Z",
            activitePrincipaleLibelle: "Fabrication de structures métalliques et de parties de structures",
            communeSiege: "Saint-Étienne",
            trancheEffectifs: "100-199 salariés",
            categorieJuridiqueLibelle: "Société à responsabilité limitée",
            economieSocialeSolidaire: false,
            societeMission: false,
            donneesPubliees: ["ECO"],
            donneesEstimees: 6,
            donneesDefaut: 5,
            indicateursHorsESE: 0
          }
        ];

        // Filter results based on query (simple demo filtering)
        const filteredResults = mockResults.filter(company => 
          company.denomination.toLowerCase().includes(query.toLowerCase()) ||
          company.activitePrincipaleLibelle.toLowerCase().includes(query.toLowerCase()) ||
          company.siren.includes(query)
        );

        setResults(filteredResults);
        setLoading(false);
      }, 800); // Simulate network delay

    } else {
      setResults([]);
    }

    // COMMENTED API CALL - Uncomment when ready for production
    /*
    if (query.length > 2) {
      setLoading(true);
      
      // Build query parameters including filters
      const params = new URLSearchParams();
      params.append('q', query);
      
      // Add regular filters if they have values
      if (filters.secteur) params.append('secteur', filters.secteur);
      if (filters.codesNaf.length > 0) {
        filters.codesNaf.forEach(code => {
          params.append('codesNaf[]', code);
        });
      }
      if (filters.departements.length > 0) {
        filters.departements.forEach(dept => {
          params.append('departements[]', dept);
        });
      }
      if (filters.effectif) params.append('effectif', filters.effectif);
      if (filters.formeJuridique) params.append('formeJuridique', filters.formeJuridique);
      if (filters.donneesPubliees.length > 0) {
        filters.donneesPubliees.forEach(indicator => {
          params.append('donneesPubliees[]', indicator);
        });
      }
      
      // Add bonus filters if they are true
      if (filters.economieSocialeSolidaire) params.append('ess', 'true');
      if (filters.societeMission) params.append('societeMission', 'true');
      if (filters.activitePrincipaleArtisanale) params.append('artisanale', 'true');
      if (filters.activitePrincipaleExtractive) params.append('extractive', 'true');
      if (filters.activitePrincipaleFormationRecherche) params.append('formationRecherche', 'true');
      
      fetch(`/api/legalunit?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.legalUnits || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Erreur lors de la recherche:', error);
          setResults([]);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
    */
  }, [query, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // fetch is already triggered by useEffect
  };

  return (
    <div className="search-page">
      {/* Header with search bar */}
      <SearchHeader 
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
      />

      {/* Main content with sidebar */}
      <div className="container-fluid">
        <Row className="g-0">
          {/* Sidebar Filters */}
          <SearchFilters 
            query={query}
            filters={filters}
            setFilters={setFilters}
          />

          {/* Main Results */}
          <div className="col-lg-9">
            <div className="results-area p-4">
              {/* Controls Bar */}
              <SearchControls
                loading={loading}
                resultsCount={results.length}
                filters={filters}
                setFilters={setFilters}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />

              {/* No Results */}
              {!loading && results.length === 0 && query.length > 2 && (
                <NoResultsState onNewSearch={() => setQuery("")} />
              )}

              {/* Results */}
              <SearchResults
                results={results}
                loading={loading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                resultsPerPage={resultsPerPage}
              />

              {/* Empty State */}
              {!loading && results.length === 0 && query.length <= 2 && (
                <InitialState />
              )}
            </div>
          </div>
        </Row>
      </div>
    </div>
  );
}
