"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Badge, Form, Offcanvas } from "react-bootstrap";
import { SlidersHorizontal, Search, MapPin, Users, Building2, CheckCircle, RotateCcw, Info, ChevronRight } from "lucide-react";
import NafTrigger from "@/_components/forms/NafTrigger";
import NafSidebarSelector from "@/_components/forms/NafSidebarSelector";
import DepartementSidebarSelector from "@/_components/forms/DepartementSidebarSelector";
import EffectifSidebarSelector from "@/_components/forms/EffectifSidebarSelector";
import IndicateurSidebarSelector from "@/_components/forms/IndicateurSidebarSelector";
import { EFFECTIF_MAPPING } from "@/_utils/effectifMapping";

// Créer un trigger personnalisé pour les départements
const DepartementTrigger = ({ selectedDepartements, onToggle }) => {
  const hasSelection = selectedDepartements.length > 0;
  const displayText = selectedDepartements.length === 0 
    ? "Sélectionner des départements..."
    : selectedDepartements.length === 1
    ? `${selectedDepartements.length} département sélectionné`
    : `${selectedDepartements.length} départements sélectionnés`;

  return (
    <button 
      className={`btn-trigger ${hasSelection ? 'has-selection' : ''}`}
      onClick={onToggle}
    >
      <span className={hasSelection ? '' : 'placeholder-text'}>{displayText}</span>
      <ChevronRight size={14} className="trigger-icon" />
    </button>
  );
};

// Créer un trigger personnalisé pour les effectifs
const EffectifTrigger = ({ selectedEffectif, onToggle }) => {
  const hasSelection = !!selectedEffectif;
  const displayText = !selectedEffectif 
    ? "Sélectionner une tranche d'effectif..."
    : EFFECTIF_MAPPING[selectedEffectif] || selectedEffectif;

  return (
    <button 
      className={`btn-trigger ${hasSelection ? 'has-selection' : ''}`}
      onClick={onToggle}
    >
      <span className={hasSelection ? '' : 'placeholder-text'}>{displayText}</span>
      <ChevronRight size={14} className="trigger-icon" />
    </button>
  );
};

// Créer un trigger personnalisé pour les indicateurs
const IndicateurTrigger = ({ selectedIndicateurs, onToggle }) => {
  const hasSelection = selectedIndicateurs.length > 0;
  const displayText = selectedIndicateurs.length === 0 
    ? "Sélectionner des indicateurs..."
    : selectedIndicateurs.length === 1
    ? `${selectedIndicateurs[0]} sélectionné`
    : `${selectedIndicateurs.length} indicateurs sélectionnés`;

  return (
    <button 
      className={`btn-trigger ${hasSelection ? 'has-selection' : ''}`}
      onClick={onToggle}
    >
      <span className={hasSelection ? '' : 'placeholder-text'}>{displayText}</span>
      <ChevronRight size={14} className="trigger-icon" />
    </button>
  );
};



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
  const [departementSidebarOpen, setDepartementSidebarOpen] = useState(false);
  const [effectifSidebarOpen, setEffectifSidebarOpen] = useState(false);
  const [indicateurSidebarOpen, setIndicateurSidebarOpen] = useState(false);
  
  // Ref pour détecter les clics à l'extérieur
  const sidebarRef = useRef(null);

  // Fonction pour fermer toutes les sidebars
  const closeAllSidebars = () => {
    setNafSidebarOpen(false);
    setDepartementSidebarOpen(false);
    setEffectifSidebarOpen(false);
    setIndicateurSidebarOpen(false);
  };

  // Fonctions pour ouvrir une sidebar spécifique (ferme les autres)
  const openNafSidebar = () => {
    closeAllSidebars();
    setNafSidebarOpen(true);
  };

  const openDepartementSidebar = () => {
    closeAllSidebars();
    setDepartementSidebarOpen(true);
  };

  const openEffectifSidebar = () => {
    closeAllSidebars();
    setEffectifSidebarOpen(true);
  };

  const openIndicateurSidebar = () => {
    closeAllSidebars();
    setIndicateurSidebarOpen(true);
  };

  // Détecter les clics à l'extérieur pour fermer les sidebars
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Vérifier si au moins une sidebar est ouverte
      const anySidebarOpen = nafSidebarOpen || departementSidebarOpen || effectifSidebarOpen || indicateurSidebarOpen;
      
      if (anySidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // Vérifier si le clic n'est pas sur un trigger button
        const isClickOnTrigger = event.target.closest('.btn-trigger');
        if (!isClickOnTrigger) {
          closeAllSidebars();
        }
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeAllSidebars();
      }
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [nafSidebarOpen, departementSidebarOpen, effectifSidebarOpen, indicateurSidebarOpen]);

  const resetFilters = () => {
    // Vider la barre de recherche en premier
    setQuery("");

    // Réinitialiser tous les filtres
    setFilters({
      secteur: "",
      sectors: [],
      departements: [],
      trancheEffectifs: "",
      formeJuridique: "",
      sortBy: "pertinence",
      economieSocialeSolidaire: false,
      societeMission: false,
      activitePrincipaleArtisanale: false,
      activitePrincipaleFormationRecherche: false,
      donneesPubliees: [],
      empreintePubliee: true,
    });

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
              {filters.sectors.length > 0 && (
                <Badge bg="primary" className="me-1 mb-1">
                  Activité{filters.sectors.length > 1 ? 's' : ''} 
                </Badge>
              )}
              {filters.departements.length > 0 && (
                <Badge bg="info" className="me-1 mb-1">
                  {filters.departements.length} département{filters.departements.length > 1 ? 's' : ''}
                </Badge>
              )}
              {filters.trancheEffectifs && (
                <Badge bg="secondary" className="me-1 mb-1">
                  {filters.trancheEffectifs} salariés
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

        {/* Option recherche - Apparaît seulement si on a des filtres */}
        {(filters.sectors.length > 0 || filters.departements.length > 0 || filters.trancheEffectifs || filters.economieSocialeSolidaire || filters.societeMission || filters.donneesPubliees.length > 0) && (
          <div className="filter-group">
            <Form.Check
              type="checkbox"
              id="filter-published-data-only-sidebar"
              label="Données disponibles"
              checked={filters.empreintePubliee ?? true}
              onChange={(e) => setFilters({...filters, empreintePubliee: e.target.checked})}
              className="mb-2 filter-checkbox small"
              disabled
            />
          </div>
        )}

        {/* Activité */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><Building2 size={16} /></span>
            Activité
          </Form.Label>
          <NafTrigger
            selectedCodes={filters.sectors}
            onToggle={openNafSidebar}
          />
        </div>

        {/* Départements */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><MapPin size={16} /></span>
            Départements
          </Form.Label>
          <DepartementTrigger
            selectedDepartements={filters.departements}
            onToggle={openDepartementSidebar}
          />
        </div>

        {/* Effectif */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><Users size={16} /></span>
            Effectif
          </Form.Label>
          <EffectifTrigger
            selectedEffectif={filters.trancheEffectifs}
            onToggle={openEffectifSidebar}
          />
        </div>

        {/* Données publiées */}
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon"><CheckCircle size={16} /></span>
            Données publiées
          </Form.Label>
          <IndicateurTrigger
            selectedIndicateurs={filters.donneesPubliees}
            onToggle={openIndicateurSidebar}
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
          variant="light" 
          size="sm" 
          onClick={resetFilters}
          className="reset-button text-primary fw-medium "
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

      {/* Sidebars - Wrapper avec ref pour détecter les clics extérieurs */}
      <div ref={sidebarRef}>
        <NafSidebarSelector
          selectedCodes={filters.sectors}
          onChange={(selectedCodes) => setFilters({...filters, sectors: selectedCodes})}
          isOpen={nafSidebarOpen}
          onToggle={closeAllSidebars}
        />
        
        <DepartementSidebarSelector
          selectedDepartements={filters.departements}
          onChange={(selectedDepartements) => setFilters({...filters, departements: selectedDepartements})}
          isOpen={departementSidebarOpen}
          onToggle={closeAllSidebars}
        />
        
        <EffectifSidebarSelector
          selectedEffectif={filters.trancheEffectifs}
          onChange={(selectedEffectif) => setFilters({...filters, trancheEffectifs: selectedEffectif})}
          isOpen={effectifSidebarOpen}
          onToggle={closeAllSidebars}
        />
        
        <IndicateurSidebarSelector
          selectedIndicateurs={filters.donneesPubliees}
          onChange={(selectedIndicateurs) => setFilters({...filters, donneesPubliees: selectedIndicateurs})}
          isOpen={indicateurSidebarOpen}
          onToggle={closeAllSidebars}
        />
      </div>
    </div>
  );
}