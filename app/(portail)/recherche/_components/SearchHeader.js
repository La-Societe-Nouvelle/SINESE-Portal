"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, Button } from "react-bootstrap";
import { Search, Building2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { suggestLegalUnits } from "@/actions/search";

const DEBOUNCE_MS = 600;
const MIN_CHARS = 3;

export default function SearchHeader({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef(null);
  const debounceRef  = useRef(null);
  const requestIdRef = useRef(0);

  // Keep input in sync when URL changes externally (e.g. reset from sidebar)
  useEffect(() => {
    setQuery(searchParams.get("s") || "");
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (query.trim().length < MIN_CHARS) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      const startedAt = performance.now();
      const results = await suggestLegalUnits(query);
      const elapsed = Math.round(performance.now() - startedAt);
      console.log(`[SearchHeader] suggest("${query}") -> ${results.length} results in ${elapsed}ms (server action round-trip)`);
      if (requestId === requestIdRef.current) {
        setSuggestions(results);
        setShowSuggestions(true);
        setActiveIndex(-1);
      } else {
        console.log(`[SearchHeader] discarded stale response for "${query}"`);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const goToCompany = useCallback((siren) => {
    setShowSuggestions(false);
    router.push(`/entreprise/${siren}`);
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams(searchParams);
    if (query.trim()) params.set("s", query.trim());
    else params.delete("s");
    params.delete("p");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      goToCompany(suggestions[activeIndex].siren);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="row justify-content-center text-center">
      <div className="col-lg-8">
        <h2 className="h3 text-white mb-3">Rechercher l'empreinte sociétale des entreprises</h2>

        <Form onSubmit={handleSubmit} className="search-form">
          <div className="position-relative" ref={containerRef}>
            <Form.Control
              type="text"
              placeholder="Nom d'entreprise ou N° SIREN"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoFocus
              className="border-0 shadow-sm py-2 px-3"
              style={{
                fontSize: '1rem',
                borderRadius: '0.5rem',
                paddingRight: '180px'
              }}
            />
            <Button
              variant="secondary"
              type="submit"
              className="position-absolute top-50 end-0 translate-middle-y border-0"
              style={{
                fontSize: '0.875rem',
                borderRadius: '0 0.5rem 0.5rem 0',
                right: '0px'
              }}
            >
              <Search size={16} className="me-1" />
              Rechercher une entreprise
            </Button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions text-start shadow-sm">
                {suggestions.map((s, i) => (
                  <button
                    type="button"
                    key={s.siren}
                    className={`search-suggestion-item ${i === activeIndex ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goToCompany(s.siren)}
                  >
                    <Building2 size={16} className="text-muted flex-shrink-0" />
                    <span className="search-suggestion-text">
                      <span className="search-suggestion-name fw-medium text-dark">
                        {s.denomination}
                        {s.codePostal && <span className="text-muted fw-normal"> ({s.codePostal})</span>}
                      </span>
                      {s.activitePrincipaleLibelle && (
                        <span className="text-muted ms-2">{s.activitePrincipaleLibelle}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
