"use client";

import React, { useState } from 'react';
import { Form, Button, Offcanvas } from 'react-bootstrap';
import Select from 'react-select';
import { SlidersHorizontal, Factory, Globe, BarChart3, RotateCcw } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function MacroSidebar({ metadata, className = "" }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [showMobile, setShowMobile] = useState(false);

  const selectedValues = {
    industry:  searchParams.get('industry')  || 'TOTAL',
    country:   searchParams.get('country')   || 'FRA',
    aggregate: searchParams.get('aggregate') || 'PRD',
  };

  const handleChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    router.replace(pathname, { scroll: false });
  };

  const filters = [
    {
      key: 'industry',
      label: 'Secteur d\'activité',
      icon: <Factory size={16} />,
      searchable: true
    },
    {
      key: 'country',
      label: 'Pays',
      icon: <Globe size={16} />,
      searchable: false
    },
    {
      key: 'aggregate',
      label: 'Agrégat économique',
      icon: <BarChart3 size={16} />,
      searchable: false
    }
  ];

  // Configuration pour react-select
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: '1px solid rgba(59, 77, 143, 0.15)',
      borderRadius: '0.5rem',
      backgroundColor: '#fafbfc',
      fontSize: '0.85rem',
      minHeight: '38px',
      boxShadow: state.isFocused ? '0 0 0 0.15rem rgba(231, 76, 90, 0.15)' : 'none',
      borderColor: state.isFocused ? '#e74c5a' : 'rgba(59, 77, 143, 0.15)',
      '&:hover': {
        borderColor: state.isFocused ? '#e74c5a' : 'rgba(59, 77, 143, 0.25)',
        backgroundColor: '#fff'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '0.85rem',
      backgroundColor: state.isSelected 
        ? '#e74c5a' 
        : state.isFocused 
        ? '#f7f8fc' 
        : 'white',
      color: state.isSelected ? 'white' : '#3b4d8f',
      '&:hover': {
        backgroundColor: state.isSelected ? '#e74c5a' : '#f7f8fc'
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#64748b',
      fontSize: '0.85rem'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#3b4d8f',
      fontSize: '0.85rem'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      border: '1px solid #e9ecf3',
      boxShadow: '0 4px 12px rgba(59, 77, 143, 0.1)'
    }),
    menuList: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      padding: '0.25rem 0'
    })
  };

  const getOptionsForFilter = (filterKey) => {
    if (!metadata[filterKey]) return [];
    return metadata[filterKey].map(({ code, label }) => ({ value: code, label }));
  };

  const SidebarContent = () => (
    <div className="sidebar-filters">
      {/* Header */}
      <div className="sidebar-header">
        <div className="d-flex align-items-center">
          <div className="sidebar-icon">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="sidebar-title">Filtres</h3>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="sidebar-body">
        <Form>
          {filters.map((filter) => (
            <div key={filter.key} className="filter-group">
              <Form.Label className="filter-label">
                <span className="filter-icon">{filter.icon}</span>
                {filter.label}
              </Form.Label>
              
              <Select
                instanceId={`macro-filter-${filter.key}`}
                value={getOptionsForFilter(filter.key).find(o => o.value === selectedValues[filter.key]) || null}
                onChange={(option) => option && handleChange(filter.key, option.value)}
                options={getOptionsForFilter(filter.key)}
                isSearchable={filter.searchable}
                isClearable={false}
                placeholder={`Sélectionner ${filter.label.toLowerCase()}`}
                noOptionsMessage={() => "Aucune option trouvée"}
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          ))}
        </Form>
      </div>

      {/* Footer avec bouton reset */}
      <div className="sidebar-footer">
        <Button
          variant="link"
          size="sm"
          onClick={handleReset}
          className="reset-button"
        >
          <RotateCcw size={14} className="reset-icon" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );

  return (
    <div className="macro-sidebar">
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
          Filtres d'analyse
        </Button>
      </div>

      {/* Offcanvas Mobile */}
      <Offcanvas
        show={showMobile}
        onHide={() => setShowMobile(false)}
        placement="start"
        className="macro-sidebar-mobile"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            Filtres d'analyse
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}