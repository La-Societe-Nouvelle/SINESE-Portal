"use client";

import React from 'react';

export default function SelectionInfo({ 
  metadata, 
  selectedValues, 
  isLoading = false 
}) {
  // Fonction pour obtenir le nom complet de la sélection actuelle
  const getCurrentSelectionName = () => {
    if (!metadata.industry || !metadata.country || !metadata.aggregate) return null;
    
    const industry = metadata.industry?.find(i => i.code === selectedValues.industry);
    const country = metadata.country?.find(c => c.code === selectedValues.country);
    const aggregate = metadata.aggregate?.find(a => a.code === selectedValues.aggregate);
    
    return {
      industry: industry?.label || selectedValues.industry,
      country: country?.label || selectedValues.country,
      aggregate: aggregate?.label || selectedValues.aggregate
    };
  };

  const selectionNames = getCurrentSelectionName();

  if (isLoading || !selectionNames) return null;

  return (
    <div className="selection-info">
      <div className="selection-content">
        <div className="selection-icon">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <div className="selection-details">
          <div className="selection-label">
            <strong>Analyse en cours</strong>
          </div>
          <div className="selection-values">
            {selectionNames.industry} • {selectionNames.country} • {selectionNames.aggregate}
          </div>
        </div>
      </div>
    </div>
  );
}