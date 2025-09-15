"use client";

import React from "react";
import { Form,  Button } from "react-bootstrap";
import { Search } from "lucide-react";

export default function SearchHeader({ query, setQuery, onSearch }) {
  return (
    <div className="search-header bg-primary text-white py-4">
      <div className="container-fluid">
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h2 className="h3 text-white mb-3">Rechercher l'empreinte sociétale des entreprises</h2>

            <Form onSubmit={onSearch} className="search-form">
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Nom d'entreprise ou N° SIREN"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="border-0 shadow-sm py-2 px-3"
                  style={{
                    fontSize: '1rem',
                    borderRadius: '0.5rem',
                    paddingRight: '180px' // Espace pour le bouton
                  }}
                />
                <Button
                  variant="secondary"
                  type="submit"
                  className="position-absolute top-50 end-0 translate-middle-y border-0"
                  style={{
                    fontSize: '0.875rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    right: '0px' // Collé au bord droit
                  }}
                >
                  <Search size={16} className="me-1" />
                  Rechercher une entreprise
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}