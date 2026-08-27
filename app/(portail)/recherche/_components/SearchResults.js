"use client";

import { Pagination } from "react-bootstrap";
import CompanyCard from "./CompanyCard";
import SearchResultsDivider from "@/_components/SearchResultsDivider";
import { separateByDataAvailability } from "@/_utils/utils";
import { useSearch } from "./SearchContext";

export default function SearchResults({ results, total, currentPage, perPage }) {
  const { goToPage } = useSearch();

  const { withData, withoutData } = separateByDataAvailability(results);
  const totalPages = Math.ceil(total / perPage);

  const handlePageChange = (newPage) => {
    goToPage(newPage);
    setTimeout(() => { document.documentElement.scrollTop = 0; }, 100);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let n = 1; n <= totalPages; n++) {
      if (n === 1 || n === totalPages || (n >= currentPage - 2 && n <= currentPage + 2)) {
        items.push(
          <Pagination.Item key={n} active={n === currentPage} onClick={() => handlePageChange(n)}>
            {n}
          </Pagination.Item>
        );
      } else if ((n === currentPage - 3 && n > 1) || (n === currentPage + 3 && n < totalPages)) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${n}`} disabled />);
      }
    }

    return (
      <Pagination>
        <Pagination.Prev onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
        {items}
        <Pagination.Next onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />
      </Pagination>
    );
  };

  return (
    <>
      <div className="results-list">
        {withData.map((company) => (
          <CompanyCard key={company.siren} company={company} />
        ))}

        {withData.length > 0 && withoutData.length > 0 && (
          <SearchResultsDivider withDataCount={withData.length} withoutDataCount={withoutData.length} />
        )}

        {withoutData.map((company) => (
          <CompanyCard key={company.siren} company={company} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          {renderPagination()}
        </div>
      )}
    </>
  );
}
