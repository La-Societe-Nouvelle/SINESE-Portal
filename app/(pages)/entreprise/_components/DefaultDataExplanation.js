"use client";

import { FolderSync, Info, RefreshCcw } from "lucide-react";
import { Button } from "react-bootstrap";

export default function DefaultDataExplanation({ hasDefaultData }) {
  if (!hasDefaultData) return null;

  return (
    <div className="mb-4 p-4 shadow-sm " style={{
      borderLeft: '4px solid #f9a13cff',
      borderRadius: '0 1rem 1rem 0'
    }}>
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
      <Button variant="primary" 
      className="mt-3 "
      onClick={() => window.open('https://publication.sinese.fr', '_blank')}>
        <RefreshCcw size={16} className="me-2" />
        Actualiser mes empreintes
      </Button>
    </div>
  );
}