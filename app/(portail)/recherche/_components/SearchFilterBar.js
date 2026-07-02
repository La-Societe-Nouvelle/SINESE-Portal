"use client";

import { useState, useEffect, useRef, useOptimistic } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button, Badge, Form, Offcanvas } from "react-bootstrap";
import { SlidersHorizontal, MapPin, Users, Building2, CheckCircle, RotateCcw, Info, ChevronDown } from "lucide-react";
import NafTrigger from "@/_components/forms/NafTrigger";
import NafSidebarSelector from "@/_components/forms/NafSidebarSelector";
import DepartementSidebarSelector from "@/_components/forms/DepartementSidebarSelector";
import EffectifSidebarSelector from "@/_components/forms/EffectifSidebarSelector";
import IndicateurSidebarSelector from "@/_components/forms/IndicateurSidebarSelector";
import { EFFECTIF_MAPPING } from "@/_utils/effectifMapping";
import { parseFiltersFromParams, filtersToSearchParams } from "../_utils/searchParams";
import { useSearchTransition } from "./SearchTransitionContext";

const FilterPill = ({ icon, label, count, active, onClick }) => (
  <button type="button" className={`filter-pill ${active ? 'is-active' : ''}`} onClick={onClick}>
    {icon}
    <span>{label}</span>
    {count > 0 && <span className="filter-pill-count">{count}</span>}
    <ChevronDown size={14} className="filter-pill-chevron" />
  </button>
);

export default function SearchFilterBar({ className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startTransition } = useSearchTransition();

  // Derived from URL — always in sync with current route
  const query = searchParams.get("s") || "";
  const filters = parseFiltersFromParams(searchParams);

  // Reflects the click immediately (pill appears active right away) instead of
  // waiting for the URL/RSC round-trip to commit — resets to `filters` once
  // the transition settles.
  const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);

  // Pure UI state — not reflected in URL
  const [showMobile, setShowMobile] = useState(false);
  const [nafOpen, setNafOpen] = useState(false);
  const [departementOpen, setDepartementOpen] = useState(false);
  const [effectifOpen, setEffectifOpen] = useState(false);
  const [indicateurOpen, setIndicateurOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const barRef = useRef(null);

  const closeAllPanels = () => {
    setNafOpen(false);
    setDepartementOpen(false);
    setEffectifOpen(false);
    setIndicateurOpen(false);
    setMoreFiltersOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const anyPanelOpen = nafOpen || departementOpen || effectifOpen || indicateurOpen || moreFiltersOpen;
      if (anyPanelOpen && barRef.current && !barRef.current.contains(event.target)) {
        if (!event.target.closest('.filter-pill')) closeAllPanels();
      }
    };
    const handleEscape = (e) => { if (e.key === 'Escape') closeAllPanels(); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [nafOpen, departementOpen, effectifOpen, indicateurOpen, moreFiltersOpen]);

  // Updates a single filter key and pushes new URL (page reset to 1)
  const updateFilter = (key, value) => {
    const updated = { ...optimisticFilters, [key]: value };
    const params = filtersToSearchParams(updated, searchParams);
    startTransition(() => {
      setOptimisticFilters(updated);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      setOptimisticFilters(parseFiltersFromParams(new URLSearchParams()));
      router.replace(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = query || Object.values(optimisticFilters).some(f =>
    Array.isArray(f) ? f.length > 0 : !!f
  );

  // Count of active filters tucked inside the "Plus de filtres" panel, shown
  // on the pill so a collapsed selection is still visible at a glance.
  const moreFiltersActiveCount = [
    !!optimisticFilters.trancheEffectifs,
    optimisticFilters.economieSocialeSolidaire,
    !!optimisticFilters.societeMission,
  ].filter(Boolean).length;

  const FilterBarContent = () => (
    <div className="filter-pills-bar">
      <FilterPill
        icon={<Building2 size={14} />}
        label="Secteur d'activité"
        count={optimisticFilters.secteurs.length}
        active={optimisticFilters.secteurs.length > 0}
        onClick={() => { closeAllPanels(); setNafOpen(true); }}
      />
      <FilterPill
        icon={<MapPin size={14} />}
        label="Localisation"
        count={optimisticFilters.departements.length}
        active={optimisticFilters.departements.length > 0}
        onClick={() => { closeAllPanels(); setDepartementOpen(true); }}
      />
      <FilterPill
        icon={<CheckCircle size={14} />}
        label="Publications"
        count={optimisticFilters.donneesPubliees.length + (optimisticFilters.rapportPublie ? 1 : 0)}
        active={optimisticFilters.donneesPubliees.length > 0 || optimisticFilters.rapportPublie}
        onClick={() => { closeAllPanels(); setIndicateurOpen(true); }}
      />
      <FilterPill
        icon={<Users size={14} />}
        label="Effectif"
        count={optimisticFilters.trancheEffectifs ? 1 : 0}
        active={!!optimisticFilters.trancheEffectifs}
        onClick={() => { closeAllPanels(); setEffectifOpen(true); }}
      />

      <div className="filter-pill-dropdown-wrapper">
        <FilterPill
          icon={<SlidersHorizontal size={14} />}
          label="Plus de filtres"
          count={moreFiltersActiveCount}
          active={moreFiltersActiveCount > 0}
          onClick={() => { const next = !moreFiltersOpen; closeAllPanels(); setMoreFiltersOpen(next); }}
        />

        {moreFiltersOpen && (
          <div className="filter-pill-dropdown">
            <div className="filter-group">
              <div className="bonus-filters">
                <Form.Check
                  type="checkbox"
                  id="filter-ess-sidebar"
                  label="Économie Sociale et Solidaire (ESS)"
                  checked={optimisticFilters.economieSocialeSolidaire}
                  onChange={(e) => updateFilter("economieSocialeSolidaire", e.target.checked)}
                  className="mb-2 filter-checkbox"
                />
                <Form.Check
                  type="checkbox"
                  id="filter-mission-sidebar"
                  label="Société à mission"
                  checked={!!optimisticFilters.societeMission}
                  onChange={(e) => updateFilter("societeMission", e.target.checked ? true : null)}
                  className="mb-2 filter-checkbox"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="filter-pills-spacer" />

      {hasActiveFilters && (
        <button type="button" className="filter-pill filter-pill-reset" onClick={resetFilters}>
          <RotateCcw size={14} />
          <span>Réinitialiser</span>
        </button>
      )}
    </div>
  );

  const MobileFilterList = () => (
    <div className="sidebar-filters">
      <div className="sidebar-body">
        <div className="filter-group">
          <Form.Label className="filter-label"><span className="filter-icon"><Building2 size={16} /></span>Secteur d'activité</Form.Label>
          <NafTrigger selectedCodes={optimisticFilters.secteurs} onToggle={() => { closeAllPanels(); setNafOpen(true); }} />
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label"><span className="filter-icon"><MapPin size={16} /></span>Départements</Form.Label>
          <button className={`btn-trigger ${optimisticFilters.departements.length ? 'has-selection' : ''}`} onClick={() => { closeAllPanels(); setDepartementOpen(true); }}>
            <span className={optimisticFilters.departements.length ? '' : 'placeholder-text'}>
              {optimisticFilters.departements.length > 0 ? `${optimisticFilters.departements.length} département(s) sélectionné(s)` : "Sélectionner des départements..."}
            </span>
          </button>
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label"><span className="filter-icon"><CheckCircle size={16} /></span>Publications</Form.Label>
          <button className={`btn-trigger ${(optimisticFilters.donneesPubliees.length || optimisticFilters.rapportPublie) ? 'has-selection' : ''}`} onClick={() => { closeAllPanels(); setIndicateurOpen(true); }}>
            <span className={(optimisticFilters.donneesPubliees.length || optimisticFilters.rapportPublie) ? '' : 'placeholder-text'}>
              {optimisticFilters.donneesPubliees.length > 0 || optimisticFilters.rapportPublie
                ? `${optimisticFilters.donneesPubliees.length + (optimisticFilters.rapportPublie ? 1 : 0)} sélection(s)`
                : "Rapport, indicateurs..."}
            </span>
          </button>
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label"><span className="filter-icon"><Users size={16} /></span>Effectif</Form.Label>
          <button className={`btn-trigger ${optimisticFilters.trancheEffectifs ? 'has-selection' : ''}`} onClick={() => { closeAllPanels(); setEffectifOpen(true); }}>
            <span className={optimisticFilters.trancheEffectifs ? '' : 'placeholder-text'}>
              {optimisticFilters.trancheEffectifs ? (EFFECTIF_MAPPING[optimisticFilters.trancheEffectifs] || optimisticFilters.trancheEffectifs) : "Sélectionner une tranche d'effectif..."}
            </span>
          </button>
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label"><span className="filter-icon"><CheckCircle size={16} /></span>Autres critères</Form.Label>
          <div className="bonus-filters">
            <Form.Check type="checkbox" id="filter-ess-mobile" label="Économie Sociale et Solidaire (ESS)" checked={optimisticFilters.economieSocialeSolidaire} onChange={(e) => updateFilter("economieSocialeSolidaire", e.target.checked)} className="mb-2 filter-checkbox" />
            <Form.Check type="checkbox" id="filter-mission-mobile" label="Société à mission" checked={!!optimisticFilters.societeMission} onChange={(e) => updateFilter("societeMission", e.target.checked ? true : null)} className="mb-2 filter-checkbox" />
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
    <div className={`search-filter-bar ${className}`} ref={barRef}>
      {/* Desktop: horizontal pills */}
      <div className="d-none d-lg-flex justify-content-center">
        <FilterBarContent />
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
          <MobileFilterList />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Sub-panels (shared by desktop pills and mobile list) */}
      <NafSidebarSelector
        selectedSecteurs={optimisticFilters.secteurs}
        onChange={(codes) => updateFilter("secteurs", codes)}
        isOpen={nafOpen}
        onToggle={closeAllPanels}
      />
      <DepartementSidebarSelector
        selectedDepartements={optimisticFilters.departements}
        onChange={(depts) => updateFilter("departements", depts)}
        isOpen={departementOpen}
        onToggle={closeAllPanels}
      />
      <EffectifSidebarSelector
        selectedEffectif={optimisticFilters.trancheEffectifs}
        onChange={(tranche) => updateFilter("trancheEffectifs", tranche)}
        isOpen={effectifOpen}
        onToggle={closeAllPanels}
      />
      <IndicateurSidebarSelector
        selectedIndicateurs={optimisticFilters.donneesPubliees}
        onChange={(indics) => updateFilter("donneesPubliees", indics)}
        hasPublishedReport={optimisticFilters.rapportPublie}
        onToggleHasPublishedReport={(checked) => updateFilter("rapportPublie", checked)}
        isOpen={indicateurOpen}
        onToggle={closeAllPanels}
      />
    </div>
  );
}
