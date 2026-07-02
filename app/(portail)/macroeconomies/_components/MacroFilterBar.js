"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Offcanvas, Form } from 'react-bootstrap';
import { SlidersHorizontal, Factory, Globe, BarChart3, RotateCcw, ChevronDown, LineChart } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import IndustrySelector from './IndustrySelector';
import CountrySelector from './CountrySelector';
import AggregateSelector from './AggregateSelector';
import { getDisplayLabel } from '../_utils/labels';

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

export default function MacroFilterBar({ metadata, className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef(null);

  // État des panels
  const [industryOpen, setIndustryOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [aggregateOpen, setAggregateOpen] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  // Focus management pour accessibilité
  const lastActiveElement = useRef(null);

  // Valeurs sélectionnées depuis l'URL
  const selectedValues = {
    industry: searchParams.get('industry') || 'TOTAL',
    country: searchParams.get('country') || 'FRA',
    aggregate: searchParams.get('aggregate') || 'PRD',
  };

  // Libellé de la valeur actuellement sélectionnée, affiché directement sur
  // le bouton (plutôt qu'un nom de catégorie générique type "Pays").
  const getSelectedLabel = (param, code) => {
    const item = metadata[param]?.find((i) => i.code === code);
    return getDisplayLabel(code, item?.label || code);
  };

  // Fermer tous les panels
  const closeAllPanels = useCallback(() => {
    setIndustryOpen(false);
    setCountryOpen(false);
    setAggregateOpen(false);
    
    if (lastActiveElement.current) {
      lastActiveElement.current.focus();
    }
  }, []);

  // Gestion des clics hors des panels
  useEffect(() => {
    const handleClickOutside = (event) => {
      const anyPanelOpen = industryOpen || countryOpen || aggregateOpen;
      if (anyPanelOpen && barRef.current && !barRef.current.contains(event.target)) {
        if (!event.target.closest('.filter-pill') && !event.target.closest('.position-fixed')) {
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
  }, [industryOpen, countryOpen, aggregateOpen, closeAllPanels]);

  // Mettre à jour un filtre et changer l'URL
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    closeAllPanels();
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    router.replace(pathname, { scroll: false });
    closeAllPanels();
  };

  // Vérifier si des filtres sont actifs
  const DEFAULT_VALUES = { industry: 'TOTAL', country: 'FRA', aggregate: 'PRD' };
  const hasActiveFilters = Object.entries(selectedValues).some(
    ([key, val]) => val !== DEFAULT_VALUES[key]
  );

  // Contenu de la barre de filtres (desktop)
  const FilterBarContent = () => (
    <div className="filter-pills-bar" role="toolbar" aria-label="Barre de filtres macroéconomie">
      <FilterPill
        icon={<Globe size={14} />}
        label={getSelectedLabel('country', selectedValues.country)}
        active={countryOpen}
        onClick={() => {
          closeAllPanels();
          setCountryOpen(true);
          lastActiveElement.current = document.activeElement;
        }}
        ariaExpanded={countryOpen}
        ariaLabel={`Filtrer par pays, actuellement ${getSelectedLabel('country', selectedValues.country)}`}
      />
      <FilterPill
        icon={<Factory size={14} />}
        label={getSelectedLabel('industry', selectedValues.industry)}
        active={industryOpen}
        onClick={() => {
          closeAllPanels();
          setIndustryOpen(true);
          lastActiveElement.current = document.activeElement;
        }}
        ariaExpanded={industryOpen}
        ariaLabel={`Filtrer par secteur, actuellement ${getSelectedLabel('industry', selectedValues.industry)}`}
      />
      <FilterPill
        icon={<BarChart3 size={14} />}
        label={getSelectedLabel('aggregate', selectedValues.aggregate)}
        active={aggregateOpen}
        onClick={() => {
          closeAllPanels();
          setAggregateOpen(true);
          lastActiveElement.current = document.activeElement;
        }}
        ariaExpanded={aggregateOpen}
        ariaLabel={`Filtrer par agrégat, actuellement ${getSelectedLabel('aggregate', selectedValues.aggregate)}`}
      />

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

  // Contenu mobile (dans Offcanvas)
  const MobileFilterList = () => (
    <div className="sidebar-filters">
      <div className="sidebar-body" id="mobile-filter-body">
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon" aria-hidden="true"><Globe size={16} /></span>
            Pays
          </Form.Label>
          <CountrySelector
            metadata={metadata.country}
            selected={selectedValues.country}
            onSelect={(value) => updateFilter('country', value)}
            isMobile={true}
          />
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon" aria-hidden="true"><Factory size={16} /></span>
            Secteur d'activité
          </Form.Label>
          <IndustrySelector
            metadata={metadata.industry}
            selected={selectedValues.industry}
            onSelect={(value) => updateFilter('industry', value)}
            isMobile={true}
          />
        </div>
        <div className="filter-group">
          <Form.Label className="filter-label">
            <span className="filter-icon" aria-hidden="true"><BarChart3 size={16} /></span>
            Agrégat économique
          </Form.Label>
          <AggregateSelector
            metadata={metadata.aggregate}
            selected={selectedValues.aggregate}
            onSelect={(value) => updateFilter('aggregate', value)}
            isMobile={true}
          />
        </div>
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
      </div>
    </div>
  );

  return (
    <nav className={`macro-filter-bar ${className}`} ref={barRef} aria-label="Filtres macroéconomie">
      <div className="macro-filter-bar-intro">
        <span className="intro-icon" aria-hidden="true"><LineChart size={18} /></span>
        <span className="intro-label">Vous consultez</span>
      </div>

      {/* Desktop: barre horizontale de pills */}
      <div className="d-none d-lg-flex justify-content-start">
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
          aria-label="Ouvrir les filtres macroéconomie"
          aria-expanded={showMobile}
          aria-controls="mobile-filter-offcanvas"
        >
          <SlidersHorizontal size={16} className="trigger-icon" aria-hidden="true" />
          Filtres
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
        className="macro-sidebar-mobile"
        id="mobile-filter-offcanvas"
        aria-label="Filtres macroéconomie"
        restoreFocus={false}
        onEntered={() => {
          const firstFocusable = document.querySelector('#mobile-filter-offcanvas .filter-group button, #mobile-filter-offcanvas .filter-group [tabindex]:not([tabindex="-1"])');
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }}
        onExited={() => {
          const trigger = document.querySelector('.mobile-trigger button');
          if (trigger) {
            trigger.focus();
          }
        }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title id="mobile-filter-title">Filtres Macroéconomie</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <MobileFilterList />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Panels latéraux (pour desktop) */}
      <IndustrySelector
        metadata={metadata.industry}
        selected={selectedValues.industry}
        onSelect={(value) => updateFilter('industry', value)}
        isOpen={industryOpen}
        onClose={closeAllPanels}
      />
      <CountrySelector
        metadata={metadata.country}
        selected={selectedValues.country}
        onSelect={(value) => updateFilter('country', value)}
        isOpen={countryOpen}
        onClose={closeAllPanels}
      />
      <AggregateSelector
        metadata={metadata.aggregate}
        selected={selectedValues.aggregate}
        onSelect={(value) => updateFilter('aggregate', value)}
        isOpen={aggregateOpen}
        onClose={closeAllPanels}
      />
    </nav>
  );
}
