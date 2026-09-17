"use client";

import React, { useMemo, useState } from "react";
import { Form, Button, Badge } from "react-bootstrap";
import { X, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import indicsData from "@/_libs/indics.json";

// En-tête de groupe/catégorie : chevron (repli), checkbox tout-sélectionner,
// libellé, badge de compte. Le contenu (liste d'indicateurs ou sous-groupes
// imbriqués) est fourni en children.
function GroupBlock({
  name,
  allCodes,
  selectedIndicateurs,
  isCollapsed,
  onToggleCollapsed,
  onToggleAll,
  bold = false,
  children,
}) {
  const selectedInGroup = allCodes.filter(code => selectedIndicateurs.includes(code));
  const groupState = selectedInGroup.length === 0
    ? "none"
    : selectedInGroup.length === allCodes.length
    ? "all"
    : "partial";

  return (
    <div className="border-bottom">
      <div className="px-3 py-1 border-bottom bg-light">
        <div className="d-flex align-items-center group-header-row">
          <button
            type="button"
            className="btn btn-link p-0 me-2 text-muted"
            onClick={onToggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-label={`${isCollapsed ? 'Développer' : 'Réduire'} ${name}`}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>

          <Form.Check
            type="checkbox"
            checked={groupState === "all"}
            ref={input => {
              if (input) input.indeterminate = groupState === "partial";
            }}
            onChange={onToggleAll}
            className="me-2"
          />

          <div className="flex-grow-1">
            <div
              className={`group-title ${bold ? "fw-bold group-title--bold" : "fw-semibold"}`}
              onClick={onToggleAll}
              role="button"
            >
              {name}
            </div>
          </div>

          {groupState !== "none" && (
            <Badge bg={groupState === "all" ? "primary" : "secondary"} className="ms-2 count-badge">
              {selectedInGroup.length}/{allCodes.length}
            </Badge>
          )}
        </div>
      </div>

      {!isCollapsed && children}
    </div>
  );
}

// Sous-catégorie feuille : liste d'indicateurs à cocher individuellement.
function CategoryBlock({
  name,
  indicateurs,
  selectedIndicateurs,
  isCollapsed,
  onToggleCollapsed,
  onToggleCategory,
  onToggleIndicateur,
}) {
  return (
    <GroupBlock
      name={name}
      allCodes={indicateurs.map(i => i.code)}
      selectedIndicateurs={selectedIndicateurs}
      isCollapsed={isCollapsed}
      onToggleCollapsed={onToggleCollapsed}
      onToggleAll={onToggleCategory}
    >
      {indicateurs.map((indicateur) => (
        <div key={indicateur.code} className="px-5 py-1">
          <Form.Check
            type="checkbox"
            id={`indicateur-${indicateur.code}`}
            checked={selectedIndicateurs.includes(indicateur.code)}
            onChange={() => onToggleIndicateur(indicateur.code)}
            label={<span>{indicateur.libelle}</span>}
            className="mb-0 indicateur-check"
          />
        </div>
      ))}
    </GroupBlock>
  );
}

export default function IndicateurSidebarSelector({
  selectedIndicateurs = [], // Multi selection
  onChange = () => { },
  hasPublishedReport = false,
  onToggleHasPublishedReport = () => { },
  isOpen = false,
  onToggle = () => { },
  className = ""
}) {
  // --- Données ---

  const processedData = useMemo(() => {
    const categoryGroups = {
      'Création de la valeur': [],
      'Empreinte sociale': [],
      'Empreinte environnementale': []
    };

    Object.entries(indicsData)
      .filter(([code, indic]) => indic.inEmpreinteSocietale === true)
      .forEach(([code, indic]) => {
        let category = 'Empreinte sociale';

        if (code === 'ECO' || code === 'ART' || code === 'SOC') {
          category = 'Création de la valeur';
        } else if (code === 'IDR' || code === 'GEQ' || code === 'KNW' || code === 'FOR' || code === 'QVT' || code === 'GOU' || code === 'REL' || code === 'CIV' || code === 'COM') {
          category = 'Empreinte sociale';
        } else if (code === 'GHG' || code === 'HAZ' || code === 'MAT' || code === 'NRG' || code === 'WAS' || code === 'WAT') {
          category = 'Empreinte environnementale';
        }

        categoryGroups[category].push({ code, libelle: indic.libelle });
      });

    return Object.entries(categoryGroups).map(([categoryName, indicateurs]) => ({
      name: categoryName,
      indicateurs: [...indicateurs].sort((a, b) => a.code.localeCompare(b.code)),
    }));
  }, []);

  // Indicateurs extra-financiers complémentaires, hors panel ESE — groupe
  // distinct au même niveau que "Empreinte sociétale", pas une sous-catégorie.
  const autresIndicateurs = useMemo(() => {
    return Object.entries(indicsData)
      .filter(([, indic]) => indic.inEmpreinteSocietale !== true)
      .map(([code, indic]) => ({ code, libelle: indic.libelle }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, []);

  const allIndicateurCodes = useMemo(() => processedData.flatMap(c => c.indicateurs.map(i => i.code)), [processedData]);
  const autresIndicateurCodes = useMemo(() => autresIndicateurs.map(i => i.code), [autresIndicateurs]);

  // --- État accordéon ---

  // "Empreinte sociétale" et "Autres indicateurs" démarrent dépliés (groupes
  // de premier niveau) ; les 3 sous-catégories ESE démarrent repliées pour
  // limiter le scroll initial.
  const [collapsedCategories, setCollapsedCategories] = useState(() =>
    Object.fromEntries(
      ['Création de la valeur', 'Empreinte sociale', 'Empreinte environnementale'].map(name => [name, true])
    )
  );
  const toggleCategoryCollapsed = (categoryName) => {
    setCollapsedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  // --- Handlers de sélection ---

  const handleCodesToggle = (codes) => {
    const allSelected = codes.every(code => selectedIndicateurs.includes(code));
    if (allSelected) {
      onChange(selectedIndicateurs.filter(code => !codes.includes(code)));
    } else {
      onChange([...new Set([...selectedIndicateurs, ...codes])]);
    }
  };

  const handleIndicateurToggle = (indicateurCode) => {
    if (selectedIndicateurs.includes(indicateurCode)) {
      onChange(selectedIndicateurs.filter(code => code !== indicateurCode));
    } else {
      onChange([...selectedIndicateurs, indicateurCode]);
    }
  };

  const clearAll = () => onChange([]);

  // --- Rendu ---

  if (!isOpen) return null;

  return (
    <div className={`indicateur-sidebar-selector position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg d-flex flex-column ${className}`}>

      <div className="p-3 pb-2 border-bottom bg-light flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-bold d-flex align-items-center">
            <CheckCircle size={18} className="me-2" />
            Publications
          </h6>
          <Button variant="link" size="sm" onClick={onToggle} className="p-1">
            <X size={18} />
          </Button>
        </div>

        <div className="text-uppercase text-muted fw-semibold mb-1 section-label">
          Document
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
            className="flex-grow-1 fw-semibold group-title"
            onClick={() => onToggleHasPublishedReport(!hasPublishedReport)}
            role="button"
          >
            Rapport publié
          </div>
        </div>

        <hr className="my-2" />

        <div className="d-flex justify-content-between align-items-center">
          <div className="text-uppercase text-muted fw-semibold section-label">
            Indicateurs
          </div>
          {selectedIndicateurs.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Tout effacer
            </Button>
          )}
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto scrollable-content">
        <GroupBlock
          name="Empreinte sociétale"
          allCodes={allIndicateurCodes}
          selectedIndicateurs={selectedIndicateurs}
          isCollapsed={!!collapsedCategories['Empreinte sociétale']}
          onToggleCollapsed={() => toggleCategoryCollapsed('Empreinte sociétale')}
          onToggleAll={() => handleCodesToggle(allIndicateurCodes)}
          bold
        >
          {/* Décalage à droite : marque visuellement que ces 3 groupes sont
              des sous-catégories de "Empreinte sociétale" ci-dessus. */}
          <div className="ps-3">
            {processedData.map((category) => (
              <CategoryBlock
                key={category.name}
                name={category.name}
                indicateurs={category.indicateurs}
                selectedIndicateurs={selectedIndicateurs}
                isCollapsed={!!collapsedCategories[category.name]}
                onToggleCollapsed={() => toggleCategoryCollapsed(category.name)}
                onToggleCategory={() => handleCodesToggle(category.indicateurs.map(i => i.code))}
                onToggleIndicateur={handleIndicateurToggle}
              />
            ))}
          </div>
        </GroupBlock>

        {autresIndicateurs.length > 0 && (
          <GroupBlock
            name="Autres indicateurs"
            allCodes={autresIndicateurCodes}
            selectedIndicateurs={selectedIndicateurs}
            isCollapsed={!!collapsedCategories['Autres indicateurs']}
            onToggleCollapsed={() => toggleCategoryCollapsed('Autres indicateurs')}
            onToggleAll={() => handleCodesToggle(autresIndicateurCodes)}
            bold
          >
            {autresIndicateurs.map((indicateur) => (
              <div key={indicateur.code} className="px-5 py-1">
                <Form.Check
                  type="checkbox"
                  id={`indicateur-${indicateur.code}`}
                  checked={selectedIndicateurs.includes(indicateur.code)}
                  onChange={() => handleIndicateurToggle(indicateur.code)}
                  label={<span>{indicateur.libelle}</span>}
                  className="mb-0 indicateur-check"
                />
              </div>
            ))}
          </GroupBlock>
        )}
      </div>
    </div>
  );
}
