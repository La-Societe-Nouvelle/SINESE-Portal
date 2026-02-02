"use client";
import { Accordion, Badge, ButtonGroup, Button } from "react-bootstrap";
import IndicatorForm from "./IndicatorForm";
import { useState, useMemo } from "react";
import indicators from "./../../_lib/indicators.json";
import { isIndicatorComplete, isIndicatorInvalid } from "../../_utils";
import { AlertCircle, CheckCircle2, Filter, Search, HelpCircle, ChevronDown } from "lucide-react";

const FILTER_OPTIONS = [
  { key: "all", label: "Tous" },
  { key: "completed", label: "Complétés" },
  { key: "in_progress", label: "En cours" },
  { key: "empty", label: "Non déclarés" },
];

export default function IndicatorsForm({ data = {}, onChange, categories, errors }) {
  // Filtre selon une ou plusieurs catégories
  const items = Object.entries(indicators)
    .filter(([_, val]) => (Array.isArray(categories) ? categories.includes(val.category) : val.category === categories))
    .map(([key, val]) => ({ ...val, name: key }));

  const openKeys = items
    .map((indicator, idx) => {
      const hasValue = data[indicator.name]?.value !== undefined && data[indicator.name]?.value !== "";
      return hasValue ? String(idx) : null;
    })
    .filter((k) => k !== null);

  const [activeKey, setActiveKey] = useState(openKeys);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Compute completion stats
  const stats = useMemo(() => {
    const completed = items.filter((ind) => isIndicatorComplete(ind, data)).length;
    const inProgress = items.filter((ind) => {
      const d = data[ind.name];
      return d && (d.value !== undefined && d.value !== "") && !isIndicatorComplete(ind, data);
    }).length;
    const empty = items.length - completed - inProgress;
    return { completed, inProgress, empty, total: items.length };
  }, [items, data]);

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items;

    if (filter === "completed") {
      result = result.filter((ind) => isIndicatorComplete(ind, data));
    } else if (filter === "in_progress") {
      result = result.filter((ind) => {
        const d = data[ind.name];
        return d && (d.value !== undefined && d.value !== "") && !isIndicatorComplete(ind, data);
      });
    } else if (filter === "empty") {
      result = result.filter((ind) => {
        const d = data[ind.name];
        return !d || d.value === undefined || d.value === "";
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((ind) => ind.libelle.toLowerCase().includes(q));
    }

    return result;
  }, [items, data, filter, searchQuery]);

  // Map filtered items back to original indices for accordion keys
  const getOriginalIndex = (indicator) => items.findIndex((i) => i.name === indicator.name);

  const groupedItems = useMemo(() => {
    if (!Array.isArray(categories)) {
      return [{ category: null, items: filteredItems }];
    }

    return categories
      .map((category) => ({
        category,
        items: filteredItems.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredItems, categories]);

  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div>
      {/* Filter and search toolbar */}
      <div className="indicators-toolbar">
        <div className="indicators-toolbar-filters">
          <ButtonGroup size="sm" className="indicators-filter-group">
            {FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.key}
                variant={filter === opt.key ? "primary" : "outline-light"}
                className={filter === opt.key ? "active" : "text-primary"}
                onClick={() => setFilter(opt.key)}
              >
                {opt.label}
                {opt.key === "all" && (
                  <Badge bg="secondary" className="ms-1">{stats.total}</Badge>
                )}
                {opt.key === "completed" && stats.completed > 0 && (
                  <Badge bg="success" className="ms-1">{stats.completed}</Badge>
                )}
                {opt.key === "in_progress" && stats.inProgress > 0 && (
                  <Badge bg="warning" className="ms-1">{stats.inProgress}</Badge>
                )}
                {opt.key === "empty" && stats.empty > 0 && (
                  <Badge bg="secondary" className="ms-1">{stats.empty}</Badge>
                )}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div className="indicators-search">
          <Search size={16} className="indicators-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un indicateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="indicators-search-input"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="indicators-empty-filter">
          <Filter size={20} className="mb-2 text-muted" />
          <p className="text-muted mb-0">Aucun indicateur ne correspond à ce filtre.</p>
        </div>
      ) : (
        <Accordion activeKey={activeKey} onSelect={setActiveKey} alwaysOpen className="indicators-accordion">
          {groupedItems.map((group) => {
            const groupKey = group.category || "all";
            const groupColor = group.items[0]?.color || "#dee2e6";
            const isCollapsed = group.category ? !!collapsedCategories[group.category] : false;

            return (
              <div key={groupKey} className="indicator-category-group">
                {group.category && (
                  <button
                    type="button"
                    className="indicator-category-header"
                    onClick={() => toggleCategory(group.category)}
                    style={{ borderLeftColor: groupColor }}
                    aria-expanded={!isCollapsed}
                  >
                    <div className="indicator-category-title">{group.category}</div>
                    <div className="indicator-category-actions">
                      <div className="indicator-category-count">{group.items.length} indicateurs</div>
                      <ChevronDown size={18} className={`category-chevron ${isCollapsed ? "collapsed" : ""}`} />
                    </div>
                  </button>
                )}
                <div className={`indicator-category-body ${isCollapsed ? "collapsed" : ""}`} style={{ borderLeftColor: groupColor }}>
                  {group.items.map((indicator) => {
                const idx = getOriginalIndex(indicator);
                const complete = isIndicatorComplete(indicator, data);
                const invalid = isIndicatorInvalid(indicator, data);
                const hasValue = data[indicator.name]?.value !== undefined && data[indicator.name]?.value !== "";
                const inProgress = hasValue && !complete;
                const statusLabel = complete ? "Complété" : inProgress ? "En cours" : "Non déclaré";
                const statusClass = complete ? "success" : inProgress ? "warning" : "muted";

                return (
                  <Accordion.Item
                    eventKey={String(idx)}
                    key={indicator.name}
                    className="indicator-item"
                  >
                    <Accordion.Header className="indicator-header">
                      <div className="indicator-header-content">
                        <div className="indicator-label-wrapper">
                          <span className="indicator-label">{indicator.libelle}</span>
                          <span className="indicator-unit">{indicator.unit && `[${indicator.unit}]`}</span>
                          {invalid && errors && (errors.formEmpreinte || errors.formExtraIndic) && (
                            <span className="status-icon error" title="Indicateur incomplet ou invalide">
                              <AlertCircle size={18} />
                            </span>
                          )}
                          {complete && (
                            <span className="status-icon success" title="Complété">
                              <CheckCircle2 size={18} />
                            </span>
                          )}
                        </div>
                        <div className="indicator-status-icons">
                          <span className={`indicator-status-pill ${statusClass}`}>{statusLabel}</span>
                          {indicator.docUrl && (
                            <a
                              href={indicator.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="indicator-doc-quick"
                              onClick={(e) => e.stopPropagation()}
                              title="Voir la documentation"
                            >
                              <HelpCircle size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <IndicatorForm
                        name={indicator.name}
                        unit={indicator.unit}
                        url={indicator.docUrl}
                        category={indicator.category}
                        nbDecimals={indicator.nbDecimals}
                        data={data}
                        onChange={onChange}
                      />
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
                </div>
              </div>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
