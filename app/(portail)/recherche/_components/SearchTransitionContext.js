"use client";

import { createContext, useContext, useTransition } from "react";
import { SearchResultsSkeleton } from "./LoadingSkeleton";

const SearchTransitionContext = createContext(null);

// Shares a single useTransition across the filters sidebar and pagination,
// so filter/page changes update the URL without re-suspending the results
// (old results stay visible, dimmed, until the new ones stream in).
export function SearchTransitionProvider({ children }) {
  const [isPending, startTransition] = useTransition();

  return (
    <SearchTransitionContext.Provider value={{ isPending, startTransition }}>
      {children}
    </SearchTransitionContext.Provider>
  );
}

export function useSearchTransition() {
  const ctx = useContext(SearchTransitionContext);
  if (!ctx) {
    throw new Error("useSearchTransition must be used within a SearchTransitionProvider");
  }
  return ctx;
}

// Replaces its children with a skeleton while a filter/pagination transition
// is pending — used only around the results column, not the sidebar.
export function ResultsPendingOverlay({ children }) {
  const { isPending } = useSearchTransition();
  if (isPending) {
    return <SearchResultsSkeleton count={5} />;
  }
  return <>{children}</>;
}
