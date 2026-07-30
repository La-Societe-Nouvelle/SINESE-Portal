import { Container } from "react-bootstrap";

import SearchHeader from "./_components/SearchHeader";
import SearchFilterBar from "./_components/SearchFilterBar";
import SearchResultsPane from "./_components/SearchResultsPane";
import { SearchProvider } from "./_components/SearchContext";

// La recherche est pilotée côté client (voir SearchContext) : les filtres,
// la pagination et le texte déclenchent des fetch annulables vers
// /api/portail/search, sans navigation App Router. Cette page ne fait que
// poser le layout et transmettre les params d'URL initiaux (deep links).
export default async function RecherchePage({ searchParams }) {
  const params = await searchParams;

  return (
    <div className="search-page">
      <SearchProvider initialParams={params}>
        <div className="search-header bg-primary text-white py-4">
          <Container fluid>
            <SearchHeader />
            <SearchFilterBar className="mt-4" />
          </Container>
        </div>

        <Container className="py-4">
          <div className="main-content">
            <SearchResultsPane />
          </div>
        </Container>
      </SearchProvider>
    </div>
  );
}
