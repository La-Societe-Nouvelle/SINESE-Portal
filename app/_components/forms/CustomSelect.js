import Select from 'react-select'

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Sélectionnez...",
  isMulti = false,
  isSearchable = true,
  instanceId, // Nouveau prop pour éviter l'hydratation
  isClearable = false,
  hideGlobalClear = true, // Masquer le bouton clear global pour les multi-select
  size = "default", // "small", "default", "large"
  variant = "default", // "default", "success", "warning", "error"
  className = "",
  ...props
}) => {

  
  // Classes CSS basées sur les props
  const getClassName = () => {
    let classes = "react-select-container";
    
    if (isMulti) classes += " react-select-multi";
    if (size !== "default") classes += ` react-select-${size}`;
    if (variant !== "default") classes += ` react-select-${variant}`;
    if (className) classes += ` ${className}`;
    
    return classes;
  };

  // Styles personnalisés pour gérer les textes longs uniquement
  const customStyles = {
    multiValueLabel: (provided) => ({
      ...provided,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: "160px"
    }),
    multiValue: (provided) => ({
      ...provided,
      maxWidth: "200px"
    })
  };

 

  return (
    <Select
      instanceId={instanceId}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isMulti={isMulti}
      isSearchable={isSearchable}
      isClearable={isMulti ? !hideGlobalClear && isClearable : isClearable}
      closeMenuOnSelect={!isMulti}
      hideSelectedOptions={false}
      classNamePrefix="react-select"
      className={getClassName()}
      styles={customStyles}
      noOptionsMessage={() => "Aucune option trouvée"}
      {...props}
    />
  );
};

export default CustomSelect;