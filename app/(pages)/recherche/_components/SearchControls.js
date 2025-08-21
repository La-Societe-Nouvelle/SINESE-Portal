"use client";

import { Button, Dropdown, Spinner } from "react-bootstrap";
import { SortDesc, List, Grid3X3 } from "lucide-react";

export default function SearchControls({ 
  loading, 
  resultsCount, 
  filters, 
  setFilters, 
  viewMode, 
  setViewMode 
}) {
  if (resultsCount === 0 && !loading) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        {loading ? (
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Recherche en cours...</span>
          </div>
        ) : (
          <h5 className="mb-0">
            {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
          </h5>
        )}
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