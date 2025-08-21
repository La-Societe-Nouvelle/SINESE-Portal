"use client";

import { Pagination } from "react-bootstrap";
import CompanyCard from "./CompanyCard";

export default function SearchResults({ 
  results, 
  loading, 
  currentPage, 
  setCurrentPage, 
  resultsPerPage 
}) {
  if (loading || results.length === 0) return null;

  // Pagination logic
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentResults = results.slice(indexOfFirst, indexOfLast);

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      // Affiche seulement les pages proches de la page courante, la première et la dernière
      if (number === 1 || number === totalPages || (number >= currentPage - 2 && number <= currentPage + 2)) {
        items.push(
          <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
            {number}
          </Pagination.Item>
        );
      } else if ((number === currentPage - 3 && number > 1) || (number === currentPage + 3 && number < totalPages)) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${number}`} disabled />);
      }
    }
    
    return (
      <Pagination>
        <Pagination.Prev onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} />
        {items}
        <Pagination.Next
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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