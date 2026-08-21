"use client";

import { ChevronDown } from 'lucide-react';

export default function FilterPill({ icon, label, count, active, onClick, ariaLabel, ariaExpanded }) {
  return (
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
}
