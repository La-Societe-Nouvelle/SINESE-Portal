import { useEffect, useCallback } from "react";
import { addPublication, addReport } from "@/services/publicationService";
import { uploadDocumentsToOVH } from "../_components/forms/DocumentUploadForm";
import { usePublicationFormContext } from "../_context/PublicationFormContext";
import { validateStep } from "../_utils/validation";

export default function usePublicationSubmit() {
  const ctx = usePublicationFormContext();
  const {
    selectedLegalUnit, selectedYear, showDetailPeriod, periodStart, periodEnd,
    declarationData, reportType, uploadMode, reportDocuments, externalUrl,
    hasIndicators, hasReport, errors,
    currentStep, currentStepIndex, steps,
    setLoading, setSuccess, setErrors, setDraftSavedNotification,
    saveDraftRef,
  } = ctx;

  const saveDraft = useCallback(async () => {
    if (currentStepIndex === steps.length - 1) return;
    const year = selectedYear || (periodEnd ? new Date(periodEnd).getFullYear() : undefined);
    if (selectedLegalUnit && selectedLegalUnit.id && year) {
      try {
        await addPublication({
          legalUnit: selectedLegalUnit,
          declarationData,
          documents: [],
          year,
          periodStart: showDetailPeriod ? periodStart : null,
          periodEnd: showDetailPeriod ? periodEnd : null,
          status: "draft",
        });
        setDraftSavedNotification(true);
        setTimeout(() => setDraftSavedNotification(false), 3000);
      } catch (e) {
        console.error("Erreur lors de l'enregistrement du brouillon :", e);
      }
    }
  }, [currentStepIndex, steps.length, selectedYear, periodEnd, selectedLegalUnit, declarationData, showDetailPeriod, periodStart, setDraftSavedNotification]);

  // Register saveDraft into context ref so auto-save effect can call it
  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft, saveDraftRef]);

  const handleSubmitPublication = useCallback(async () => {
    setLoading(true);
    try {
      const state = {
        selectedLegalUnit, selectedYear, showDetailPeriod, periodStart, periodEnd,
        declarationData, reportType, uploadMode, reportDocuments, externalUrl,
        confirmationChecked: ctx.confirmationChecked,
      };

      const errorMsg = validateStep(currentStep, state, { hasIndicators, hasReport });
      if (errorMsg) {
        setErrors((prev) => ({ ...prev, [currentStep]: errorMsg }));
        setLoading(false);
        return;
      }

      // Submit indicators if filled
      if (hasIndicators) {
        const year = selectedYear || (periodEnd ? new Date(periodEnd).getFullYear() : undefined);

        let uploadedDocuments = reportDocuments;
        if (hasReport && uploadMode === "file" && reportDocuments.length > 0) {
          uploadedDocuments = await uploadDocumentsToOVH(reportDocuments, selectedLegalUnit.siren);
        }

        await addPublication({
          legalUnit: selectedLegalUnit,
          declarationData,
          documents: hasReport && uploadMode === "file" ? uploadedDocuments : [],
          year,
          periodStart: showDetailPeriod ? periodStart : null,
          periodEnd: showDetailPeriod ? periodEnd : null,
          status: "pending",
        });
      }

      // Submit report if filled
      if (hasReport) {
        const year = selectedYear
          ? selectedYear
          : (periodEnd ? new Date(periodEnd).getFullYear() : new Date().getFullYear());

        let fileUrl, fileName, fileSize, mimeType, storageType;

        if (uploadMode === "file" && reportDocuments.length > 0) {
          let uploaded = reportDocuments;
          if (!reportDocuments[0].url) {
            uploaded = await uploadDocumentsToOVH(reportDocuments, selectedLegalUnit.siren);
          }
          const doc = uploaded[0];
          fileUrl = doc.url;
          fileName = doc.name;
          fileSize = doc.size;
          mimeType = doc.type;
          storageType = "ovh";
        } else {
          fileUrl = externalUrl.trim();
          storageType = "external";
        }

        await addReport({
          siren: selectedLegalUnit.siren,
          type: reportType,
          year,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          storageType,
        });
      }

      setSuccess(true);
    } catch (e) {
      console.error("Erreur lors de la soumission:", e);
      setErrors((prev) => ({ ...prev, submit: e.message || "Erreur lors de la soumission" }));
    } finally {
      setLoading(false);
    }
  }, [
    selectedLegalUnit, selectedYear, showDetailPeriod, periodStart, periodEnd,
    declarationData, reportType, uploadMode, reportDocuments, externalUrl,
    hasIndicators, hasReport, currentStep, ctx.confirmationChecked,
    setLoading, setSuccess, setErrors,
  ]);

  return { handleSubmitPublication, saveDraft };
}
