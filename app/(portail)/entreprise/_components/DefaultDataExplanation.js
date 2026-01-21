"use client";

import {  Info } from "lucide-react";

export default function DefaultDataExplanation() {
  if (!hasDefaultData) return null;

  return (
    <div className="mb-4 p-4 shadow-sm default-data-explanation">
      <div className="d-flex align-items-center justify-content-start mb-2">
        <Info size={16} className=" me-2" />
        <h3 className="h6 mb-0 ">Données sectorielles utilisées</h3>
      </div>
      <p className="text-muted mb-0 " style={{ fontSize: '0.8rem' }}>
        Certains indicateurs utilisent des <strong>valeurs sectorielles par défaut</strong> calculées à partir de données statistiques nationales. Ces estimations permettent
        d'évaluer l'empreinte sociétale même sans données spécifiques de l'entreprise.
        Les valeurs par défaut sont établies selon l'activité principale (code NAF),
        les effectifs et d'autres caractéristiques de l'entreprise.
      </p>
      <p className="mt-3 mb-2 fw-medium" style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
        <strong>Vous êtes dirigeant de cette entreprise ?</strong> Publiez vos données réelles pour améliorer la précision de votre empreinte sociétale.
      </p>
    </div>
  );
}