"use client";

import { useState, useMemo } from "react";
import CustomSelect from "./CustomSelect";
import nafData from "@/_libs/naf_rev_2.json";

export default function NafSelector({ 
  selectedCodes = [], 
  onChange = () => {}, 
  placeholder = "Recherchez par secteur d'activité...",
  className = "",
  instanceId = "naf-selector"
}) {
  // Créer une liste plate d'options pour la recherche simple
  const allOptions = useMemo(() => {
    const options = [];
    
    Object.entries(nafData).forEach(([sectionName, codes]) => {
      codes.forEach(item => {
        options.push({
          value: item.code,
          label: item.libelle,
          code: item.code,
          section: sectionName,
          searchText: `${item.code} ${item.libelle} ${sectionName}`.toLowerCase()
        });
      });
    });
    
    // Trier par code NAF
    return options.sort((a, b) => a.code.localeCompare(b.code));
  }, []);

  // Convertir les codes sélectionnés en options React Select
  const selectedOptions = useMemo(() => {
    return allOptions.filter(option => selectedCodes.includes(option.value));
  }, [selectedCodes, allOptions]);

  // Gérer les changements de sélection
  const handleChange = (selectedOptions) => {
    const codes = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange(codes);
  };

  // Formater les options pour l'affichage
  const formatOptionLabel = (option) => (
    <div className="d-flex align-items-start">
      <code className="text-primary me-2 flex-shrink-0" style={{ 
        fontSize: '0.8rem', 
        fontWeight: 'bold',
        minWidth: '60px'
      }}>
        {option.code}
      </code>
      <div className="flex-grow-1">
        <div style={{ fontSize: '0.875rem', lineHeight: '1.2' }}>
          {option.label}
        </div>
        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
          {option.section}
        </small>
      </div>
    </div>
  );

  // Filtrer les options selon la recherche
  const filterOption = (option, inputValue) => {
    if (!inputValue) return true;
    return option.data.searchText.includes(inputValue.toLowerCase());
  };

  // Styles personnalisés simples
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      padding: '8px 12px',
      backgroundColor: state.isSelected 
        ? '#0d6efd'
        : state.isFocused 
          ? '#f8f9fa'
          : 'white',
      color: state.isSelected ? 'white' : '#333',
      borderBottom: '1px solid #f0f0f0'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#0d6efd',
      borderRadius: '0.25rem',
      fontSize: '0.75rem'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
      fontWeight: '600',
      fontFamily: 'monospace'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white'
      }
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '300px'
    })
  };

  return (
    <div className={`naf-selector ${className}`}>
      <CustomSelect
        instanceId={instanceId}
        isMulti={true}
        options={allOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        isSearchable={true}
        isClearable={true}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        size="small"
        variant="primary"
        formatOptionLabel={formatOptionLabel}
        filterOption={filterOption}
        styles={customStyles}
        menuPlacement="auto"
        noOptionsMessage={({ inputValue }) => 
          inputValue 
            ? `Aucune activité trouvée pour "${inputValue}"`
            : "Tapez pour rechercher une activité"
        }
        loadingMessage={() => "Chargement des activités..."}
      />
    </div>
  );
}