import { Suspense } from "react";
import { Container } from "react-bootstrap";
import { searchLegalUnits } from "@/actions/search";
import { parseFiltersFromParams, hasAnyFilter } from "./_utils/searchParams";

import SearchHeader from "./_components/SearchHeader";
import SearchFilterBar from "./_components/SearchFilterBar";
import SearchControls from "./_components/SearchControls";
import SearchResults from "./_components/SearchResults";
import { SearchResultsSkeleton } from "./_components/LoadingSkeleton";
import { NoResultsState, InitialState } from "./_components/EmptyStates";
import { SearchTransitionProvider, ResultsPendingOverlay } from "./_components/SearchTransitionContext";

async function SearchResultsSection({ query, filters, page }) {
  const hasSearch = query.length > 2 || hasAnyFilter(filters);

  if (!hasSearch) {
    return <InitialState />;
  }

  const data = await searchLegalUnits(query, filters, page);

  if (data.legalUnits.length === 0) {
    return <NoResultsState />;
  }

  return (
    <>
      <SearchControls resultsCount={data.total} />
      <SearchResults
        results={data.legalUnits}
        total={data.total}
        currentPage={page}
        perPage={data.perPage}
      />
    </>
  );
}

export default async function RecherchePage({ searchParams }) {
  const params = await searchParams;
  const query   = params.s || "";
  const parsedPage = parseInt(params.p, 10);
  const page    = Number.isInteger(parsedPage) ? Math.max(1, parsedPage) : 1;
  const filters = parseFiltersFromParams(params);

  // Only re-suspend (show full skeleton) when the search text changes.
  // Filter and page changes go through a transition instead, keeping old results visible.
  const suspenseKey = query;

  return (
    <div className="search-page">
      <SearchTransitionProvider>
        <div className="search-header bg-primary text-white py-4">
          <Container fluid>
            <SearchHeader initialQuery={query} />
            <SearchFilterBar className="mt-4" />
          </Container>
        </div>

        <Container className="py-4">
          <div className="main-content">
            <ResultsPendingOverlay>
              <Suspense key={suspenseKey} fallback={<SearchResultsSkeleton count={20} />}>
                <SearchResultsSection query={query} filters={filters} page={page} />
              </Suspense>
            </ResultsPendingOverlay>
          </div>
        </Container>
      </SearchTransitionProvider>
    </div>
  );
}
