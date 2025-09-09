"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Form, Button, Badge, Collapse, InputGroup } from "react-bootstrap";
import { Search, ChevronDown, ChevronRight, X, Users } from "lucide-react";
import { EFFECTIF_MAPPING, getEffectifCategory, getEffectifBadgeColor } from "@/_utils/effectifMapping";

export default function EffectifSidebarSelector({
  selectedEffectif = null, // Single selection (code or null)
  onChange = () => { },
  isOpen = false,
  onToggle = () => { },
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Préparer les données effectifs groupées par catégorie avec recherche
  const processedData = useMemo(() => {
    // Grouper les effectifs par catégorie
    const categoryGroups = {
      'Micro-entreprises (0-9 salariés)': [],
      'Petites entreprises (10-49 salariés)': [],
      'Moyennes entreprises (50-249 salariés)': [],
      'Grandes entreprises (250-999 salariés)': [],
      'Très grandes entreprises (1000+ salariés)': [],
      'Non renseigné': []
    };

    Object.entries(EFFECTIF_MAPPING).forEach(([code, label]) => {
      const category = getEffectifCategory(code);
      let categoryName;
      
      switch (category) {
        case 'micro': categoryName = 'Micro-entreprises (0-9 salariés)'; break;
        case 'petite': categoryName = 'Petites entreprises (10-49 salariés)'; break;
        case 'moyenne': categoryName = 'Moyennes entreprises (50-249 salariés)'; break;
        case 'grande': categoryName = 'Grandes entreprises (250-999 salariés)'; break;
        case 'tres-grande': categoryName = 'Très grandes entreprises (1000+ salariés)'; break;
        default: categoryName = 'Non renseigné'; break;
      }

      categoryGroups[categoryName].push({
        code: code,
        label: label,
        category: category,
        badgeColor: getEffectifBadgeColor(code)
      });
    });

    // Filtrer selon la recherche et convertir en array
    const categories = Object.entries(categoryGroups).map(([categoryName, effectifs]) => ({
      name: categoryName,
      effectifs: effectifs.filter(effectif => {
        if (!searchQuery) return true;
        const searchText = `${effectif.code} ${effectif.label} ${categoryName}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
    })).filter(category => category.effectifs.length > 0);

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

  // Gérer la sélection d'un effectif
  const handleEffectifToggle = (effectifCode) => {
    if (selectedEffectif === effectifCode) {
      onChange(null); // Déselectionner si déjà sélectionné
    } else {
      onChange(effectifCode); // Sélectionner le nouveau code
    }
  };

  // Effacer la sélection
  const clearAll = () => {
    onChange(null);
    setSearchQuery("");
    setExpandedCategories(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className={`effectif-sidebar-selector position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg ${className}`}
      style={{ width: '400px', zIndex: 1050 }}>

      {/* Header */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold d-flex align-items-center">
            <Users size={18} className="me-2" />
            Effectifs
          </h6>
          <Button variant="link" size="sm" onClick={onToggle} className="p-1">
            <X size={18} />
          </Button>
        </div>

        {/* Barre de recherche */}
        <InputGroup size="sm">
          <Form.Control
            type="text"
            placeholder="Rechercher une tranche d'effectif..."
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
            {selectedEffectif ? '1 tranche sélectionnée' : 'Aucune sélection'}
          </small>
          {selectedEffectif && (
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Effacer
            </Button>
          )}
        </div>

        {/* Affichage de la sélection actuelle */}
        {selectedEffectif && (
          <div className="mt-2">
            <Badge bg={getEffectifBadgeColor(selectedEffectif)} className="px-2 py-1">
              {EFFECTIF_MAPPING[selectedEffectif] || selectedEffectif}
            </Badge>
          </div>
        )}
      </div>

      {/* Contenu scrollable */}
      <div className="flex-grow-1 overflow-auto" style={{ height: 'calc(100vh - 180px)' }}>
        {processedData.map((category) => {
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

                  <div className="flex-grow-1">
                    <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                      {category.name}
                    </div>
                  </div>

                  <Badge bg="light" text="dark" className="ms-2" style={{ fontSize: '0.65rem' }}>
                    {category.effectifs.length}
                  </Badge>
                </div>
              </div>

              {/* Liste des effectifs */}
              <Collapse in={isExpanded}>
                <div>
                  {category.effectifs.map((effectif) => (
                    <div key={effectif.code} className="px-5 py-1">
                      <Form.Check
                        type="radio"
                        id={`effectif-${effectif.code}`}
                        name="effectif-selection"
                        checked={selectedEffectif === effectif.code}
                        onChange={() => handleEffectifToggle(effectif.code)}
                        label={
                          <div className="d-flex align-items-center">
                            <span className="me-2">{effectif.label}</span>
                            <Badge bg={effectif.badgeColor} style={{ fontSize: '0.6rem' }}>
                              {effectif.code}
                            </Badge>
                          </div>
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
            <p>Aucune tranche d'effectif trouvée pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}