"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { parseFiltersFromParams, filtersToSearchParams, hasAnyFilter } from "../_utils/searchParams";

// Recherche pilotée côté client (même architecture que l'ancien système via
// l'API, qui n'a jamais gelé) : les changements de filtres/page/texte font un
// fetch annulable vers /api/portail/search, sans navigation App Router.
// L'URL reste partageable via history.replaceState/pushState, et popstate
// gère le back/forward navigateur.

const SearchContext = createContext(null);

const FILTER_DEBOUNCE_MS = 250;
const DEFAULT_PER_PAGE = 20;

function parsePage(raw) {
  const p = parseInt(raw, 10);
  return Number.isInteger(p) ? Math.max(1, p) : 1;
}

function isSearchable(query, filters) {
  return query.length > 2 || hasAnyFilter(filters);
}

export function SearchProvider({ initialParams, children }) {
  const pathname = usePathname();

  const [query, setQuery]     = useState(initialParams.s || "");
  const [filters, setFilters] = useState(() => parseFiltersFromParams(initialParams));
  const [page, setPage]       = useState(() => parsePage(initialParams.p));

  // results === null : aucune recherche aboutie encore (état initial)
  const [results, setResults] = useState(null);
  const [total, setTotal]     = useState(0);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [loading, setLoading] = useState(() => isSearchable(initialParams.s || "", parseFiltersFromParams(initialParams)));
  const [error, setError]     = useState(false);

  const abortRef    = useRef(null);
  const debounceRef = useRef(null);

  const runSearch = useCallback(async (q, f, p) => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!isSearchable(q, f)) {
      setResults(null);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(false);

    try {
      const params = filtersToSearchParams(f, new URLSearchParams());
      if (q) params.set("s", q);
      if (p > 1) params.set("p", String(p));
      const res = await fetch(`/api/portail/search?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.legalUnits);
      setTotal(data.total);
      setPerPage(data.perPage || DEFAULT_PER_PAGE);
      setLoading(false);
    } catch (e) {
      // Une requête annulée a toujours une remplaçante en vol (ou plus de
      // critères) : ne pas toucher à loading/error, la suivante s'en charge.
      if (e.name === "AbortError") return;
      setError(true);
      setLoading(false);
    }
  }, []);

  const syncUrl = useCallback((q, f, p, { push = false } = {}) => {
    const params = filtersToSearchParams(f, new URLSearchParams(window.location.search));
    if (q) params.set("s", q); else params.delete("s");
    if (p > 1) params.set("p", String(p)); else params.delete("p");
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }, [pathname]);

  // Cocher plusieurs cases vite ne déclenche qu'un fetch (debounce), et le
  // fetch précédent est de toute façon annulé par le suivant.
  const updateFilter = useCallback((key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setPage(1);
    syncUrl(query, updated, 1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query, updated, 1), FILTER_DEBOUNCE_MS);
  }, [filters, query, runSearch, syncUrl]);

  const resetFilters = useCallback(() => {
    const cleared = parseFiltersFromParams(new URLSearchParams());
    setFilters(cleared);
    setQuery("");
    setPage(1);
    syncUrl("", cleared, 1);
    runSearch("", cleared, 1);
  }, [runSearch, syncUrl]);

  const goToPage = useCallback((p) => {
    setPage(p);
    syncUrl(query, filters, p);
    runSearch(query, filters, p);
  }, [query, filters, runSearch, syncUrl]);

  const submitQuery = useCallback((q) => {
    setQuery(q);
    setPage(1);
    // pushState : une nouvelle recherche texte crée une entrée d'historique,
    // comme le faisait le router.push d'avant.
    syncUrl(q, filters, 1, { push: true });
    runSearch(q, filters, 1);
  }, [filters, runSearch, syncUrl]);

  // Recherche initiale (arrivée avec des params dans l'URL) + back/forward.
  useEffect(() => {
    runSearch(query, filters, page);

    const onPopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get("s") || "";
      const f = parseFiltersFromParams(sp);
      const p = parsePage(sp.get("p"));
      setQuery(q);
      setFilters(f);
      setPage(p);
      runSearch(q, f, p);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      abortRef.current?.abort();
      clearTimeout(debounceRef.current);
    };
    // Volontairement au montage uniquement : les recherches suivantes sont
    // déclenchées explicitement par les actions ci-dessus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    query,
    filters,
    page,
    results,
    total,
    perPage,
    loading,
    error,
    hasSearch: isSearchable(query, filters),
    updateFilter,
    resetFilters,
    goToPage,
    submitQuery,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return ctx;
}
