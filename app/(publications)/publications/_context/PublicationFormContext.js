"use client";
import { createContext, useContext, useReducer, useMemo, useRef, useEffect, useCallback } from "react";
import { isEqual } from "lodash";
import indicators from "../_lib/indicators.json";
import { validateStep } from "../_utils/validation";
import usePublicationSteps from "../_hooks/usePublicationSteps";

// ── Actions ──────────────────────────────────────────────────────────
const ACTIONS = {
  SET_LEGAL_UNIT: "SET_LEGAL_UNIT",
  SET_YEAR: "SET_YEAR",
  SET_SHOW_DETAIL_PERIOD: "SET_SHOW_DETAIL_PERIOD",
  SET_PERIOD_START: "SET_PERIOD_START",
  SET_PERIOD_END: "SET_PERIOD_END",
  UPDATE_DECLARATION_DATA: "UPDATE_DECLARATION_DATA",
  SET_REPORT_TYPE: "SET_REPORT_TYPE",
  SET_UPLOAD_MODE: "SET_UPLOAD_MODE",
  SET_REPORT_DOCUMENTS: "SET_REPORT_DOCUMENTS",
  SET_EXTERNAL_URL: "SET_EXTERNAL_URL",
  SET_REPORT_ID: "SET_REPORT_ID",
  SET_ERRORS: "SET_ERRORS",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_LOADING: "SET_LOADING",
  SET_SUCCESS: "SET_SUCCESS",
  SET_CONFIRMATION_CHECKED: "SET_CONFIRMATION_CHECKED",
  SET_DRAFT_SAVED_NOTIFICATION: "SET_DRAFT_SAVED_NOTIFICATION",
  SET_USER_INTERACTED: "SET_USER_INTERACTED",
};

// ── Reducer ──────────────────────────────────────────────────────────
function publicationFormReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LEGAL_UNIT:
      return { ...state, selectedLegalUnit: action.payload };
    case ACTIONS.SET_YEAR:
      return { ...state, selectedYear: action.payload };
    case ACTIONS.SET_SHOW_DETAIL_PERIOD:
      return { ...state, showDetailPeriod: action.payload };
    case ACTIONS.SET_PERIOD_START:
      return { ...state, periodStart: action.payload };
    case ACTIONS.SET_PERIOD_END:
      return { ...state, periodEnd: action.payload };
    case ACTIONS.UPDATE_DECLARATION_DATA:
      return { ...state, declarationData: { ...state.declarationData, ...action.payload } };
    case ACTIONS.SET_REPORT_TYPE:
      return { ...state, reportType: action.payload };
    case ACTIONS.SET_UPLOAD_MODE:
      return { ...state, uploadMode: action.payload };
    case ACTIONS.SET_REPORT_DOCUMENTS:
      return { ...state, reportDocuments: action.payload };
    case ACTIONS.SET_EXTERNAL_URL:
      return { ...state, externalUrl: action.payload };
    case ACTIONS.SET_REPORT_ID:
      return { ...state, reportId: action.payload };
    case ACTIONS.SET_ERRORS:
      return { ...state, errors: action.payload };
    case ACTIONS.CLEAR_ERROR: {
      const errors = { ...state.errors };
      delete errors[action.payload];
      return { ...state, errors };
    }
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_SUCCESS:
      return { ...state, success: action.payload };
    case ACTIONS.SET_CONFIRMATION_CHECKED:
      return { ...state, confirmationChecked: action.payload };
    case ACTIONS.SET_DRAFT_SAVED_NOTIFICATION:
      return { ...state, draftSavedNotification: action.payload };
    case ACTIONS.SET_USER_INTERACTED:
      return { ...state, userInteracted: action.payload };
    default:
      return state;
  }
}

// ── Initial state factory ────────────────────────────────────────────
function createInitialState(initialData) {
  return {
    selectedLegalUnit: initialData.legalUnit || "",
    selectedYear: initialData.year || "",
    showDetailPeriod: (() => {
      const start = initialData.period_start;
      const end = initialData.period_end;
      // Vérifier null, undefined, string "null", ou string vide
      if (!start || !end || start === "null" || end === "null") return false;
      const year = initialData.year;
      if (!year) return true;
      // Convertir en format ISO (YYYY-MM-DD) pour comparer
      const startStr = start instanceof Date ? start.toISOString().split("T")[0] : String(start).split("T")[0];
      const endStr = end instanceof Date ? end.toISOString().split("T")[0] : String(end).split("T")[0];
      if (startStr === `${year}-01-01` && endStr === `${year}-12-31`) return false;
      return true;
    })(),
    periodStart: (initialData.period_start && initialData.period_start !== "null") ? initialData.period_start : "",
    periodEnd: (initialData.period_end && initialData.period_end !== "null") ? initialData.period_end : "",
    declarationData: initialData.data || {},
    reportType: initialData.report_type || "",
    uploadMode: initialData.external_url ? "url" : "file",
    reportDocuments: initialData.documents || [],
    externalUrl: initialData.external_url || "",
    reportId: initialData.report_id || null,
    errors: {},
    warnings: {},
    loading: false,
    success: false,
    confirmationChecked: false,
    draftSavedNotification: false,
    userInteracted: false,
  };
}

// ── Context ─────────────────────────────────────────────────────────
const PublicationFormContext = createContext(null);

export function usePublicationFormContext() {
  const ctx = useContext(PublicationFormContext);
  if (!ctx) {
    throw new Error("usePublicationFormContext must be used within a PublicationFormProvider");
  }
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────
export function PublicationFormProvider({ initialData = {}, mode = "create", isLegalUnitPreselected = false, children }) {
  const [state, dispatch] = useReducer(publicationFormReducer, initialData, createInitialState);
  const stepNav = usePublicationSteps();

  // ── Derived state ──────────────────────────────────────────────────
  const hasIndicators = useMemo(
    () =>
      Object.values(state.declarationData).some(
        (ind) => ind && ind.value !== undefined && ind.value !== ""
      ),
    [state.declarationData]
  );

  const hasReport = useMemo(
    () =>
      state.reportType &&
      ((state.uploadMode === "file" && state.reportDocuments.length > 0) ||
        (state.uploadMode === "url" && state.externalUrl.trim())),
    [state.reportType, state.uploadMode, state.reportDocuments, state.externalUrl]
  );

  const indicatorCounts = useMemo(() => {
    const completedEse = Object.entries(state.declarationData).filter(([key, ind]) => {
      const meta = indicators[key];
      return (
        meta &&
        meta.category !== "Indicateurs supplémentaires" &&
        ind && ind.value !== undefined && ind.value !== "" &&
        ind.uncertainty !== undefined && ind.uncertainty !== ""
      );
    }).length;

    const completedSupplementary = Object.entries(state.declarationData).filter(([key, ind]) => {
      const meta = indicators[key];
      return (
        meta &&
        meta.category === "Indicateurs supplémentaires" &&
        ind && ind.value !== undefined && ind.value !== ""
      );
    }).length;

    const totalEse = Object.values(indicators).filter(
      (ind) => ind.category !== "Indicateurs supplémentaires"
    ).length;

    const totalSupplementary = Object.values(indicators).filter(
      (ind) => ind.category === "Indicateurs supplémentaires"
    ).length;

    return { completedEse, completedSupplementary, totalEse, totalSupplementary };
  }, [state.declarationData]);

  // ── Convenience dispatchers ────────────────────────────────────────
  const setSelectedLegalUnit = useCallback((v) => dispatch({ type: ACTIONS.SET_LEGAL_UNIT, payload: v }), []);
  const setSelectedYear = useCallback((v) => dispatch({ type: ACTIONS.SET_YEAR, payload: v }), []);
  const setShowDetailPeriod = useCallback((v) => dispatch({ type: ACTIONS.SET_SHOW_DETAIL_PERIOD, payload: v }), []);
  const setPeriodStart = useCallback((v) => dispatch({ type: ACTIONS.SET_PERIOD_START, payload: v }), []);
  const setPeriodEnd = useCallback((v) => dispatch({ type: ACTIONS.SET_PERIOD_END, payload: v }), []);
  const updateDeclarationData = useCallback((v) => dispatch({ type: ACTIONS.UPDATE_DECLARATION_DATA, payload: v }), []);
  const setReportType = useCallback((v) => dispatch({ type: ACTIONS.SET_REPORT_TYPE, payload: v }), []);
  const setUploadMode = useCallback((v) => dispatch({ type: ACTIONS.SET_UPLOAD_MODE, payload: v }), []);
  const setReportDocuments = useCallback((v) => dispatch({ type: ACTIONS.SET_REPORT_DOCUMENTS, payload: v }), []);
  const setExternalUrl = useCallback((v) => dispatch({ type: ACTIONS.SET_EXTERNAL_URL, payload: v }), []);
  const setReportId = useCallback((v) => dispatch({ type: ACTIONS.SET_REPORT_ID, payload: v }), []);
  const setErrors = useCallback((v) => {
    if (typeof v === "function") {
      dispatch({ type: ACTIONS.SET_ERRORS, payload: v });
    } else {
      dispatch({ type: ACTIONS.SET_ERRORS, payload: v });
    }
  }, []);
  const clearError = useCallback((key) => dispatch({ type: ACTIONS.CLEAR_ERROR, payload: key }), []);
  const setLoading = useCallback((v) => dispatch({ type: ACTIONS.SET_LOADING, payload: v }), []);
  const setSuccess = useCallback((v) => dispatch({ type: ACTIONS.SET_SUCCESS, payload: v }), []);
  const setConfirmationChecked = useCallback((v) => dispatch({ type: ACTIONS.SET_CONFIRMATION_CHECKED, payload: v }), []);
  const setDraftSavedNotification = useCallback((v) => dispatch({ type: ACTIONS.SET_DRAFT_SAVED_NOTIFICATION, payload: v }), []);
  const setUserInteracted = useCallback((v) => dispatch({ type: ACTIONS.SET_USER_INTERACTED, payload: v }), []);

  // ── Validation effect ──────────────────────────────────────────────
  useEffect(() => {
    const errorMsg = validateStep(stepNav.currentStep, state, { hasIndicators, hasReport });
    if (state.userInteracted && errorMsg) {
      dispatch({ type: ACTIONS.SET_ERRORS, payload: { ...state.errors, [stepNav.currentStep]: errorMsg } });
    } else if (!errorMsg && state.errors[stepNav.currentStep]) {
      const updated = { ...state.errors };
      delete updated[stepNav.currentStep];
      dispatch({ type: ACTIONS.SET_ERRORS, payload: updated });
    }
  }, [
    state.declarationData, state.selectedLegalUnit, state.selectedYear,
    state.periodStart, state.periodEnd, state.confirmationChecked,
    stepNav.currentStep, state.reportType, state.uploadMode,
    state.reportDocuments, state.externalUrl, state.showDetailPeriod,
    state.userInteracted, hasIndicators, hasReport,
  ]);

  // ── Reset userInteracted on step change ────────────────────────────
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_USER_INTERACTED, payload: false });
    setTimeout(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, 50);
  }, [stepNav.currentStep]);

  // ── Auto-save draft ────────────────────────────────────────────────
  const lastDraft = useRef({
    declarationData: state.declarationData,
    selectedLegalUnit: state.selectedLegalUnit,
    periodStart: state.periodStart,
    periodEnd: state.periodEnd,
    reportType: state.reportType,
    externalUrl: state.externalUrl,
    step: stepNav.currentStep,
  });

  // saveDraft is defined in usePublicationSubmit and injected via ref
  const saveDraftRef = useRef(null);

  useEffect(() => {
    const errorMsg = validateStep(stepNav.currentStep, state, { hasIndicators, hasReport });
    if (!errorMsg && !state.errors[stepNav.currentStep]) {
      const hasChanged =
        !isEqual(state.declarationData, lastDraft.current.declarationData) ||
        !isEqual(state.selectedLegalUnit, lastDraft.current.selectedLegalUnit) ||
        state.periodStart !== lastDraft.current.periodStart ||
        state.periodEnd !== lastDraft.current.periodEnd ||
        state.reportType !== lastDraft.current.reportType ||
        state.externalUrl !== lastDraft.current.externalUrl ||
        stepNav.currentStep !== lastDraft.current.step;

      if (hasChanged && (hasIndicators || hasReport) && saveDraftRef.current) {
        saveDraftRef.current();
        lastDraft.current = {
          declarationData: state.declarationData,
          selectedLegalUnit: state.selectedLegalUnit,
          periodStart: state.periodStart,
          periodEnd: state.periodEnd,
          reportType: state.reportType,
          externalUrl: state.externalUrl,
          step: stepNav.currentStep,
        };
      }
    }
  }, [state.declarationData, state.selectedLegalUnit, state.periodStart, state.periodEnd, state.reportType, state.externalUrl, stepNav.currentStep, state.errors, hasIndicators, hasReport]);

  const value = useMemo(
    () => ({
      // State
      ...state,
      // Derived
      hasIndicators,
      hasReport,
      indicatorCounts,
      // Step navigation
      ...stepNav,
      // Setters
      setSelectedLegalUnit,
      setSelectedYear,
      setShowDetailPeriod,
      setPeriodStart,
      setPeriodEnd,
      updateDeclarationData,
      setReportType,
      setUploadMode,
      setReportDocuments,
      setExternalUrl,
      setReportId,
      setErrors,
      clearError,
      setLoading,
      setSuccess,
      setConfirmationChecked,
      setDraftSavedNotification,
      setUserInteracted,
      // Props
      mode,
      isLegalUnitPreselected,
      // Refs
      saveDraftRef,
      dispatch,
    }),
    [state, hasIndicators, hasReport, indicatorCounts, stepNav, mode, isLegalUnitPreselected]
  );

  return (
    <PublicationFormContext.Provider value={value}>
      {children}
    </PublicationFormContext.Provider>
  );
}
