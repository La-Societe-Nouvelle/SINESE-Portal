"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";
import { buildLegalUnitSearchUrl, getQueryType } from "@/_utils/apiUrlBuilder";

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
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Ref pour gérer le timeout de debounce
  const debounceTimeoutRef = useRef(null);

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

  // Debouncing de la query pour éviter trop de requêtes
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Déterminer le délai de debounce selon le type de recherche
    const getDebounceDelay = (searchQuery) => {
      const queryType = getQueryType(searchQuery);
      
      // SIREN exact (9 chiffres) : recherche immédiate
      if (queryType === 'siren_exact') {
        return 0;
      }
      
      // SIREN partiel (3-8 chiffres) : délai court
      if (queryType === 'siren_partial') {
        return 300;
      }
      
      // Recherche textuelle : délai plus long pour laisser l'utilisateur finir de taper
      return 600;
    };

    const delay = getDebounceDelay(query);
    
    // Si pas de délai, mettre à jour immédiatement
    if (delay === 0) {
      setDebouncedQuery(query);
    } else {
      // Sinon, programmer la mise à jour avec délai
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedQuery(query);
      }, delay);
    }

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // Remettre à la première page à chaque nouvelle recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  // Build API URL using new pattern: /api/legalunit/terme instead of ?q=terme
  const buildApiUrl = (searchQuery, searchFilters) => {
    // Build path: /api/legalunit/terme or /api/legalunit/ (for filters only)
    let path = '/api/legalunit';
    if (searchQuery && searchQuery.trim()) {
      path += `/${encodeURIComponent(searchQuery.trim())}`;
    } else {
      path += '/';
    }
    
    // Build query parameters for filters
    const params = new URLSearchParams();
    
    // Direct filters mapping
    if (searchFilters.departements?.length > 0) {
      searchFilters.departements.forEach(dept => params.append('departements[]', dept));
    }
    if (searchFilters.codesNaf?.length > 0) {
      searchFilters.codesNaf.forEach(code => params.append('codesNaf[]', code));
    }
    if (searchFilters.effectif) {
      params.set('effectif', searchFilters.effectif);
    }
    if (searchFilters.economieSocialeSolidaire) {
      params.set('ess', 'true');
    }
    if (searchFilters.societeMission) {
      params.set('societeMission', 'true');
    }
    
    // Additional filters (not yet supported by API but kept for backward compatibility)
    if (searchFilters.donneesPubliees?.length > 0) {
      params.set('donneesPubliees', searchFilters.donneesPubliees.join(','));
    }
    if (searchFilters.activitePrincipaleArtisanale) {
      params.set('artisanale', 'true');
    }
    if (searchFilters.activitePrincipaleFormationRecherche) {
      params.set('formationRecherche', 'true');
    }
    
    // Return final URL
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  // API call to fetch search results using new URL patterns (avec debounced query)
  useEffect(() => {
    console.log('FILTERS')
    console.log(filters)
    const shouldSearch = debouncedQuery.length > 2 || 
      filters.departements.length > 0 || 
      filters.codesNaf.length > 0 || 
      filters.effectif || 
      filters.economieSocialeSolidaire || 
      filters.societeMission ||
      filters.donneesPubliees.length > 0;
      
    if (shouldSearch) {
      setLoading(true);
      
      // Build the new API URL using the new patterns
      const apiUrl = buildApiUrl(debouncedQuery, filters);
      
      console.log(`🔍 Search type: ${getQueryType(debouncedQuery)}, URL: ${apiUrl}`);
      
      fetch(apiUrl)
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
  }, [debouncedQuery, filters, currentPage]);

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
