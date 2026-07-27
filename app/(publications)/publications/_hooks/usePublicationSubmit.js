import { useEffect, useCallback } from "react";
import { addPublication, addReport } from "@/actions/publications";
import { uploadDocumentsToOVH } from "../_components/forms/DocumentUploadForm";
import { usePublicationFormContext } from "../_context/PublicationFormContext";
import { validateStep } from "../_utils/validation";
import { getErrorMessage } from "@/_libs/errors";

export default function usePublicationSubmit() {
  const ctx = usePublicationFormContext();
  const {
    selectedLegalUnit, selectedYear, showDetailPeriod, periodStart, periodEnd,
    declarationData, reportType, uploadMode, reportDocuments, externalUrl,
    hasIndicators, hasReport, errors,
    currentStep, currentStepIndex, steps,
    reportId, setReportId,
    setLoading, setSuccess, setErrors, setDraftSavedNotification,
    saveDraftRef,
  } = ctx;

  const saveDraft = useCallback(async () => {
    if (currentStepIndex === steps.length - 1) return;
    const year = selectedYear || (periodEnd ? new Date(periodEnd).getFullYear() : undefined);
    if (selectedLegalUnit && selectedLegalUnit.id && year) {
      try {
        const result = await addPublication({
          legalUnit: selectedLegalUnit,
          declarationData,
          documents: [],
          year,
          periodStart: showDetailPeriod ? periodStart : null,
          periodEnd: showDetailPeriod ? periodEnd : null,
          status: "draft",
        });

        if (result.error) throw new Error(getErrorMessage(result));

        let reportSaveOk = true;
        if (reportType && uploadMode === "url" && externalUrl.trim()) {
          const reportResult = await addReport({
            reportId: reportId || undefined,
            publicationId: result.publicationId,
            type: reportType,
            fileUrl: externalUrl.trim(),
            storageType: "external",
          });
          if (reportResult.error) {
            reportSaveOk = false;
            console.error("Erreur lors de la sauvegarde du rapport :", getErrorMessage(reportResult));
          } else {
            setReportId(reportResult.reportId);
          }
        }

        if (reportSaveOk) {
          setDraftSavedNotification(true);
          setTimeout(() => setDraftSavedNotification(false), 3000);
        }
      } catch (e) {
        console.error("Erreur lors de l'enregistrement du brouillon :", e);
      }
    }
  }, [currentStepIndex, steps.length, selectedYear, periodEnd, selectedLegalUnit, declarationData, showDetailPeriod, periodStart, reportType, uploadMode, externalUrl, reportId, setReportId, setDraftSavedNotification]);

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

      const year = selectedYear || (periodEnd ? new Date(periodEnd).getFullYear() : new Date().getFullYear());

      // Upload documents OVH si nécessaire (avant création publication)
      let uploadedDocuments = [];
      if (hasReport && uploadMode === "file" && reportDocuments.length > 0) {
        if (!reportDocuments[0].url) {
          uploadedDocuments = await uploadDocumentsToOVH(reportDocuments, selectedLegalUnit.siren);
        } else {
          uploadedDocuments = reportDocuments;
        }
      }

      const publicationResult = await addPublication({
        legalUnit: selectedLegalUnit,
        declarationData: hasIndicators ? declarationData : {},
        documents: hasIndicators && uploadedDocuments.length > 0 ? uploadedDocuments : [],
        year,
        periodStart: showDetailPeriod ? periodStart : null,
        periodEnd: showDetailPeriod ? periodEnd : null,
        status: "pending",
      });

      if (publicationResult.error) throw new Error(getErrorMessage(publicationResult));
      const publicationId = publicationResult.publicationId;

      // ÉTAPE 2: Si rapport, le soumettre avec publication_id
      if (hasReport) {
        let fileUrl, fileName, fileSize, mimeType, storageType;

        if (uploadMode === "file" && uploadedDocuments.length > 0) {
          const doc = uploadedDocuments[0];
          fileUrl = doc.url;
          fileName = doc.name;
          fileSize = doc.size;
          mimeType = doc.type;
          storageType = "ovh";
        } else {
          fileUrl = externalUrl.trim();
          storageType = "external";
        }

        const reportResult = await addReport({
          reportId: reportId || undefined,
          publicationId,
          type: reportType,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          storageType,
        });
        if (reportResult.error) throw new Error(getErrorMessage(reportResult));
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
