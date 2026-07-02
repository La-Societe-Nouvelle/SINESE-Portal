"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import MacroSidebarSelector from "./MacroSidebarSelector";

export default function AggregateSelector({ metadata, selected, onSelect, isOpen = false, onClose = () => {}, isMobile = false }) {
  return (
    <MacroSidebarSelector
      icon={<BarChart3 size={18} />}
      title="Agrégat économique"
      ariaLabel="Sélectionner un agrégat économique"
      searchPlaceholder="Rechercher un agrégat..."
      items={metadata || []}
      selected={selected}
      defaultCode="PRD"
      searchable={false}
      onSelect={onSelect}
      isOpen={isOpen}
      onClose={onClose}
      isMobile={isMobile}
    />
  );
}
