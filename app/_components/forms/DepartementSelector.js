"use client";

import { useMemo } from "react";
import CustomSelect from "./CustomSelect";
import departementsData from "@/_libs/departements-region.json";

export default function DepartementSelector({ 
  selectedDepartements = [], 
  onChange = () => {}, 
  placeholder = "Sélectionnez des départements...",
  className = "",
  instanceId = "departement-selector",
  isMulti = true
}) {
  // Grouper les départements par région
  const groupedOptions = useMemo(() => {
    // Créer un objet pour grouper par région
    const regionGroups = {};
    
    departementsData.forEach(dept => {
      if (!regionGroups[dept.region_name]) {
        regionGroups[dept.region_name] = [];
      }
      
      regionGroups[dept.region_name].push({
        value: dept.num_dep,
        label: `${dept.num_dep} - ${dept.dep_name}`,
        code: dept.num_dep,
        name: dept.dep_name,
        region: dept.region_name,
        searchText: `${dept.num_dep} ${dept.dep_name} ${dept.region_name}`.toLowerCase()
      });
    });
    
    // Convertir en format React Select avec tri
    return Object.entries(regionGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([regionName, departements]) => ({
        label: regionName,
        options: departements.sort((a, b) => a.code.toString().localeCompare(b.code.toString()))
      }));
  }, []);

  // Options plates pour la sélection simple
  const flatOptions = useMemo(() => {
    return groupedOptions.flatMap(group => group.options);
  }, [groupedOptions]);

  // Convertir les valeurs sélectionnées en options
  const selectedOptions = useMemo(() => {
    if (!isMulti) {
      return flatOptions.find(option => option.value === selectedDepartements) || null;
    }
    return flatOptions.filter(option => selectedDepartements.includes(option.value));
  }, [selectedDepartements, flatOptions, isMulti]);

  // Gérer les changements de sélection
  const handleChange = (selectedOptions) => {
    if (!isMulti) {
      onChange(selectedOptions ? selectedOptions.value : null);
    } else {
      const codes = selectedOptions ? selectedOptions.map(option => option.value) : [];
      onChange(codes);
    }
  };

  // Formater les options pour l'affichage
  const formatOptionLabel = (option) => (
    <div className="d-flex align-items-center">
      <span className="badge bg-secondary me-2" style={{ fontSize: '0.7rem', minWidth: '30px' }}>
        {option.code}
      </span>
      <div className="flex-grow-1">
        <div style={{ fontSize: '0.875rem' }}>
          {option.name}
        </div>
        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
          {option.region}
        </small>
      </div>
    </div>
  );

  // Filtrer les options selon la recherche
  const filterOption = (option, inputValue) => {
    if (!inputValue) return true;
    return option.data.searchText.includes(inputValue.toLowerCase());
  };

  // Styles personnalisés
  const customStyles = {
    groupHeading: (provided) => ({
      ...provided,
      backgroundColor: '#f8f9fa',
      color: '#0d6efd',
      fontWeight: 'bold',
      fontSize: '0.85rem',
      padding: '8px 12px',
      borderBottom: '1px solid #dee2e6',
      textTransform: 'none'
    }),
    group: (provided) => ({
      ...provided,
      paddingTop: 0,
      paddingBottom: 4
    }),
    option: (provided, state) => ({
      ...provided,
      padding: '8px 12px',
      backgroundColor: state.isSelected 
        ? '#0d6efd'
        : state.isFocused 
          ? '#f8f9fa'
          : 'white',
      color: state.isSelected ? 'white' : '#333',
      borderBottom: '1px solid #f5f5f5'
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
      fontWeight: '600'
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
      maxHeight: '350px'
    })
  };

  return (
    <div className={`departement-selector ${className}`}>
      <CustomSelect
        instanceId={instanceId}
        isMulti={isMulti}
        options={groupedOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        isSearchable={true}
        isClearable={true}
        closeMenuOnSelect={!isMulti}
        hideSelectedOptions={false}
        size="small"
        variant="primary"
        formatOptionLabel={formatOptionLabel}
        filterOption={filterOption}
        styles={customStyles}
        menuPlacement="auto"
        noOptionsMessage={({ inputValue }) => 
          inputValue 
            ? `Aucun département trouvé pour "${inputValue}"`
            : "Tapez pour rechercher un département"
        }
        loadingMessage={() => "Chargement des départements..."}
      />
    </div>
  );
}