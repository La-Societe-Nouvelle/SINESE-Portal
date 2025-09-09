"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Form, Button, Badge, Collapse, InputGroup } from "react-bootstrap";
import { Search, ChevronDown, ChevronRight, X, MapPin } from "lucide-react";
import departementsData from "@/_libs/departements-region.json";

export default function DepartementSidebarSelector({
  selectedDepartements = [],
  onChange = () => { },
  isOpen = false,
  onToggle = () => { },
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRegions, setExpandedRegions] = useState(new Set());

  // Préparer les données départements groupées par région avec recherche
  const processedData = useMemo(() => {
    // Grouper par région
    const regionGroups = {};
    
    departementsData.forEach(dept => {
      if (!regionGroups[dept.region_name]) {
        regionGroups[dept.region_name] = [];
      }
      regionGroups[dept.region_name].push({
        code: dept.num_dep,
        name: dept.dep_name,
        displayName: `${dept.num_dep} - ${dept.dep_name}`
      });
    });

    // Filtrer selon la recherche et convertir en array
    const regions = Object.entries(regionGroups).map(([regionName, departements]) => ({
      name: regionName,
      departements: departements.filter(dept => {
        if (!searchQuery) return true;
        const searchText = `${dept.code} ${dept.name} ${regionName}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
    })).filter(region => region.departements.length > 0);

    // Trier les régions alphabétiquement
    regions.sort((a, b) => a.name.localeCompare(b.name));
    
    // Trier les départements par code dans chaque région
    regions.forEach(region => {
      region.departements.sort((a, b) => String(a.code).localeCompare(String(b.code)));
    });

    return regions;
  }, [searchQuery]);

  // Auto-déplier les régions qui ont des résultats de recherche
  useEffect(() => {
    if (searchQuery.trim()) {
      const regionsWithResults = new Set(
        processedData.map(region => region.name)
      );
      setExpandedRegions(regionsWithResults);
    } else {
      setExpandedRegions(new Set());
    }
  }, [searchQuery, processedData]);

  // Gérer l'expansion/contraction des régions
  const toggleRegion = (regionName) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionName)) {
      newExpanded.delete(regionName);
    } else {
      newExpanded.add(regionName);
    }
    setExpandedRegions(newExpanded);
  };

  // Gérer la sélection d'une région complète
  const handleRegionToggle = (regionName, regionDepartements) => {
    const regionCodes = regionDepartements.map(d => d.code);
    const allSelected = regionCodes.every(code => selectedDepartements.includes(code));

    if (allSelected) {
      // Désélectionner tous les départements de cette région
      onChange(selectedDepartements.filter(code => !regionCodes.includes(code)));
    } else {
      // Sélectionner tous les départements de cette région
      const newSelected = [...new Set([...selectedDepartements, ...regionCodes])];
      onChange(newSelected);
    }
  };

  // Gérer la sélection d'un département individuel
  const handleDepartementToggle = (deptCode) => {
    if (selectedDepartements.includes(deptCode)) {
      onChange(selectedDepartements.filter(code => code !== deptCode));
    } else {
      onChange([...selectedDepartements, deptCode]);
    }
  };

  // Vérifier si une région est partiellement sélectionnée
  const getRegionState = (regionDepartements) => {
    const regionCodes = regionDepartements.map(d => d.code);
    const selectedInRegion = regionCodes.filter(code => selectedDepartements.includes(code));

    if (selectedInRegion.length === 0) return "none";
    if (selectedInRegion.length === regionCodes.length) return "all";
    return "partial";
  };

  // Effacer tous les filtres
  const clearAll = () => {
    onChange([]);
    setSearchQuery("");
    setExpandedRegions(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className={`departement-sidebar-selector position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg ${className}`}
      style={{ width: '400px', zIndex: 1050 }}>

      {/* Header */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold d-flex align-items-center">
            <MapPin size={18} className="me-2" />
            Départements
          </h6>
          <Button variant="link" size="sm" onClick={onToggle} className="p-1">
            <X size={18} />
          </Button>
        </div>

        {/* Barre de recherche */}
        <InputGroup size="sm">
          <Form.Control
            type="text"
            placeholder="Rechercher un département ou une région..."
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
            {selectedDepartements.length} département{selectedDepartements.length > 1 ? 's' : ''} sélectionné{selectedDepartements.length > 1 ? 's' : ''}
          </small>
          {selectedDepartements.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Tout effacer
            </Button>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-grow-1 overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
        {processedData.map((region) => {
          const regionState = getRegionState(region.departements);
          const isExpanded = expandedRegions.has(region.name);

          return (
            <div key={region.name} className="border-bottom">
              {/* En-tête de région */}
              <div className="px-3 py-1 bg-light border-bottom">
                <div className="d-flex align-items-center">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => toggleRegion(region.name)}
                    className="p-0 me-2 text-muted d-flex align-items-center"
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </Button>

                  <Form.Check
                    type="checkbox"
                    checked={regionState === "all"}
                    ref={input => {
                      if (input) input.indeterminate = regionState === "partial";
                    }}
                    onChange={() => handleRegionToggle(region.name, region.departements)}
                    className="me-2"
                  />

                  <div className="flex-grow-1">
                    <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                      {region.name}
                    </div>
                  </div>

                  {regionState !== "none" && (
                    <Badge bg={regionState === "all" ? "primary" : "secondary"} className="ms-2" style={{ fontSize: '0.65rem' }}>
                      {region.departements.filter(d => selectedDepartements.includes(d.code)).length}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Liste des départements */}
              <Collapse in={isExpanded}>
                <div>
                  {region.departements.map((dept) => (
                    <div key={dept.code} className="px-5 py-1">
                      <Form.Check
                        type="checkbox"
                        id={`dept-${dept.code}`}
                        checked={selectedDepartements.includes(dept.code)}
                        onChange={() => handleDepartementToggle(dept.code)}
                        label={
                          <span>
                            {dept.displayName}
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
            <p>Aucun département trouvé pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}