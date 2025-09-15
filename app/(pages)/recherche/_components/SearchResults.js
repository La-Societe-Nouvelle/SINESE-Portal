"use client";

import { Pagination } from "react-bootstrap";
import CompanyCard from "./CompanyCard";
import { SearchResultsSkeleton } from "./LoadingSkeleton";
import SearchResultsDivider from "@/_components/SearchResultsDivider";
import { separateByDataAvailability } from "@/_utils/utils";

export default function SearchResults({ 
  results, 
  loading, 
  currentPage, 
  setCurrentPage, 
  resultsPerPage 
}) {
  // Show loading skeleton while searching
  if (loading) {
    return <SearchResultsSkeleton count={resultsPerPage} />;
  }

  // Don't show anything if no results
  if (results.length === 0) return null;

  // Séparer les résultats par disponibilité des données
  const { withData, withoutData } = separateByDataAvailability(results);
  
  // Pagination logic
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentResults = results.slice(indexOfFirst, indexOfLast);
  
  // Séparer aussi les résultats paginés
  const { withData: currentWithData, withoutData: currentWithoutData } = separateByDataAvailability(currentResults);

  // Function to handle page change with scroll to top
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }, 100);
  };

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      // Affiche seulement les pages proches de la page courante, la première et la dernière
      if (number === 1 || number === totalPages || (number >= currentPage - 2 && number <= currentPage + 2)) {
        items.push(
          <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
            {number}
          </Pagination.Item>
        );
      } else if ((number === currentPage - 3 && number > 1) || (number === currentPage + 3 && number < totalPages)) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${number}`} disabled />);
      }
    }
    
    return (
      <Pagination>
        <Pagination.Prev 
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
          disabled={currentPage === 1} 
        />
        {items}
        <Pagination.Next
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <>
      <div className="results-list">
        {/* Entreprises avec données */}
        {currentWithData.map((company) => (
          <CompanyCard key={company.siren} company={company} />
        ))}

        {/* Divider si on a les deux types sur cette page */}
        {currentWithData.length > 0 && currentWithoutData.length > 0 && (
          <SearchResultsDivider 
            withDataCount={withData.length} 
            withoutDataCount={withoutData.length}
          />
        )}

        {/* Entreprises sans données */}
        {currentWithoutData.map((company) => (
          <CompanyCard key={company.siren} company={company} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          {renderPagination()}
        </div>
      )}
    </>
  );
}