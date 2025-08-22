"use client";

import { Spinner } from "react-bootstrap";

export default function LoadingState({ siren }) {
  return (
    <div className="bg-white p-5 rounded-3 shadow-sm text-center">
      <h2 className="mb-4">
        Empreinte Sociétale de l'entreprise <strong>#{siren}</strong>
      </h2>
      <div className="d-flex flex-column align-items-center">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted mb-0">Chargement des données...</p>
      </div>
    </div>
  );
}