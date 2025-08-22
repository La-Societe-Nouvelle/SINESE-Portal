"use client";

import { Info } from "lucide-react";

export default function DefaultDataExplanation({ hasDefaultData }) {
  if (!hasDefaultData) return null;

  return (
    <div className="mb-4" style={{ 
      padding: '1rem', 
      backgroundColor: '#fdfdfe', 
      borderLeft: '4px solid #3b4d8f',
      borderRadius: '0 0.5rem 0.5rem 0'
    }}>
      <div className="d-flex align-items-center justify-content-center mb-2">
        <Info size={16} className="text-primary me-2" />
        <small className="text-primary fw-semibold">Données sectorielles utilisées</small>
      </div>
      <p className="text-muted mb-0 text-center" style={{ fontSize: '0.8rem' }}>
        Certains indicateurs utilisent des <strong>valeurs sectorielles par défaut</strong> 
        calculées à partir de données statistiques nationales. Ces estimations permettent 
        d'évaluer l'empreinte sociétale même sans données spécifiques de l'entreprise. 
        Les valeurs par défaut sont établies selon l'activité principale (code NAF), 
        les effectifs et d'autres caractéristiques de l'entreprise.
      </p>
    </div>
  );
}