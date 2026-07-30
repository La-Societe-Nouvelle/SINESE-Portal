"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Badge, Form, Offcanvas } from "react-bootstrap";
import { SlidersHorizontal, MapPin, Users, Building2, CheckCircle, RotateCcw, Info, ChevronDown } from "lucide-react";
import NafTrigger from "@/_components/forms/NafTrigger";
import NafSidebarSelector from "@/_components/forms/NafSidebarSelector";
import DepartementSidebarSelector from "@/_components/forms/DepartementSidebarSelector";
import EffectifSidebarSelector from "@/_components/forms/EffectifSidebarSelector";
import IndicateurSidebarSelector from "@/_components/forms/IndicateurSidebarSelector";
import { EFFECTIF_MAPPING } from "@/_utils/effectifMapping";
import { useSearch } from "./SearchContext";

const FilterPill = ({ icon, label, count, active, onClick, ariaLabel, ariaExpanded }) => (
  <button
    type="button"
    className={`filter-pill ${active ? 'is-active' : ''}`}
    onClick={onClick}
    aria-label={ariaLabel || `${label}${count > 0 ? `, ${count} filtre(s) actif(s)` : ''}`}
    aria-expanded={ariaExpanded}
    aria-haspopup="true"
    title={active ? `Modifier ${label}` : label}
  >
    {icon}
    <span>{label}</span>
    {count > 0 && <span className="filter-pill-count" aria-label={`${count} filtre(s)`}>{count}</span>}
    <ChevronDown size={14} className="filter-pill-chevron" aria-hidden="true" />
  </button>
);

export default function SearchFilterBar({ className = "" }) {
  // État client synchrone (SearchContext) : le clic se reflète immédiatement,
  // sans useOptimistic ni transition — le fetch part en arrière-plan, debouncé
  // et annulable, sans navigation App Router.
  const { query, filters, updateFilter, resetFilters } = useSearch();

  // Pure UI state — not reflected in URL
  const [showMobile, setShowMobile] = useState(false);
  const [nafOpen, setNafOpen] = useState(false);
  const [departementOpen, setDepartementOpen] = useState(false);
  const [effectifOpen, setEffectifOpen] = useState(false);
  const [indicateurOpen, setIndicateurOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const barRef = useRef(null);

  // Focus management for accessibility
  const lastActiveElement = useRef(null);

  const closeAllPanels = useCallback(() => {
    setNafOpen(false);
    setDepartementOpen(false);
    setEffectifOpen(false);
    setIndicateurOpen(false);
    setMoreFiltersOpen(false);
    
    // Restore focus to the trigger element if it exists
    if (lastActiveElement.current) {
      lastActiveElement.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const anyPanelOpen = nafOpen || departementOpen || effectifOpen || indicateurOpen || moreFiltersOpen;
      if (anyPanelOpen && barRef.current && !barRef.current.contains(event.target)) {
        if (!event.target.closest('.filter-pill') && !event.target.closest('.sidebar-selector')) {
          closeAllPanels();
        }
      }
    };
    const handleEscape = (e) => { 
      if (e.key === 'Escape') closeAllPanels(); 
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [nafOpen, departementOpen, effectifOpen, indicateurOpen, moreFiltersOpen, closeAllPanels]);

  const hasActiveFilters = query || Object.values(filters).some(f =>
    Array.isArray(f) ? f.length > 0 : !!f
  );

  // Count of active filters tucked inside the "Plus de filtres" panel, shown
  // on the pill so a collapsed selection is still visible at a glance.
  const moreFiltersActiveCount = [
    !!filters.trancheEffectifs,
    filters.economieSocialeSolidaire,
    !!filters.societeMission,
  ].filter(Boolean).length;

  const FilterBarContent = () => (
    <div className="filter-pills-bar" role="toolbar" aria-label="Barre de filtres de recherche">
      <FilterPill
        icon={<Building2 size={14} />}
        label="Secteur d'activité"
        count={filters.secteurs.length}
        active={filters.secteurs.length > 0}
        onClick={() => { 
          closeAllPanels(); 
          setNafOpen(true);
        }}
        ariaExpanded={nafOpen}
        ariaLabel={`Filtrer par secteur d'activité${filters.secteurs.length > 0 ? ', ' + filters.secteurs.length + ' secteur(s) sélectionné(s)' : ''}`}
      />
      <FilterPill
        icon={<MapPin size={14} />}
        label="Localisation"
        count={filters.departements.length}
        active={filters.departements.length > 0}
        onClick={() => { 
          closeAllPanels(); 
          setDepartementOpen(true);
        }}
        ariaExpanded={departementOpen}
        ariaLabel={`Filtrer par localisation${filters.departements.length > 0 ? ', ' + filters.departements.length + ' département(s) sélectionné(s)' : ''}`}
      />
      <FilterPill
        icon={<CheckCircle size={14} />}
        label="Publications"
        count={filters.donneesPubliees.length + (filters.rapportPublie ? 1 : 0)}
        active={filters.donneesPubliees.length > 0 || filters.rapportPublie}
        onClick={() => { 
          closeAllPanels(); 
          setIndicateurOpen(true);
        }}
        ariaExpanded={indicateurOpen}
        ariaLabel={`Filtrer par publications${(filters.donneesPubliees.length + (filters.rapportPublie ? 1 : 0)) > 0 ? ', ' + (filters.donneesPubliees.length + (filters.rapportPublie ? 1 : 0)) + ' publication(s) sélectionnée(s)' : ''}`}
      />
      <FilterPill
        icon={<Users size={14} />}
        label="Effectif"
        count={filters.trancheEffectifs ? 1 : 0}
        active={!!filters.trancheEffectifs}
        onClick={() => { 
          closeAllPanels(); 
          setEffectifOpen(true);
        }}
        ariaExpanded={effectifOpen}
        ariaLabel={`Filtrer par effectif${filters.trancheEffectifs ? ', ' + (EFFECTIF_MAPPING[filters.trancheEffectifs] || filters.trancheEffectifs) + ' sélectionné' : ''}`}
      />

      <div className="filter-pill-dropdown-wrapper">
        <FilterPill
          icon={<SlidersHorizontal size={14} />}
          label="Plus de filtres"
          count={moreFiltersActiveCount}
          active={moreFiltersActiveCount > 0}
          onClick={() => { 
            const next = !moreFiltersOpen; 
            closeAllPanels(); 
            setMoreFiltersOpen(next);
          }}
          ariaExpanded={moreFiltersOpen}
          ariaLabel={`Plus de filtres${moreFiltersActiveCount > 0 ? ', ' + moreFiltersActiveCount + ' filtre(s) actif(s)' : ''}`}
        />

        {moreFiltersOpen && (
          <div className="filter-pill-dropdown" role="region" aria-label="Filtres supplémentaires">
            <fieldset className="filter-group">
              <legend className="visually-hidden">Filtres supplémentaires</legend>
              <div className="bonus-filters" role="group" aria-label="Autres critères de filtrage">
                <Form.Check
                  type="checkbox"
                  id="filter-ess-sidebar"
                  label="Économie Sociale et Solidaire (ESS)"
                  checked={filters.economieSocialeSolidaire}
                  onChange={(e) => updateFilter("economieSocialeSolidaire", e.target.checked)}
                  className="mb-2 filter-checkbox"
                  aria-describedby="ess-filter-desc"
                />
                <Form.Check
                  type="checkbox"
                  id="filter-mission-sidebar"
                  label="Société à mission"
                  checked={!!filters.societeMission}
                  onChange={(e) => updateFilter("societeMission", e.target.checked ? true : null)}
                  className="mb-2 filter-checkbox"
                  aria-describedby="mission-filter-desc"
                />
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <div className="filter-pills-spacer" />

      {hasActiveFilters && (
        <button 
          type="button" 
          className="filter-pill filter-pill-reset"
          onClick={resetFilters}
          aria-label="Réinitialiser tous les filtres"
          title="Réinitialiser tous les filtres"
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>Réinitialiser</span>
        </button>
      )}
    </div>
  );

  const MobileFilterList = () => (
    <div className="sidebar-filters">
      <div className="sidebar-body" id="mobile-filter-body">
        <div className="filter-group">
          <Form.Label className="filter-label" htmlFor="mobile-naf-trigger">
            <span className="filter-icon" aria-hidden="true"><Building2 size={16} /></span>
            Secteur d'activité
          </Form.Label>
          <NafTrigger 
            id="mobile-naf-trigger"
            selectedCodes={filters.secteurs} 
            onToggle={() => { closeAllPanels(); setNafOpen(true); }}
            aria-label={`Secteur d'activité${filters.secteurs.length > 0 ? ', ' + filters.secteurs.length + ' sélectionné(s)' : ''}`}
          />
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label" htmlFor="mobile-departement-trigger">
            <span className="filter-icon" aria-hidden="true"><MapPin size={16} /></span>
            Département
          </Form.Label>
          <button 
            id="mobile-departement-trigger"
            className={`btn-trigger ${filters.departements.length ? 'has-selection' : ''}`} 
            onClick={() => { closeAllPanels(); setDepartementOpen(true); }}
            aria-label={`Départements${filters.departements.length > 0 ? ', ' + filters.departements.length + ' sélectionné(s)' : ''}`}
            aria-expanded={departementOpen}
            aria-haspopup="true"
          >
            <span className={filters.departements.length ? '' : 'placeholder-text'}>
              {filters.departements.length > 0 ? `${filters.departements.length} département(s) sélectionné(s)` : "Sélectionner des départements..."}
            </span>
          </button>
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label" htmlFor="mobile-publication-trigger">
            <span className="filter-icon" aria-hidden="true"><CheckCircle size={16} /></span>
            Publications
          </Form.Label>
          <button 
            id="mobile-publication-trigger"
            className={`btn-trigger ${(filters.donneesPubliees.length || filters.rapportPublie) ? 'has-selection' : ''}`} 
            onClick={() => { closeAllPanels(); setIndicateurOpen(true); }}
            aria-label={`Publications${(filters.donneesPubliees.length + (filters.rapportPublie ? 1 : 0)) > 0 ? ', ' + (filters.donneesPubliees.length + (filters.rapportPublie ? 1 : 0)) + ' sélectionnée(s)' : ''}`}
            aria-expanded={indicateurOpen}
            aria-haspopup="true"
          >
            <span className={(filters.donneesPubliees.length || filters.rapportPublie) ? '' : 'placeholder-text'}>
              {filters.donneesPubliees.length > 0 || filters.rapportPublie
                ? `${filters.donneesPubliees.length + (filters.rapportPublie ? 1 : 0)} sélection(s)`
                : "Rapport, indicateurs..."}
            </span>
          </button>
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label" htmlFor="mobile-effectif-trigger">
            <span className="filter-icon" aria-hidden="true"><Users size={16} /></span>
            Effectif
          </Form.Label>
          <button 
            id="mobile-effectif-trigger"
            className={`btn-trigger ${filters.trancheEffectifs ? 'has-selection' : ''}`} 
            onClick={() => { closeAllPanels(); setEffectifOpen(true); }}
            aria-label={`Effectif${filters.trancheEffectifs ? ', ' + (EFFECTIF_MAPPING[filters.trancheEffectifs] || filters.trancheEffectifs) + ' sélectionné' : ''}`}
            aria-expanded={effectifOpen}
            aria-haspopup="true"
          >
            <span className={filters.trancheEffectifs ? '' : 'placeholder-text'}>
              {filters.trancheEffectifs ? (EFFECTIF_MAPPING[filters.trancheEffectifs] || filters.trancheEffectifs) : "Sélectionner une tranche d'effectif..."}
            </span>
          </button>
        </div>
        <fieldset className="filter-group">
          <legend className="filter-label">
            <span className="filter-icon" aria-hidden="true"><CheckCircle size={16} /></span>
            Autres critères
          </legend>
          <div className="bonus-filters" role="group" aria-label="Filtres supplémentaires">
            <Form.Check 
              type="checkbox" 
              id="filter-ess-mobile" 
              label="Économie Sociale et Solidaire (ESS)"
              checked={filters.economieSocialeSolidaire}
              onChange={(e) => updateFilter("economieSocialeSolidaire", e.target.checked)}
              className="mb-2 filter-checkbox"
              aria-describedby="filter-ess-desc"
            />
            <Form.Check 
              type="checkbox" 
              id="filter-mission-mobile" 
              label="Société à mission"
              checked={!!filters.societeMission}
              onChange={(e) => updateFilter("societeMission", e.target.checked ? true : null)}
              className="mb-2 filter-checkbox"
              aria-describedby="filter-mission-desc"
            />
          </div>
        </fieldset>
      </div>
      <div className="sidebar-footer">
        <Button 
          variant="light" 
          size="sm" 
          onClick={resetFilters} 
          className="reset-button text-primary fw-medium"
          aria-label="Réinitialiser tous les filtres"
        >
          <RotateCcw size={14} className="reset-icon" aria-hidden="true" />
          Réinitialiser
        </Button>
        <div className="sidebar-info" role="note" aria-live="polite">
          <div className="d-flex align-items-start">
            <Info size={12} className="info-icon" aria-hidden="true" />
            <span>Les filtres s'appliquent automatiquement à votre recherche.</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <nav className={`search-filter-bar ${className}`} ref={barRef} aria-label="Filtres de recherche">
      {/* Desktop: horizontal pills */}
      <div className="d-none d-lg-flex justify-content-center">
        <FilterBarContent />
      </div>

      {/* Mobile trigger */}
      <div className="d-lg-none">
        <Button 
          variant="outline-primary" 
          onClick={() => { 
            setShowMobile(true);
            lastActiveElement.current = document.activeElement;
          }}
          className="mobile-trigger"
          aria-label="Ouvrir les filtres de recherche"
          aria-expanded={showMobile}
          aria-controls="mobile-filter-offcanvas"
        >
          <SlidersHorizontal size={16} className="trigger-icon" aria-hidden="true" />
          Filtres de recherche
        </Button>
      </div>

      {/* Offcanvas Mobile */}
      <Offcanvas 
        show={showMobile} 
        onHide={() => { 
          setShowMobile(false);
          closeAllPanels();
        }} 
        placement="start" 
        className="search-sidebar-mobile"
        id="mobile-filter-offcanvas"
        aria-label="Filtres de recherche"
        restoreFocus={false}
        onEntered={() => {
          // Focus on first focusable element in the offcanvas
          const firstFocusable = document.querySelector('#mobile-filter-offcanvas .filter-group button, #mobile-filter-offcanvas .filter-group [tabindex]:not([tabindex="-1"])');
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }}
        onExited={() => {
          // Restore focus to the trigger button
          const trigger = document.querySelector('.mobile-trigger button');
          if (trigger) {
            trigger.focus();
          }
        }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title id="mobile-filter-title">Filtres de recherche</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <MobileFilterList />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Sub-panels (shared by desktop pills and mobile list) */}
      <NafSidebarSelector
        selectedSecteurs={filters.secteurs}
        onChange={(codes) => updateFilter("secteurs", codes)}
        isOpen={nafOpen}
        onToggle={closeAllPanels}
      />
      <DepartementSidebarSelector
        selectedDepartements={filters.departements}
        onChange={(depts) => updateFilter("departements", depts)}
        isOpen={departementOpen}
        onToggle={closeAllPanels}
      />
      <EffectifSidebarSelector
        selectedEffectif={filters.trancheEffectifs}
        onChange={(tranche) => updateFilter("trancheEffectifs", tranche)}
        isOpen={effectifOpen}
        onToggle={closeAllPanels}
      />
      <IndicateurSidebarSelector
        selectedIndicateurs={filters.donneesPubliees}
        onChange={(indics) => updateFilter("donneesPubliees", indics)}
        hasPublishedReport={filters.rapportPublie}
        onToggleHasPublishedReport={(checked) => updateFilter("rapportPublie", checked)}
        isOpen={indicateurOpen}
        onToggle={closeAllPanels}
      />
    </nav>
  );
}
