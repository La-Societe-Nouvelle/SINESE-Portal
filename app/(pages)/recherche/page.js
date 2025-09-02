"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";

// Components
import SearchHeader from "./_components/SearchHeader";
import SearchSidebar from "./_components/SearchSidebar";
import SearchControls from "./_components/SearchControls";
import SearchResults from "./_components/SearchResults";
import { NoResultsState, InitialState } from "./_components/EmptyStates";

function SearchContent() {
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
    activitePrincipaleFormationRecherche: false,
    donneesPubliees: []
  });




  // UI state
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  // Remettre à la première page à chaque nouvelle recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // API call to fetch search results
  useEffect(() => {
    if (query.length > 2) {
      setLoading(true);
      
      // Build query parameters including filters and pagination
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('page', currentPage.toString());
      params.append('limit', resultsPerPage.toString());
      
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
  }, [query, filters, currentPage]);

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
      <Container fluid className="py-4">
        <Row>
          {/* Sidebar avec filtres */}
          <Col lg={3}>
            <SearchSidebar
              query={query}
              filters={filters}
              setFilters={setFilters}
              setQuery={setQuery}
              setResults={setResults}
            />
          </Col>

          {/* Contenu principal */}
          <Col lg={9}>
            <div className="main-content">
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
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <div className="mt-2 text-muted">Chargement de la page de recherche...</div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
