"use client";

import { Building } from "lucide-react";

export default function PageHeader({ companyName, siren }) {
  return (
    <div className="page-header bg-light py-4 mb-4">
      <div className="container">
        <div className="d-flex align-items-center">
          <Building size={24} className="text-primary me-3" />
          <div>
            <h1 className="h3 mb-1 text-primary">
              {companyName || `Entreprise ${siren}`}
            </h1>
            <p className="mb-0 text-muted">Empreinte sociétale et environnementale</p>
          </div>
        </div>
      </div>
    </div>
  );
}