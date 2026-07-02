"use client";

import React, { useMemo } from "react";
import { Form, Button, Badge } from "react-bootstrap";
import { X, CheckCircle } from "lucide-react";
import indicsData from "@/_libs/indics.json";

export default function IndicateurSidebarSelector({
  selectedIndicateurs = [], // Multi selection
  onChange = () => { },
  hasPublishedReport = false,
  onToggleHasPublishedReport = () => { },
  isOpen = false,
  onToggle = () => { },
  className = ""
}) {
  // Préparer les données indicateurs groupées par thématique
  const processedData = useMemo(() => {
    const categoryGroups = {
      'Création de la valeur': [],
      'Empreinte sociale': [],
      'Empreinte environnementale': []
    };

    Object.entries(indicsData)
      .filter(([code, indic]) => indic.inEmpreinteSocietale === true)
      .forEach(([code, indic]) => {
        // Classification selon les thèmes SINESE
        let category = 'Empreinte sociale'; // Défaut

        // Création de la valeur : indicateurs économiques et de contribution
        if (code === 'ECO' || code === 'ART' || code === 'SOC') {
          category = 'Création de la valeur';
        }
        // Empreinte sociale : indicateurs sociaux, RH, équité
        else if (code === 'IDR' || code === 'GEQ' || code === 'KNW' || code === 'FOR' || code === 'QVT' || code === 'GOU' || code === 'REL' || code === 'CIV' || code === 'COM') {
          category = 'Empreinte sociale';
        }
        // Empreinte environnementale : indicateurs environnementaux
        else if (code === 'GHG' || code === 'HAZ' || code === 'MAT' || code === 'NRG' || code === 'WAS' || code === 'WAT') {
          category = 'Empreinte environnementale';
        }

        categoryGroups[category].push({ code, libelle: indic.libelle });
      });

    const categories = Object.entries(categoryGroups).map(([categoryName, indicateurs]) => ({
      name: categoryName,
      indicateurs: [...indicateurs].sort((a, b) => a.code.localeCompare(b.code)),
    }));

    return categories;
  }, []);

  const allIndicateurCodes = useMemo(() => processedData.flatMap(c => c.indicateurs.map(i => i.code)), [processedData]);

  const empreinteSocietaleState = (() => {
    const selectedCount = allIndicateurCodes.filter(code => selectedIndicateurs.includes(code)).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === allIndicateurCodes.length) return "all";
    return "partial";
  })();

  const handleEmpreinteSocietaleToggle = () => {
    if (empreinteSocietaleState === "all") {
      onChange(selectedIndicateurs.filter(code => !allIndicateurCodes.includes(code)));
    } else {
      onChange([...new Set([...selectedIndicateurs, ...allIndicateurCodes])]);
    }
  };

  // Gérer la sélection d'une catégorie complète
  const handleCategoryToggle = (categoryIndicateurs) => {
    const categoryCodes = categoryIndicateurs.map(i => i.code);
    const allSelected = categoryCodes.every(code => selectedIndicateurs.includes(code));

    if (allSelected) {
      onChange(selectedIndicateurs.filter(code => !categoryCodes.includes(code)));
    } else {
      onChange([...new Set([...selectedIndicateurs, ...categoryCodes])]);
    }
  };

  // Gérer la sélection d'un indicateur individuel
  const handleIndicateurToggle = (indicateurCode) => {
    if (selectedIndicateurs.includes(indicateurCode)) {
      onChange(selectedIndicateurs.filter(code => code !== indicateurCode));
    } else {
      onChange([...selectedIndicateurs, indicateurCode]);
    }
  };

  // Vérifier si une catégorie est partiellement sélectionnée
  const getCategoryState = (categoryIndicateurs) => {
    const categoryCodes = categoryIndicateurs.map(i => i.code);
    const selectedInCategory = categoryCodes.filter(code => selectedIndicateurs.includes(code));

    if (selectedInCategory.length === 0) return "none";
    if (selectedInCategory.length === categoryCodes.length) return "all";
    return "partial";
  };

  const clearAll = () => onChange([]);

  if (!isOpen) return null;

  return (
    <div className={`indicateur-sidebar-selector position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg ${className}`}
      style={{ width: '400px', zIndex: 1050 }}>

      {/* Header */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold d-flex align-items-center">
            <CheckCircle size={18} className="me-2" />
            Publications
          </h6>
          <Button variant="link" size="sm" onClick={onToggle} className="p-1">
            <X size={18} />
          </Button>
        </div>

        <div className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.03em' }}>
          Rapport
        </div>
        <div className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            id="indicateur-has-published-report"
            checked={hasPublishedReport}
            onChange={(e) => onToggleHasPublishedReport(e.target.checked)}
            className="me-2"
          />
          <div
            className="flex-grow-1 fw-semibold"
            style={{ fontSize: '0.8rem', cursor: 'pointer' }}
            onClick={() => onToggleHasPublishedReport(!hasPublishedReport)}
            role="button"
          >
            Rapport de durabilité publié
          </div>
        </div>

        <hr className="my-3" />

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.03em' }}>
            Indicateurs ESE
          </div>
          {selectedIndicateurs.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Tout effacer
            </Button>
          )}
        </div>

        <div className="d-flex align-items-center">
          <Form.Check
            type="checkbox"
            checked={empreinteSocietaleState === "all"}
            ref={input => {
              if (input) input.indeterminate = empreinteSocietaleState === "partial";
            }}
            onChange={handleEmpreinteSocietaleToggle}
            className="me-2"
          />
          <div className="flex-grow-1 fw-semibold" style={{ fontSize: '0.8rem' }} onClick={handleEmpreinteSocietaleToggle} role="button">
            Empreinte sociétale
          </div>
          {empreinteSocietaleState !== "none" && (
            <Badge bg={empreinteSocietaleState === "all" ? "primary" : "secondary"} className="ms-2" style={{ fontSize: '0.65rem' }}>
              {selectedIndicateurs.filter(code => allIndicateurCodes.includes(code)).length}/{allIndicateurCodes.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-grow-1 overflow-auto" style={{ height: 'calc(100vh - 240px)' }}>
        {processedData.map((category) => {
          const categoryState = getCategoryState(category.indicateurs);

          return (
            <div key={category.name} className="border-bottom">
              {/* En-tête de catégorie */}
              <div className="px-3 py-1 bg-light border-bottom">
                <div className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    checked={categoryState === "all"}
                    ref={input => {
                      if (input) input.indeterminate = categoryState === "partial";
                    }}
                    onChange={() => handleCategoryToggle(category.indicateurs)}
                    className="me-2"
                  />

                  <div className="flex-grow-1">
                    <div className="fw-semibold" style={{ fontSize: '0.8rem' }} onClick={() => handleCategoryToggle(category.indicateurs)} role="button">
                      {category.name}
                    </div>
                  </div>

                  {categoryState !== "none" && (
                    <Badge bg={categoryState === "all" ? "primary" : "secondary"} className="ms-2" style={{ fontSize: '0.65rem' }}>
                      {category.indicateurs.filter(i => selectedIndicateurs.includes(i.code)).length}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Liste des indicateurs */}
              {category.indicateurs.map((indicateur) => (
                <div key={indicateur.code} className="px-5">
                  <Form.Check
                    type="checkbox"
                    id={`indicateur-${indicateur.code}`}
                    checked={selectedIndicateurs.includes(indicateur.code)}
                    onChange={() => handleIndicateurToggle(indicateur.code)}
                    label={<span>{indicateur.libelle}</span>}
                    className="mb-0"
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
