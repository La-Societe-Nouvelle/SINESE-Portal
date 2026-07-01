"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button, Badge, Form, Offcanvas } from "react-bootstrap";
import { SlidersHorizontal, MapPin, Users, Building2, CheckCircle, RotateCcw, Info, ChevronRight } from "lucide-react";
import NafTrigger from "@/_components/forms/NafTrigger";
import NafSidebarSelector from "@/_components/forms/NafSidebarSelector";
import DepartementSidebarSelector from "@/_components/forms/DepartementSidebarSelector";
import EffectifSidebarSelector from "@/_components/forms/EffectifSidebarSelector";
import IndicateurSidebarSelector from "@/_components/forms/IndicateurSidebarSelector";
import { EFFECTIF_MAPPING } from "@/_utils/effectifMapping";
import { parseFiltersFromParams, filtersToSearchParams } from "../_utils/searchParams";

const DepartementTrigger = ({ selectedDepartements, onToggle }) => {
  const hasSelection = selectedDepartements.length > 0;
  const displayText = !hasSelection
    ? "Sélectionner des départements..."
    : selectedDepartements.length === 1
    ? `${selectedDepartements.length} département sélectionné`
    : `${selectedDepartements.length} départements sélectionnés`;

  return (
    <button className={`btn-trigger ${hasSelection ? 'has-selection' : ''}`} onClick={onToggle}>
      <span className={hasSelection ? '' : 'placeholder-text'}>{displayText}</span>
      <ChevronRight size={14} className="trigger-icon" />
    </button>
  );
};

const EffectifTrigger = ({ selectedEffectif, onToggle }) => {
  const hasSelection = !!selectedEffectif;
  const displayText = !hasSelection
    ? "Sélectionner une tranche d'effectif..."
    : EFFECTIF_MAPPING[selectedEffectif] || selectedEffectif;

  return (
    <button className={`btn-trigger ${hasSelection ? 'has-selection' : ''}`} onClick={onToggle}>
      <span className={hasSelection ? '' : 'placeholder-text'}>{displayText}</span>
      <ChevronRight size={14} className="trigger-icon" />
    </button>
  );
};

const IndicateurTrigger = ({ selectedIndicateurs, onToggle }) => {
  const hasSelection = selectedIndicateurs.length > 0;
  const displayText = !hasSelection
    ? "Sélectionner des indicateurs..."
    : selectedIndicateurs.length === 1
    ? `${selectedIndicateurs[0]} sélectionné`
    : `${selectedIndicateurs.length} indicateurs sélectionnés`;

  return (
    <button className={`btn-trigger ${hasSelection ? 'has-selection' : ''}`} onClick={onToggle}>
      <span className={hasSelection ? '' : 'placeholder-text'}>{displayText}</span>
      <ChevronRight size={14} className="trigger-icon" />
    </button>
  );
};

export default function SearchSidebar({ className = "" }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Derived from URL — always in sync with current route
  const query   = searchParams.get("s") || "";
  const filters = parseFiltersFromParams(searchParams);

  // Pure UI state — not reflected in URL
  const [showMobile, setShowMobile] = useState(false);
  const [nafSidebarOpen, setNafSidebarOpen] = useState(false);
  const [departementSidebarOpen, setDepartementSidebarOpen] = useState(false);
  const [effectifSidebarOpen, setEffectifSidebarOpen] = useState(false);
  const [indicateurSidebarOpen, setIndicateurSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const closeAllSidebars = () => {
    setNafSidebarOpen(false);
    setDepartementSidebarOpen(false);
    setEffectifSidebarOpen(false);
    setIndicateurSidebarOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const anySidebarOpen = nafSidebarOpen || departementSidebarOpen || effectifSidebarOpen || indicateurSidebarOpen;
      if (anySidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (!event.target.closest('.btn-trigger')) closeAllSidebars();
      }
    };
    const handleEscape = (e) => { if (e.key === 'Escape') closeAllSidebars(); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [nafSidebarOpen, departementSidebarOpen, effectifSidebarOpen, indicateurSidebarOpen]);

  // Updates a single filter key and pushes new URL (page reset to 1)
  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    const params  = filtersToSearchParams(updated, searchParams);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = query || Object.values(filters).some(f =>
    Array.isArray(f) ? f.length > 0 : !!f
  );

  const SidebarContent = () => (
    <div className="sidebar-filters">
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

      <div className="sidebar-body">
        {hasActiveFilters && (
          <div className="filter-group active-filters">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="filter-label">
                <span className="filter-icon"><CheckCircle size={16} /></span>
                Filtres actifs
              </Form.Label>
              <Button
                variant="link" size="sm"
                className="text-danger p-0 fw-medium"
                onClick={resetFilters}
                style={{ fontSize: '0.75rem' }}
              >
                Tout effacer
              </Button>
            </div>
            <div className="active-filter-badges">
              {query && <Badge bg="primary" className="me-1 mb-1">"{query}"</Badge>}
              {filters.sectors.length > 0 && (
                <Badge bg="primary" className="me-1 mb-1">Activité{filters.sectors.length > 1 ? 's' : ''}</Badge>
              )}
              {filters.departements.length > 0 && (
                <Badge bg="info" className="me-1 mb-1">{filters.departements.length} département{filters.departements.length > 1 ? 's' : ''}</Badge>
              )}
              {filters.trancheEffectifs && (
                <Badge bg="secondary" className="me-1 mb-1">{filters.trancheEffectifs} salariés</Badge>
              )}
              {filters.economieSocialeSolidaire && <Badge bg="success" className="me-1 mb-1">ESS</Badge>}
              {filters.societeMission && <Badge bg="success" className="me-1 mb-1">Société à mission</Badge>}
              {filters.activitePrincipaleArtisanale && <Badge bg="info" className="me-1 mb-1">Artisanale</Badge>}
              {filters.activitePrincipaleFormationRecherche && <Badge bg="info" className="me-1 mb-1">Formation/Recherche</Badge>}
              {filters.donneesPubliees.map(code => (
                <Badge key={code} bg="primary" className="me-1 mb-1">{code}</Badge>
              ))}
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
            selectedCodes={filters.sectors}
            onToggle={() => { closeAllSidebars(); setNafSidebarOpen(true); }}
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
            onToggle={() => { closeAllSidebars(); setDepartementSidebarOpen(true); }}
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
            onToggle={() => { closeAllSidebars(); setEffectifSidebarOpen(true); }}
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
            onToggle={() => { closeAllSidebars(); setIndicateurSidebarOpen(true); }}
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
              onChange={(e) => updateFilter("economieSocialeSolidaire", e.target.checked)}
              className="mb-2 filter-checkbox"
            />
            <Form.Check
              type="checkbox"
              id="filter-mission-sidebar"
              label="Société à mission"
              checked={!!filters.societeMission}
              onChange={(e) => updateFilter("societeMission", e.target.checked)}
              className="mb-2 filter-checkbox"
            />
            <Form.Check
              type="checkbox"
              id="filter-formation-sidebar"
              label="Formation et recherche"
              checked={filters.activitePrincipaleFormationRecherche}
              onChange={(e) => updateFilter("activitePrincipaleFormationRecherche", e.target.checked)}
              className="mb-2 filter-checkbox"
            />
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <Button variant="light" size="sm" onClick={resetFilters} className="reset-button text-primary fw-medium">
          <RotateCcw size={14} className="reset-icon" />
          Réinitialiser
        </Button>
        <div className="sidebar-info">
          <div className="d-flex align-items-start">
            <Info size={12} className="info-icon" />
            <span>Les filtres s'appliquent automatiquement à votre recherche.</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="search-sidebar">
      {/* Desktop */}
      <div className={`d-none d-lg-block ${className}`}>
        <div className="sidebar-container">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile trigger */}
      <div className="d-lg-none">
        <Button variant="outline-primary" onClick={() => setShowMobile(true)} className="mobile-trigger">
          <SlidersHorizontal size={16} className="trigger-icon" />
          Filtres de recherche
        </Button>
      </div>

      {/* Offcanvas Mobile */}
      <Offcanvas show={showMobile} onHide={() => setShowMobile(false)} placement="start" className="search-sidebar-mobile">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filtres de recherche</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Sub-selectors */}
      <div ref={sidebarRef}>
        <NafSidebarSelector
          selectedCodes={filters.sectors}
          onChange={(codes) => updateFilter("sectors", codes)}
          isOpen={nafSidebarOpen}
          onToggle={closeAllSidebars}
        />
        <DepartementSidebarSelector
          selectedDepartements={filters.departements}
          onChange={(depts) => updateFilter("departements", depts)}
          isOpen={departementSidebarOpen}
          onToggle={closeAllSidebars}
        />
        <EffectifSidebarSelector
          selectedEffectif={filters.trancheEffectifs}
          onChange={(tranche) => updateFilter("trancheEffectifs", tranche)}
          isOpen={effectifSidebarOpen}
          onToggle={closeAllSidebars}
        />
        <IndicateurSidebarSelector
          selectedIndicateurs={filters.donneesPubliees}
          onChange={(indics) => updateFilter("donneesPubliees", indics)}
          isOpen={indicateurSidebarOpen}
          onToggle={closeAllSidebars}
        />
      </div>
    </div>
  );
}
