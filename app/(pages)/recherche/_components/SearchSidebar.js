"use client";

import { useState } from "react";
import { Button, Badge, Form, Offcanvas } from "react-bootstrap";
import { SlidersHorizontal, Search, MapPin, Users, Building2, CheckCircle, RotateCcw, Info } from "lucide-react";
import CustomSelect from "@/_components/forms/CustomSelect";
import NafTrigger from "@/_components/forms/NafTrigger";
import NafSidebarSelector from "@/_components/forms/NafSidebarSelector";
import DepartementSelector from "@/_components/forms/DepartementSelector";
import indicsData from "@/_libs/indics.json";

const effectifOptions = [
  { value: "0-9", label: "0-9 salariés" },
  { value: "10-49", label: "10-49 salariés" },
  { value: "50-249", label: "50-249 salariés" },
  { value: "250-499", label: "250-499 salariés" },
  { value: "500+", label: "500+ salariés" }
];

// Générer les options d'indicateurs à partir du fichier JSON
const indicateursOptions = Object.entries(indicsData)
  .filter(([code, indic]) => indic.inEmpreinteSocietale === true)
  .map(([code, indic]) => ({
    value: code,
    label: indic.libelle
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function SearchSidebar({ 
  query, 
  filters, 
  setFilters,
  setQuery,
  setResults,
  className = "" 
}) {
  const [showMobile, setShowMobile] = useState(false);
  const [nafSidebarOpen, setNafSidebarOpen] = useState(false);

  const resetFilters = () => {
    // Réinitialiser tous les filtres
    setFilters({
      secteur: "", 
      codesNaf: [], 
      departements: [], 
      effectif: "", 
      formeJuridique: "", 
      sortBy: "pertinence",
      economieSocialeSolidaire: false, 
      societeMission: false, 
      activitePrincipaleArtisanale: false,
      activitePrincipaleFormationRecherche: false, 
      donneesPubliees: []
    });
    
    // Vider la barre de recherche
    setQuery("");
    
    // Vider les résultats
    setResults([]);
  };

  const hasActiveFilters = Object.values(filters).some(f => f && f !== "pertinence") || query;

  const SidebarContent = () => (
    <div className="sidebar-filters">
      {/* Header */}
      <div className="sidebar-header">
        <div className="d-flex align-items-center">
          <div className="sidebar-icon">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h5 className="sidebar-title">Filtres</h5>
            <small className="sidebar-subtitle">Affinez votre recherche</small>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="sidebar-body">
        {/* Active filters */}
        {hasActiveFilters && (
          <div className="filter-group active-filters">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="filter-label">
                <span className="filter-icon"><CheckCircle size={16} /></span>
                Filtres actifs
              </Form.Label>
              <Button 
                variant="link" 
                size="sm" 
                className="text-danger p-0 fw-medium"
                onClick={resetFilters}
                style={{ fontSize: '0.75rem' }}
              >
                Tout effacer
              </Button>
            </div>
            
            <div className="active-filter-badges">
              {query && (
                <Badge bg="primary" className="me-1 mb-1">
                  "{query}"
                </Badge>
              )}
              {filters.secteur && (
                <Badge bg="secondary" className="me-1 mb-1">
                  {filters.secteur}
                </Badge>
              )}
              {filters.codesNaf.length > 0 && (
                <Badge bg="primary" className="me-1 mb-1">
                  Activité{filters.codesNaf.length > 1 ? 's' : ''} 
                </Badge>
              )}
              {filters.departements.length > 0 && (
                <Badge bg="info" className="me-1 mb-1">
                  {filters.departements.length} département{filters.departements.length > 1 ? 's' : ''}
                </Badge>
              )}
              {filters.effectif && (
                <Badge bg="secondary" className="me-1 mb-1">
                  {filters.effectif} salariés
                </Badge>
              )}
              {filters.formeJuridique && (
                <Badge bg="secondary" className="me-1 mb-1">
                  {filters.formeJuridique}
                </Badge>
              )}
              {filters.economieSocialeSolidaire && (
                <Badge bg="success" className="me-1 mb-1">ESS</Badge>
              )}
              {filters.societeMission && (
                <Badge bg="success" className="me-1 mb-1">Société à mission</Badge>
              )}
              {filters.activitePrincipaleArtisanale && (
                <Badge bg="info" className="me-1 mb-1">Artisanale</Badge>
              )}
              {filters.activitePrincipaleExtractive && (
                <Badge bg="info" className="me-1 mb-1">Extractive</Badge>
              )}
              {filters.activitePrincipaleFormationRecherche && (
                <Badge bg="info" className="me-1 mb-1">Formation/Recherche</Badge>
              )}
              {filters.donneesPubliees.length > 0 && 
                filters.donneesPubliees.map(code => (
                  <Badge key={code} bg="primary" className="me-1 mb-1">
                   {code}
                  </Badge>
                ))
              }
            </div>
          </div>
        )}

        {/* Activité */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><Building2 size={16} /></span>
            Activité
          </Form.Label>
          <NafTrigger
            selectedCodes={filters.codesNaf}
            onToggle={() => setNafSidebarOpen(true)}
          />
        </div>

        {/* Départements */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><MapPin size={16} /></span>
            Départements
          </Form.Label>
          <DepartementSelector
            selectedDepartements={filters.departements}
            onChange={(selectedDepartements) => setFilters({...filters, departements: selectedDepartements})}
            placeholder="Sélectionnez des départements..."
            instanceId="select-departements-sidebar"
          />
        </div>

        {/* Effectif */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><Users size={16} /></span>
            Effectif
          </Form.Label>
          <CustomSelect
            instanceId="select-effectif-sidebar"
            size="small"
            options={effectifOptions}
            value={effectifOptions.find(option => option.value === filters.effectif) || null}
            onChange={(selectedOption) => setFilters({...filters, effectif: selectedOption ? selectedOption.value : ""})}
            placeholder="Tous les effectifs"
            isClearable={true}
          />
        </div>

        {/* Données publiées */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><CheckCircle size={16} /></span>
            Données publiées
          </Form.Label>
          <CustomSelect
            instanceId="select-donnees-publiees-sidebar"
            isMulti={true}
            size="small"
            variant="warning"
            options={indicateursOptions}
            value={indicateursOptions.filter(option => filters.donneesPubliees.includes(option.value))}
            onChange={(selectedOptions) => {
              const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
              setFilters({...filters, donneesPubliees: selectedValues});
            }}
            placeholder="Sélectionnez des indicateurs..."
            isClearable={true}
          />
        </div>

        {/* Autres critères */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><CheckCircle size={16} /></span>
            Autres critères
          </Form.Label>
          
          <div className="bonus-filters">
            <Form.Check 
              type="checkbox"
              id="filter-ess-sidebar"
              label="Économie Sociale et Solidaire (ESS)"
              checked={filters.economieSocialeSolidaire}
              onChange={(e) => setFilters({...filters, economieSocialeSolidaire: e.target.checked})}
              className="mb-2 filter-checkbox"
            />

            <Form.Check 
              type="checkbox"
              id="filter-mission-sidebar"
              label="Société à mission"
              checked={filters.societeMission}
              onChange={(e) => setFilters({...filters, societeMission: e.target.checked})}
              className="mb-2 filter-checkbox"
            />

            <Form.Check 
              type="checkbox"
              id="filter-artisanale-sidebar"
              label="Activité principale artisanale"
              checked={filters.activitePrincipaleArtisanale}
              onChange={(e) => setFilters({...filters, activitePrincipaleArtisanale: e.target.checked})}
              className="mb-2 filter-checkbox"
            />

            <Form.Check 
              type="checkbox"
              id="filter-extractive-sidebar"
              label="Activité principale extractive"
              checked={filters.activitePrincipaleExtractive}
              onChange={(e) => setFilters({...filters, activitePrincipaleExtractive: e.target.checked})}
              className="mb-2 filter-checkbox"
            />

            <Form.Check 
              type="checkbox"
              id="filter-formation-sidebar"
              label="Formation et recherche"
              checked={filters.activitePrincipaleFormationRecherche}
              onChange={(e) => setFilters({...filters, activitePrincipaleFormationRecherche: e.target.checked})}
              className="mb-2 filter-checkbox"
            />
          </div>
        </div>
      </div>

      {/* Footer avec bouton reset */}
      <div className="sidebar-footer">
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={resetFilters}
          className="reset-button"
        >
          <RotateCcw size={14} className="reset-icon" />
          Réinitialiser
        </Button>

        <div className="sidebar-info">
          <div className="d-flex align-items-start">
            <Info size={12} className="info-icon" />
            <span>
              Les filtres s'appliquent automatiquement à votre recherche.
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="search-sidebar">
      {/* Version Desktop */}
      <div className={`d-none d-lg-block ${className}`}>
        <div className="sidebar-container">
          <SidebarContent />
        </div>
      </div>

      {/* Bouton Mobile */}
      <div className="d-lg-none">
        <Button 
          variant="outline-primary" 
          onClick={() => setShowMobile(true)}
          className="mobile-trigger"
        >
          <SlidersHorizontal size={16} className="trigger-icon" />
          Filtres de recherche
        </Button>
      </div>

      {/* Offcanvas Mobile */}
      <Offcanvas 
        show={showMobile} 
        onHide={() => setShowMobile(false)}
        placement="start"
        className="search-sidebar-mobile"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            Filtres de recherche
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Sidebar NAF */}
      <NafSidebarSelector
        selectedCodes={filters.codesNaf}
        onChange={(selectedCodes) => setFilters({...filters, codesNaf: selectedCodes})}
        isOpen={nafSidebarOpen}
        onToggle={() => setNafSidebarOpen(false)}
      />
    </div>
  );
}