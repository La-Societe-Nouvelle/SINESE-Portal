import { validatePeriod, validateEmpreinte, validateExtraIndic } from "./index";

/**
 * Validates a specific step of the publication form.
 *
 * @param {string} stepKey - The step key to validate
 * @param {object} state - The full form state
 * @param {object} derived - Derived booleans { hasIndicators, hasReport }
 * @returns {string|null} Error message or null if valid
 */
export function validateStep(stepKey, state, { hasIndicators, hasReport }) {
  switch (stepKey) {
    case "formEntreprise":
      if (!state.selectedLegalUnit) return "Veuillez sélectionner une entreprise.";
      if (!state.selectedYear) return "Veuillez sélectionner une année.";
      return null;

    case "formIndicateurs": {
      if (!hasIndicators) return null;
      if (state.showDetailPeriod) {
        const periodError = validatePeriod(state.periodStart, state.periodEnd);
        if (periodError) return periodError;
      }
      const empreinteError = validateEmpreinte(state.declarationData);
      if (empreinteError) return empreinteError;
      return validateExtraIndic(state.declarationData);
    }

    case "formRapport":
      if (!state.reportType && state.reportDocuments.length === 0 && !state.externalUrl.trim()) return null;
      if (!state.reportType) return "Veuillez sélectionner un type de rapport (RSE, CSRD, ESG, VSME...).";
      if (state.uploadMode === "file" && state.reportDocuments.length === 0) {
        return "Veuillez déposer au moins un fichier (formats acceptés : PDF, DOC, DOCX).";
      }
      if (state.uploadMode === "url" && !state.externalUrl.trim()) {
        return "Veuillez renseigner l'URL complète du rapport (ex: https://exemple.com/rapport.pdf).";
      }
      if (state.uploadMode === "url") {
        try { new URL(state.externalUrl.trim()); } catch { return "L'URL fournie n'est pas valide. Vérifiez qu'elle commence par https:// ou http://."; }
      }
      return null;

    case "formRecap":
      if (!hasIndicators && !hasReport) {
        return "Au moins une section doit être remplie : publiez des indicateurs (étape 2) et/ou un rapport de durabilité (étape 3).";
      }
      if (!state.confirmationChecked) return "Veuillez cocher la case de certification pour confirmer l'exactitude des informations.";
      return null;

    default:
      return null;
  }
}
