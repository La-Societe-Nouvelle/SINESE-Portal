"use client";

import React, { useState, useMemo } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { Search, X } from "lucide-react";
import { getDisplayLabel } from "../_utils/labels";

export default function MacroSidebarSelector({
  icon,
  title,
  items = [],
  selected,
  defaultCode,
  onSelect,
  isOpen = false,
  onClose = () => {},
  isMobile = false,
  ariaLabel,
  searchable = true,
  searchPlaceholder = "Rechercher...",
  multiSelect = false,
  maxSelect = 1,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // La valeur par défaut est toujours affichée en premier
  const orderedItems = useMemo(() => {
    if (!defaultCode) return items;
    const defaultItem = items.find((item) => item.code === defaultCode);
    if (!defaultItem) return items;
    return [defaultItem, ...items.filter((item) => item.code !== defaultCode)];
  }, [items, defaultCode]);

  const filteredItems = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return orderedItems;
    const q = searchQuery.toLowerCase();
    return orderedItems.filter((item) => `${item.code} ${item.label}`.toLowerCase().includes(q));
  }, [orderedItems, searchQuery, searchable]);

  const selectedCodes = multiSelect ? (Array.isArray(selected) ? selected : [selected]) : [selected];

  const handleSelect = (code) => {
    if (!multiSelect) {
      onSelect(code);
      if (!isMobile) onClose();
      return;
    }

    const isSelected = selectedCodes.includes(code);
    if (isSelected) {
      // On garde toujours au moins un élément sélectionné
      if (selectedCodes.length === 1) return;
      onSelect(selectedCodes.filter((c) => c !== code));
    } else {
      if (selectedCodes.length >= maxSelect) return;
      onSelect([...selectedCodes, code]);
    }
  };

  const List = (
    <div className="macro-sidebar-selector-list flex-grow-1 overflow-auto" style={{ height: isMobile ? "auto" : "calc(100vh - 180px)" }}>
      {multiSelect && (
        <div className="px-3 py-2 text-muted small">
          {selectedCodes.length}/{maxSelect} sélectionné(s)
        </div>
      )}
      {filteredItems.map((item) => {
        const isChecked = selectedCodes.includes(item.code);
        const isDisabled = multiSelect && !isChecked && selectedCodes.length >= maxSelect;
        return (
          <div key={item.code} className="px-3 py-1">
            <Form.Check
              type="checkbox"
              id={`macro-${title}-${item.code}`}
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => handleSelect(item.code)}
              label={
                <span>
                  {getDisplayLabel(item.code, item.label)}
                  {item.code === defaultCode && <span className="text-muted"> (par défaut)</span>}
                </span>
              }
              className="mb-0 form-check-sm"
            />
          </div>
        );
      })}

      {filteredItems.length === 0 && (
        <div className="text-center py-5 text-muted">
          <Search size={48} className="mb-3 opacity-50" />
          <p>Aucun résultat pour "{searchQuery}"</p>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    if (items.length === 0) return null;
    return (
      <div className="macro-selector-mobile">
        {searchable && (
          <InputGroup size="sm" className="mb-2">
            <Form.Control
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroup.Text>
              <Search size={14} />
            </InputGroup.Text>
          </InputGroup>
        )}
        {List}
      </div>
    );
  }

  if (!isOpen || items.length === 0) return null;

  return (
    <div
      className="macro-sidebar-selector position-fixed top-0 end-0 h-100 bg-white border-start shadow-lg"
      style={{ width: "400px", zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
    >
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold d-flex align-items-center">
            {icon}
            <span className="ms-2">{title}</span>
          </h6>
          <Button variant="link" size="sm" onClick={onClose} className="p-1" aria-label="Fermer">
            <X size={18} />
          </Button>
        </div>

        {searchable && (
          <InputGroup size="sm">
            <Form.Control
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroup.Text>
              <Search size={14} />
            </InputGroup.Text>
          </InputGroup>
        )}
      </div>

      {List}
    </div>
  );
}
