"use client";

import { SearchControlsSkeleton } from "./LoadingSkeleton";

export default function SearchControls({
  loading,
  resultsCount
}) {
  // Show loading controls while searching
  if (loading) {
    return <SearchControlsSkeleton />;
  }

  // Don't show controls if no results
  if (resultsCount === 0) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div>
        <h5 className="mb-0 text-primary">
          Résultats Trouvés :{" "}
          <span className="d-block badge bg-light text-primary small fw-normal">
            {resultsCount >= 1000 ? '+ de 1000' : resultsCount} entreprise{resultsCount > 1 ? 's' : ''} correspondante{resultsCount > 1 ? 's' : ''} 
          </span>
        </h5>
      </div>

    </div>
  );
}