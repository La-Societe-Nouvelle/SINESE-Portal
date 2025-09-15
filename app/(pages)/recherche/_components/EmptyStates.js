"use client";

import { Button } from "react-bootstrap";
import { Search, Building } from "lucide-react";

export function NoResultsState({ onNewSearch }) {
  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <Search className="text-muted" size={48} />
      </div>
      <h4>Aucun résultat trouvé</h4>
      <p className="text-muted mb-4">
        Essayez de modifier vos critères de recherche ou utilisez des termes plus généraux.
      </p>
      <Button variant="outline-primary" onClick={onNewSearch}>
        Nouvelle recherche
      </Button>
    </div>
  );
}

export function InitialState() {
  return (
    <div className="text-center py-5">
      <div className="mb-4">
        <Building className="text-primary" size={48} />
      </div>
      <h4>Recherchez des entreprises</h4>
      <p className="text-muted">
        Saisissez au moins 3 caractères pour commencer votre recherche.
      </p>
    </div>
  );
}