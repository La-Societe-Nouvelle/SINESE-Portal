"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Form, Button, Badge, Collapse, InputGroup } from "react-bootstrap";
import { Search, ChevronDown, ChevronRight, X, CheckCircle } from "lucide-react";
import indicsData from "@/_libs/indics.json";

export default function IndicateurSidebarSelector({
  selectedIndicateurs = [], // Multi selection
  onChange = () => { },
  isOpen = false,
  onToggle = () => { },
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Préparer les données indicateurs groupées par thématique avec recherche
  const processedData = useMemo(() => {
    // Grouper les indicateurs selon les 3 thèmes habituels de SINESE
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
        if (code === 'ECO' || code === 'ART' ||  code === 'SOC') {
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

        categoryGroups[category].push({
          code: code,
          libelle: indic.libelle,
          description: indic.description,
          unitSymbol: indic.unitSymbol || '',
          color: indic.color?.main || 'rgba(108, 117, 125, 1)' // Gris par défaut
        });
      });

    // Filtrer selon la recherche et convertir en array
    const categories = Object.entries(categoryGroups).map(([categoryName, indicateurs]) => ({
      name: categoryName,
      indicateurs: indicateurs.filter(indicateur => {
        if (!searchQuery) return true;
        const searchText = `${indicateur.code} ${indicateur.libelle} ${indicateur.description} ${categoryName}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
    })).filter(category => category.indicateurs.length > 0);

    // Trier les indicateurs par code dans chaque catégorie
    categories.forEach(category => {
      category.indicateurs.sort((a, b) => a.code.localeCompare(b.code));
    });

    return categories;
  }, [searchQuery]);

  // Auto-déplier les catégories qui ont des résultats de recherche
  useEffect(() => {
    if (searchQuery.trim()) {
      const categoriesWithResults = new Set(
        processedData.map(category => category.name)
      );
      setExpandedCategories(categoriesWithResults);
    } else {
      setExpandedCategories(new Set());
    }
  }, [searchQuery, processedData]);

  // Gérer l'expansion/contraction des catégories
  const toggleCategory = (categoryName) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Gérer la sélection d'une catégorie complète
  const handleCategoryToggle = (categoryName, categoryIndicateurs) => {
    const categoryCodes = categoryIndicateurs.map(i => i.code);
    const allSelected = categoryCodes.every(code => selectedIndicateurs.includes(code));

    if (allSelected) {
      // Désélectionner tous les indicateurs de cette catégorie
      onChange(selectedIndicateurs.filter(code => !categoryCodes.includes(code)));
    } else {
      // Sélectionner tous les indicateurs de cette catégorie
      const newSelected = [...new Set([...selectedIndicateurs, ...categoryCodes])];
      onChange(newSelected);
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

  // Effacer tous les filtres
  const clearAll = () => {
    onChange([]);
    setSearchQuery("");
    setExpandedCategories(new Set());
  };

  // Convertir couleur rgba en hex pour les badges
  const rgbaToHex = (rgba) => {
    if (!rgba || !rgba.startsWith('rgba(')) return '#6c757d';
    const values = rgba.match(/[\d.]+/g);
    if (!values || values.length < 3) return '#6c757d';
    const r = parseInt(values[0]);
    const g = parseInt(values[1]);
    const b = parseInt(values[2]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  if (!isOpen) return null;

  return (
    <div className={`indicateur-sidebar-selector position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg ${className}`}
      style={{ width: '400px', zIndex: 1050 }}>

      {/* Header */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold d-flex align-items-center">
            <CheckCircle size={18} className="me-2" />
            Données publiées
          </h6>
          <Button variant="link" size="sm" onClick={onToggle} className="p-1">
            <X size={18} />
          </Button>
        </div>

        {/* Barre de recherche */}
        <InputGroup size="sm">
          <Form.Control
            type="text"
            placeholder="Rechercher un indicateur ESE..."
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
            {selectedIndicateurs.length} indicateur{selectedIndicateurs.length > 1 ? 's' : ''} sélectionné{selectedIndicateurs.length > 1 ? 's' : ''}
          </small>
          {selectedIndicateurs.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Tout effacer
            </Button>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-grow-1 overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
        {processedData.map((category) => {
          const categoryState = getCategoryState(category.indicateurs);
          const isExpanded = expandedCategories.has(category.name);

          return (
            <div key={category.name} className="border-bottom">
              {/* En-tête de catégorie */}
              <div className="px-3 py-1 bg-light border-bottom">
                <div className="d-flex align-items-center">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => toggleCategory(category.name)}
                    className="p-0 me-2 text-muted d-flex align-items-center"
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </Button>

                  <Form.Check
                    type="checkbox"
                    checked={categoryState === "all"}
                    ref={input => {
                      if (input) input.indeterminate = categoryState === "partial";
                    }}
                    onChange={() => handleCategoryToggle(category.name, category.indicateurs)}
                    className="me-2"
                  />

                  <div className="flex-grow-1">
                    <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>
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
              <Collapse in={isExpanded}>
                <div>
                  {category.indicateurs.map((indicateur) => (
                    <div key={indicateur.code} className="px-5 py-1">
                      <Form.Check
                        type="checkbox"
                        id={`indicateur-${indicateur.code}`}
                        checked={selectedIndicateurs.includes(indicateur.code)}
                        onChange={() => handleIndicateurToggle(indicateur.code)}
                        label={
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1">
                              <div className="fw-medium" style={{ fontSize: '0.85rem' }}>
                   
                                {indicateur.libelle}
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {indicateur.description}
                                {indicateur.unitSymbol && (
                                  <span className="ms-1">({indicateur.unitSymbol})</span>
                                )}
                              </div>
                            </div>
                          </div>
                        }
                        className="mb-1"
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
            <p>Aucun indicateur trouvé pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}