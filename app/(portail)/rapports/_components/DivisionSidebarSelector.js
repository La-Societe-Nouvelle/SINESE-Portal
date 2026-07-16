"use client";

import { useState, useMemo } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { Search, X, Building2 } from "lucide-react";
import divisions from "@/_libs/divisions.json";

export default function DivisionSidebarSelector({
  selectedSecteurs = [],
  onChange = () => {},
  isOpen = false,
  onToggle = () => {},
  className = "",
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const processedData = useMemo(() => {
    return Object.entries(divisions)
      .map(([code, libelle]) => ({ code, libelle }))
      .filter(({ code, libelle }) => {
        if (!searchQuery) return true;
        const searchText = `${code} ${libelle}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [searchQuery]);

  const handleToggle = (code) => {
    if (selectedSecteurs.includes(code)) {
      onChange(selectedSecteurs.filter((c) => c !== code));
    } else {
      onChange([...selectedSecteurs, code]);
    }
  };

  const clearAll = () => {
    onChange([]);
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`division-sidebar-selector position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg ${className}`}
      style={{ width: "400px", zIndex: 1050 }}
    >
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold d-flex align-items-center">
            <Building2 size={18} className="me-2" />
            Secteur
          </h6>
          <Button variant="link" size="sm" onClick={onToggle} className="p-1">
            <X size={18} />
          </Button>
        </div>

        <InputGroup size="sm">
          <Form.Control
            type="text"
            placeholder="Rechercher un secteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroup.Text>
            <Search size={14} />
          </InputGroup.Text>
        </InputGroup>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            {selectedSecteurs.length} secteur{selectedSecteurs.length > 1 ? "s" : ""} sélectionné{selectedSecteurs.length > 1 ? "s" : ""}
          </small>
          {selectedSecteurs.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Tout effacer
            </Button>
          )}
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto" style={{ height: "calc(100vh - 140px)" }}>
        {processedData.map(({ code, libelle }) => (
          <div key={code} className="px-3 py-2 border-bottom">
            <Form.Check
              type="checkbox"
              id={`division-${code}`}
              checked={selectedSecteurs.includes(code)}
              onChange={() => handleToggle(code)}
              label={<span>{code} - {libelle}</span>}
              className="mb-0"
            />
          </div>
        ))}

        {processedData.length === 0 && (
          <div className="text-center py-5 text-muted">
            <Search size={48} className="mb-3 opacity-50" />
            <p>Aucun secteur trouvé pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
