"use client";

import { Building } from "lucide-react";

export default function PageHeader({ companyName, siren }) {
  return (
    <div className="page-header compact py-4 mb-4">
      <div className="container">
        <div className="d-flex align-items-center">
          <Building size={24} className=" me-3" />
          <div>
            <h2 className="h3 mb-1">
              {companyName || `Entreprise ${siren}`}
            </h2>
            <p className="mb-0 ">Empreinte sociétale et environnementale</p>
          </div>
        </div>
      </div>
    </div>
  );
}