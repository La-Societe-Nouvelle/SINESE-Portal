"use client";

import React from "react";
import { Globe } from "lucide-react";
import MacroSidebarSelector from "./MacroSidebarSelector";

export default function CountrySelector({ metadata, selected, onSelect, isOpen = false, onClose = () => {}, isMobile = false }) {
  return (
    <MacroSidebarSelector
      icon={<Globe size={18} />}
      title="Pays"
      ariaLabel="Sélectionner un pays"
      searchPlaceholder="Rechercher un pays..."
      items={metadata || []}
      selected={selected}
      defaultCode="FRA"
      onSelect={onSelect}
      isOpen={isOpen}
      onClose={onClose}
      isMobile={isMobile}
    />
  );
}
