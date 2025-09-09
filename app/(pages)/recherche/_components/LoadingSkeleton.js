"use client";

// Loading skeleton component for better UX during search
export function CompanyCardSkeleton() {
  return (
    <div className="company-card-skeleton">
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <div className="skeleton-line skeleton-title mb-2"></div>
              <div className="skeleton-line skeleton-subtitle mb-2"></div>
              <div className="skeleton-line skeleton-text w-75 mb-1"></div>
              <div className="skeleton-line skeleton-text w-50"></div>
            </div>
            <div className="col-md-4 text-end">
              <div className="skeleton-badge mb-2"></div>
              <div className="skeleton-line skeleton-text w-75 ms-auto mb-1"></div>
              <div className="skeleton-line skeleton-text w-50 ms-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for search results
export function SearchResultsSkeleton({ count = 5 }) {
  return (
    <div className="search-results-skeleton">
      {Array(count).fill(0).map((_, index) => (
        <CompanyCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Loading skeleton for search controls
export function SearchControlsSkeleton() {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div className="d-flex align-items-center">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <div className="skeleton-line skeleton-text-loading" >
          Recherche en cours...
        </div>
      </div>
      
      <div className="d-flex align-items-center gap-3">
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
}

// Animated loading dots
export function LoadingDots() {
  return (
    <div className="loading-dots">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  );
}

// Enhanced search loading state
export function SearchLoadingState({ message = "Recherche en cours" }) {
  return (
    <div className="search-loading-state text-center py-5">
      <div className="loading-spinner-container mb-3">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
      <h6 className="text-muted mb-2">{message}</h6>
      <LoadingDots />
    </div>
  );
}