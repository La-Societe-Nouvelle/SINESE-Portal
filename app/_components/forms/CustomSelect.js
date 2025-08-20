import Select from 'react-select'
import { useState, useEffect } from 'react'

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Sélectionnez...",
  isMulti = false,
  isSearchable = true,
  instanceId, // Nouveau prop pour éviter l'hydratation
  isClearable = false,
  size = "default", // "small", "default", "large"
  variant = "default", // "default", "success", "warning", "error"
  className = "",
  ...props
}) => {
  // État pour gérer l'hydratation SSR
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Classes CSS basées sur les props
  const getClassName = () => {
    let classes = "react-select-container";
    
    if (isMulti) classes += " react-select-multi";
    if (size !== "default") classes += ` react-select-${size}`;
    if (variant !== "default") classes += ` react-select-${variant}`;
    if (className) classes += ` ${className}`;
    
    return classes;
  };

  // Styles par défaut
  const defaultStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: size === "small" ? "28px" : size === "large" ? "40px" : "32px",
      fontSize: size === "small" ? "0.8125rem" : size === "large" ? "1rem" : "0.875rem",
      borderColor: state.isFocused 
        ? (variant === "success" ? "#10b981" : 
           variant === "warning" ? "#f59e0b" : 
           variant === "error" ? "#ef4444" : "#758bfd")
        : "#d1d5db",
      boxShadow: state.isFocused 
        ? (variant === "success" ? "0 0 0 3px rgba(16, 185, 129, 0.1)" :
           variant === "warning" ? "0 0 0 3px rgba(245, 158, 11, 0.1)" :
           variant === "error" ? "0 0 0 3px rgba(239, 68, 68, 0.1)" :
           "0 0 0 3px rgba(117, 139, 253, 0.1)")
        : "none",
      "&:hover": {
        borderColor: variant === "success" ? "#10b981" : 
                    variant === "warning" ? "#f59e0b" : 
                    variant === "error" ? "#ef4444" : "#758bfd"
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: variant === "success" ? "#10b981" : 
                      variant === "warning" ? "#f59e0b" : 
                      variant === "error" ? "#ef4444" : "#758bfd",
      borderRadius: "0.25rem"
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "white",
      fontSize: "0.75rem",
      fontWeight: "600"
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "white",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "white"
      }
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: size === "small" ? "0.8125rem" : size === "large" ? "1rem" : "0.875rem",
      backgroundColor: state.isSelected 
        ? (variant === "success" ? "#10b981" : 
           variant === "warning" ? "#f59e0b" : 
           variant === "error" ? "#ef4444" : "#758bfd")
        : state.isFocused 
          ? "rgba(117, 139, 253, 0.1)" 
          : "white",
      color: state.isSelected ? "white" : "#374151",
      padding: size === "small" ? "6px 10px" : size === "large" ? "10px 14px" : "8px 12px"
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: size === "small" ? "0.8125rem" : size === "large" ? "1rem" : "0.875rem",
      color: "#9ca3af"
    })
  };

  // Éviter l'erreur d'hydratation en attendant le montage côté client
  if (!isMounted) {
    return (
      <div 
        className={getClassName()} 
        style={{ 
          minHeight: size === "small" ? "28px" : size === "large" ? "40px" : "32px",
          border: "1px solid #d1d5db",
          borderRadius: "0.375rem",
          padding: "6px 12px",
          backgroundColor: "#fff",
          color: "#9ca3af",
          fontSize: size === "small" ? "0.8125rem" : size === "large" ? "1rem" : "0.875rem"
        }}
      >
        {placeholder}
      </div>
    )
  }

  return (
    <Select
      instanceId={instanceId}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isMulti={isMulti}
      isSearchable={isSearchable}
      isClearable={isClearable}
      closeMenuOnSelect={!isMulti}
      hideSelectedOptions={false}
      classNamePrefix="react-select"
      className={getClassName()}
      styles={defaultStyles}
      noOptionsMessage={() => "Aucune option trouvée"}
      {...props}
    />
  );
};

export default CustomSelect;