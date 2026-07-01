import { Suspense } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { searchLegalUnits } from "@/actions/search";
import { parseFiltersFromParams, hasAnyFilter } from "./_utils/searchParams";

import SearchHeader from "./_components/SearchHeader";
import SearchSidebar from "./_components/SearchSidebar";
import SearchControls from "./_components/SearchControls";
import SearchResults from "./_components/SearchResults";
import { SearchResultsSkeleton } from "./_components/LoadingSkeleton";
import { NoResultsState, InitialState } from "./_components/EmptyStates";

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
  const page    = Math.max(1, parseInt(params.p || "1", 10));
  const filters = parseFiltersFromParams(params);

  // Changing the key forces Suspense to re-suspend and show the skeleton on every new search
  const suspenseKey = JSON.stringify(params);

  return (
    <div className="search-page">
      <SearchHeader initialQuery={query} />

      <Container fluid className="py-4">
        <Row>
          <Col lg={3}>
            <SearchSidebar />
          </Col>

          <Col lg={9}>
            <div className="main-content">
              <Suspense key={suspenseKey} fallback={<SearchResultsSkeleton count={20} />}>
                <SearchResultsSection query={query} filters={filters} page={page} />
              </Suspense>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
