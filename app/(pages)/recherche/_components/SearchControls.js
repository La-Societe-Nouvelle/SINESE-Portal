"use client";

import { Button, Dropdown, Spinner } from "react-bootstrap";
import { SortDesc, List, Grid3X3 } from "lucide-react";
import { SearchControlsSkeleton } from "./LoadingSkeleton";

export default function SearchControls({ 
  loading, 
  resultsCount, 
  filters, 
  setFilters, 
  viewMode, 
  setViewMode 
}) {
  // Show loading controls while searching
  if (loading) {
    return <SearchControlsSkeleton />;
  }

  // Don't show controls if no results
  if (resultsCount === 0) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h5 className="mb-0 text-primary">
          <span className="badge bg-light text-primary fs-6 fw-normal">
            {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
          </span>
        </h5>
      </div>
      
      <div className="d-flex align-items-center gap-3">
        {/* Sort dropdown */}
        <Dropdown>
          <Dropdown.Toggle variant="outline-primary" size="sm">
            <SortDesc size={14} className="me-1" />
            {filters.sortBy}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setFilters({...filters, sortBy: "pertinence"})}>
              Pertinence
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setFilters({...filters, sortBy: "nom"})}>
              Nom (A-Z)
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

      </div>
    </div>
  );
}