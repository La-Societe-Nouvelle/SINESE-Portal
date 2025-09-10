"use client";

import { Pagination } from "react-bootstrap";
import CompanyCard from "./CompanyCard";
import { SearchResultsSkeleton } from "./LoadingSkeleton";

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

  // Pagination logic
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentResults = results.slice(indexOfFirst, indexOfLast);

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
        {currentResults.map((company) => (
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