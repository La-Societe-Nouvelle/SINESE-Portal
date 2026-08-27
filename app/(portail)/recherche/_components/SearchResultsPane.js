"use client";

import { useSearch } from "./SearchContext";
import SearchControls from "./SearchControls";
import SearchResults from "./SearchResults";
import { SearchResultsSkeleton } from "./LoadingSkeleton";
import { NoResultsState, InitialState, SearchErrorState } from "./EmptyStates";

// Affiche la colonne de résultats selon l'état de la recherche client.
export default function SearchResultsPane() {
  const { hasSearch, loading, error, results, total, page, perPage } = useSearch();

  if (!hasSearch) {
    return <InitialState />;
  }

  if (loading) {
    // Grand skeleton à la première recherche, plus discret ensuite.
    return <SearchResultsSkeleton count={results ? 5 : 20} />;
  }

  if (error) {
    return <SearchErrorState />;
  }

  if (results === null) {
    return null;
  }

  if (results.length === 0) {
    return <NoResultsState />;
  }

  return (
    <>
      <SearchControls resultsCount={total} />
      <SearchResults
        results={results}
        total={total}
        currentPage={page}
        perPage={perPage}
      />
    </>
  );
}
