"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Form } from "react-bootstrap";
import { CalendarDays, Building2, FileType2, FileStack, RotateCcw, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { REPORT_TYPES } from "@/_libs/report-types";
import { REPORT_FORMAT_LABELS } from "@/_libs/report-format";
import DivisionSidebarSelector from "./DivisionSidebarSelector";
import { parseReportFiltersFromParams, parseReportSort, reportFiltersToSearchParams, hasAnyReportFilter } from "../_utils/reportParams";

const FORMAT_OPTIONS = Object.entries(REPORT_FORMAT_LABELS).map(([value, label]) => ({ value, label }));
const TYPE_OPTIONS = REPORT_TYPES.map((t) => ({ value: t.value, label: t.label }));

const FilterPill = ({ icon, label, count, active, onClick, ariaExpanded }) => (
  <button
    type="button"
    className={`filter-pill ${active ? "is-active" : ""}`}
    onClick={onClick}
    aria-expanded={ariaExpanded}
    aria-haspopup="true"
    title={label}
  >
    {icon}
    <span>{label}</span>
    {count > 0 && <span className="filter-pill-count">{count}</span>}
    <ChevronDown size={14} className="filter-pill-chevron" aria-hidden="true" />
  </button>
);

export default function ReportsFilterBar({ availableYears }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef(null);

  const filters = parseReportFiltersFromParams(searchParams);
  const { sort, dir } = parseReportSort(searchParams);

  const [openPanel, setOpenPanel] = useState(null); // 'annees' | 'secteurs' | 'formats' | 'types' | null

  const closePanel = useCallback(() => setOpenPanel(null), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openPanel && barRef.current && !barRef.current.contains(event.target)) {
        if (!event.target.closest(".position-fixed")) {
          closePanel();
        }
      }
    };
    const handleEscape = (e) => { if (e.key === "Escape") closePanel(); };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openPanel, closePanel]);

  const yearOptions = availableYears.map((year) => ({ value: String(year), label: String(year) }));

  const updateFilter = (key, selected) => {
    const params = reportFiltersToSearchParams({ ...filters, [key]: selected }, sort, dir, searchParams);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    closePanel();
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = hasAnyReportFilter(filters);

  return (
    <nav className="macro-filter-bar" ref={barRef} aria-label="Filtres des rapports">
      <div className="macro-filter-bar-intro">
        <span className="intro-icon" aria-hidden="true"><SlidersHorizontal size={18} /></span>
        <span className="intro-label">Filtrer les rapports</span>
      </div>

      <div className="filter-pills-bar">
        <div className="filter-pill-dropdown-wrapper">
          <FilterPill
            icon={<CalendarDays size={14} />}
            label="Année"
            count={filters.annees.length}
            active={filters.annees.length > 0}
            ariaExpanded={openPanel === "annees"}
            onClick={() => setOpenPanel(openPanel === "annees" ? null : "annees")}
          />
          {openPanel === "annees" && (
            <div className="filter-pill-dropdown">
              <div className="d-flex flex-wrap gap-2">
                {yearOptions.map(({ value, label }) => (
                  <Form.Check
                    key={value}
                    type="checkbox"
                    id={`filter-year-${value}`}
                    label={label}
                    checked={filters.annees.includes(value)}
                    onChange={() => {
                      const next = filters.annees.includes(value)
                        ? filters.annees.filter((v) => v !== value)
                        : [...filters.annees, value];
                      updateFilter("annees", next);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <FilterPill
          icon={<Building2 size={14} />}
          label="Secteur"
          count={filters.secteurs.length}
          active={filters.secteurs.length > 0}
          ariaExpanded={openPanel === "secteurs"}
          onClick={() => setOpenPanel(openPanel === "secteurs" ? null : "secteurs")}
        />

        <div className="filter-pill-dropdown-wrapper">
          <FilterPill
            icon={<FileType2 size={14} />}
            label="Format"
            count={filters.formats.length}
            active={filters.formats.length > 0}
            ariaExpanded={openPanel === "formats"}
            onClick={() => setOpenPanel(openPanel === "formats" ? null : "formats")}
          />
          {openPanel === "formats" && (
            <div className="filter-pill-dropdown">
              <div className="d-flex flex-wrap gap-2">
                {FORMAT_OPTIONS.map(({ value, label }) => (
                  <Form.Check
                    key={value}
                    type="checkbox"
                    id={`filter-format-${value}`}
                    label={label}
                    checked={filters.formats.includes(value)}
                    onChange={() => {
                      const next = filters.formats.includes(value)
                        ? filters.formats.filter((v) => v !== value)
                        : [...filters.formats, value];
                      updateFilter("formats", next);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="filter-pill-dropdown-wrapper">
          <FilterPill
            icon={<FileStack size={14} />}
            label="Type de rapport"
            count={filters.types.length}
            active={filters.types.length > 0}
            ariaExpanded={openPanel === "types"}
            onClick={() => setOpenPanel(openPanel === "types" ? null : "types")}
          />
          {openPanel === "types" && (
            <div className="filter-pill-dropdown">
              {TYPE_OPTIONS.map(({ value, label }) => (
                <Form.Check
                  key={value}
                  type="checkbox"
                  id={`filter-type-${value}`}
                  label={label}
                  checked={filters.types.includes(value)}
                  onChange={() => {
                    const next = filters.types.includes(value)
                      ? filters.types.filter((v) => v !== value)
                      : [...filters.types, value];
                    updateFilter("types", next);
                  }}
                  className="mb-2"
                />
              ))}
            </div>
          )}
        </div>

        <div className="filter-pills-spacer" />

        {hasActiveFilters && (
          <button type="button" className="filter-pill filter-pill-reset" onClick={resetFilters}>
            <RotateCcw size={14} aria-hidden="true" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      <DivisionSidebarSelector
        selectedSecteurs={filters.secteurs}
        onChange={(selected) => updateFilter("secteurs", selected)}
        isOpen={openPanel === "secteurs"}
        onToggle={closePanel}
      />
    </nav>
  );
}
