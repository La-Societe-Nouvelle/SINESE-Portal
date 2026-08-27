"use client";

import React from "react";
import { Factory } from "lucide-react";
import MacroSidebarSelector from "./MacroSidebarSelector";

export default function IndustrySelector({ metadata, selected, onSelect, isOpen = false, onClose = () => {}, isMobile = false }) {
  return (
    <MacroSidebarSelector
      icon={<Factory size={18} />}
      title="Secteur d'activité"
      ariaLabel="Sélectionner un secteur d'activité"
      searchPlaceholder="Rechercher un secteur..."
      items={metadata || []}
      selected={selected}
      defaultCode="TOTAL"
      onSelect={onSelect}
      isOpen={isOpen}
      onClose={onClose}
      isMobile={isMobile}
    />
  );
}
