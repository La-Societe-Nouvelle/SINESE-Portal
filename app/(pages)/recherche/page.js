"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";
import { getQueryType } from "@/_utils/apiUrlBuilder";
import { sortByTotalIndicators } from "@/_utils/utils";

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
  const [loading, setLoading] = useState(initialQuery.length > 2); 
  const [hasSearched, setHasSearched] = useState(false);

  // Ref pour gérer le timeout de debounce
  const debounceTimeoutRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

  // Filters state
  const [filters, setFilters] = useState({
    secteur: "",
    sectors: [],  
    departements: [],  
    trancheEffectifs: "",
    formeJuridique: "",
    sortBy: "pertinence",
    economieSocialeSolidaire: false,
    societeMission: false,
    activitePrincipaleArtisanale: false,
    activitePrincipaleFormationRecherche: false,
    donneesPubliees: [],
    empreintePubliee : true,
  });

 

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
    // Reset hasSearched when query changes significantly
    const { empreintePubliee, sortBy, ...searchFilters } = filters;
    if (debouncedQuery.length <= 2 && !Object.values(searchFilters).some(f => Array.isArray(f) ? f.length > 0 : f)) {
      setHasSearched(false);
    }
  }, [debouncedQuery, filters]);

  // Build API URL using new pattern: /api/legalunit/terme instead of ?q=terme
  const buildApiUrl = (searchQuery, searchFilters) => {
    // Si on a seulement une recherche textuelle (pas de filtres), forcer empreintePubliee à false
    const hasFilters = searchFilters.departements?.length > 0 ||
                      searchFilters.sectors?.length > 0 ||
                      searchFilters.trancheEffectifs ||
                      searchFilters.economieSocialeSolidaire ||
                      searchFilters.societeMission ||
                      searchFilters.donneesPubliees?.length > 0;

    const modifiedFilters = { ...searchFilters };
    if (!hasFilters && searchQuery.length > 2) {
      modifiedFilters.empreintePubliee = false;
    }
    // Build path: /api/legalunit/terme or /api/legalunit/ (for filters only)
    let path = '/api/legalunit';
    if (searchQuery && searchQuery.trim()) {
      path += `/${encodeURIComponent(searchQuery.trim())}`;
    } else {
      path += '/';
    }

    // Build query parameters for filters
    const params = new URLSearchParams();

    // Format filters according to API documentation
    if (modifiedFilters.sectors?.length > 0) {
      params.set('sectors', modifiedFilters.sectors.join(','));
    }
    if (modifiedFilters.departements?.length > 0) {
      params.set('departements', modifiedFilters.departements.join(','));
    }
    if (modifiedFilters.trancheEffectifs) {
      params.set('trancheEffectifs', modifiedFilters.trancheEffectifs);
    }
    if (modifiedFilters.economieSocialeSolidaire) {
      params.set('economieSocialeSolidaire', 'true');
    }
    if (modifiedFilters.societeMission) {
      params.set('societeMission', 'true');
    }

    // Additional filters according to API documentation
    if (modifiedFilters.donneesPubliees?.length > 0) {
      params.set('donneesPubliees', modifiedFilters.donneesPubliees.join(','));
    }
    // Empreinte sociétale publiée filter
    if (modifiedFilters.empreintePubliee !== undefined) {
      params.set('empreintePubliee', modifiedFilters.empreintePubliee.toString());
    }
    // Note: These filters are not documented in the API spec but kept for compatibility
    if (modifiedFilters.activitePrincipaleArtisanale) {
      params.set('artisanale', 'true');
    }
    if (modifiedFilters.activitePrincipaleFormationRecherche) {
      params.set('formationRecherche', 'true');
    }

    // Return final URL
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  // API call to fetch search results using new URL patterns
  useEffect(() => {

    const shouldSearch = debouncedQuery.length > 2 ||
      filters.departements.length > 0 ||
      filters.sectors.length > 0 ||
      filters.trancheEffectifs ||
      filters.economieSocialeSolidaire ||
      filters.societeMission ||
      filters.donneesPubliees.length > 0;

    if (shouldSearch) {
      setLoading(true);
      setHasSearched(true); // Mark that we've performed a search

      // Build the new API URL using the new patterns
      const apiUrl = buildApiUrl(debouncedQuery, filters);
      console.log('url', apiUrl);


      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          // Trier par nombre total d'indicateurs (plus d'indicateurs en premier)
          const sortedResults = sortByTotalIndicators(data.legalUnits || []);
          setResults(sortedResults);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Erreur lors de la recherche:', error);
          setResults([]);
          setLoading(false);
        });
    } else {
      // Clear results and reset search state when criteria are not met
      if (hasSearched) {
        setResults([]);
        setHasSearched(false);
      }
      setLoading(false);
    }
  }, [debouncedQuery, filters, hasSearched]);

  const handleSearch = (e) => {
    e.preventDefault();
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
              />

              {/* No Results - only show after a search has been performed */}
              {!loading && results.length === 0 && hasSearched && (
                <NoResultsState onNewSearch={() => {
                  setQuery("");
                  setHasSearched(false);
                }} />
              )}

              {/* Results */}
              <SearchResults
                results={results}
                loading={loading}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                resultsPerPage={resultsPerPage}
              />

              {/* Empty State - show when no search has been performed */}
              {!loading && results.length === 0 && !hasSearched && (
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
