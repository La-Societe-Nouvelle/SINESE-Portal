"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Form, Button, Badge, Collapse, InputGroup } from "react-bootstrap";
import { Search, ChevronDown, ChevronRight,  X } from "lucide-react";
import nafData from "@/_libs/naf_rev_2_by_divisions.json";

export default function NafSidebarSelector({
  selectedCodes = [],
  onChange = () => { },
  isOpen = false,
  onToggle = () => { },
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState(new Set());

  // Préparer les données NAF avec recherche
  const processedData = useMemo(() => {
    const sections = Object.entries(nafData).map(([sectionName, codes]) => {
      // Extraire le code de division à partir du premier code de la section
      const divisionCode = codes.length > 0 ? codes[0].code.substring(0, 2) : '';
      
      return {
        name: sectionName,
        divisionCode: divisionCode,
        displayName: `${divisionCode} - ${sectionName}`, // Format: "01 - Culture et production animale..."
        codes: codes.filter(item => {
          if (!searchQuery) return true;
          const searchText = `${item.code} ${item.libelle} ${sectionName}`.toLowerCase();
          return searchText.includes(searchQuery.toLowerCase());
        })
      };
    }).filter(section => section.codes.length > 0);

    return sections;
  }, [searchQuery]);

  // Auto-déplier les divisions qui ont des résultats de recherche
  useEffect(() => {
    if (searchQuery.trim()) {
      // Si on a une recherche, déplier automatiquement toutes les divisions qui ont des résultats
      const sectionsWithResults = new Set(
        processedData.map(section => section.name)
      );
      setExpandedSections(sectionsWithResults);
    } else {
      // Si pas de recherche, fermer toutes les sections
      setExpandedSections(new Set());
    }
  }, [searchQuery, processedData]);

  // Gérer l'expansion/contraction des sections
  const toggleSection = (sectionName) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  // Gérer la sélection d'une section complète
  const handleSectionToggle = (sectionName, sectionCodes) => {
    const sectionCodeValues = sectionCodes.map(c => c.code);
    const allSelected = sectionCodeValues.every(code => selectedCodes.includes(code));

    if (allSelected) {
      // Désélectionner tous les codes de cette section
      onChange(selectedCodes.filter(code => !sectionCodeValues.includes(code)));
    } else {
      // Sélectionner tous les codes de cette section
      const newSelected = [...new Set([...selectedCodes, ...sectionCodeValues])];
      onChange(newSelected);
    }
  };

  // Gérer la sélection d'un code individuel
  const handleCodeToggle = (code) => {
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter(c => c !== code));
    } else {
      onChange([...selectedCodes, code]);
    }
  };

  // Vérifier si une section est partiellement sélectionnée
  const getSectionState = (sectionCodes) => {
    const sectionCodeValues = sectionCodes.map(c => c.code);
    const selectedInSection = sectionCodeValues.filter(code => selectedCodes.includes(code));

    if (selectedInSection.length === 0) return "none";
    if (selectedInSection.length === sectionCodeValues.length) return "all";
    return "partial";
  };

  // Effacer tous les filtres
  const clearAll = () => {
    onChange([]);
    setSearchQuery("");
    setExpandedSections(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className={`naf-sidebar-selector position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg ${className}`}
      style={{ width: '400px', zIndex: 1050 }}>

      {/* Header */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold">Activité</h6>
          <Button variant="link" size="sm" onClick={onToggle} className="p-1">
            <X size={18} />
          </Button>
        </div>

        {/* Barre de recherche */}
        <InputGroup size="sm">
          <Form.Control
            type="text"
            placeholder="Entrer une activité ou un code NAF/APE"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroup.Text>
            <Search size={14} />
          </InputGroup.Text>
        </InputGroup>

        {/* Compteur et actions */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            {selectedCodes.length} activité{selectedCodes.length > 1 ? 's' : ''} sélectionnée{selectedCodes.length > 1 ? 's' : ''}
          </small>
          {selectedCodes.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearAll} >
              Tout effacer
            </Button>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-grow-1 overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
        {processedData.map((section) => {
          const sectionState = getSectionState(section.codes);
          const isExpanded = expandedSections.has(section.name);

          return (
            <div key={section.name} className="border-bottom">
              {/* En-tête de section */}
              <div className="px-3 py-1 bg-light border-bottom">
                <div className="d-flex align-items-center">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => toggleSection(section.name)}
                    className="p-0 me-2 text-muted d-flex align-items-center"
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </Button>

                  <Form.Check
                    type="checkbox"
                    checked={sectionState === "all"}
                    ref={input => {
                      if (input) input.indeterminate = sectionState === "partial";
                    }}
                    onChange={() => handleSectionToggle(section.name, section.codes)}
                    className="me-2"

                  />

                  <div className="flex-grow-1">
                    <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                      {section.displayName}
                    </div>

                  </div>

                  {sectionState !== "none" && (
                    <Badge bg={sectionState === "all" ? "primary" : "secondary"} className="ms-2" style={{ fontSize: '0.65rem' }}>
                      {section.codes.filter(c => selectedCodes.includes(c.code)).length}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Liste des codes */}
              <Collapse in={isExpanded}>
                <div>
                  {section.codes.map((item) => (
                    <div key={item.code} className="px-5 py-1 ">
                      <Form.Check
                        type="checkbox"
                        id={`naf-${item.code}`}
                        checked={selectedCodes.includes(item.code)}
                        onChange={() => handleCodeToggle(item.code)}
                        label={
                          <span >
                            {item.code} - {item.libelle}
                          </span>
                        }
                        className="mb-0"

                      />
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          );
        })}

        {processedData.length === 0 && (
          <div className="text-center py-5 text-muted">
            <Search size={48} className="mb-3 opacity-50" />
            <p>Aucune activité trouvée pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}