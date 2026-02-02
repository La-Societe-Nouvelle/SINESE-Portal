"use client";
import { addPublication } from "@/services/publicationService";
import { Building, FileText, BarChart3, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button, Modal, Row, Col, Card, ListGroup, ProgressBar } from "react-bootstrap";
import { isEqual } from "lodash";
import { useState, useEffect, useRef } from "react";
import { validateEmpreinte, validateExtraIndic, validatePeriod } from "../../_utils";
import IndicatorsForm from "./IndicatorsForm";
import LegalUnitForm from "./LegalUnitForm";
import DocumentUploadForm, { uploadDocumentsToOVH } from "./DocumentUploadForm";
import RecapForm from "./RecapForm";
import usePublicationSteps from "../../_hooks/usePublicationSteps";

// Mapping de noms Lucide vers les composants
const LUCIDE_ICONS = {
  Building,
  FileText,
  BarChart3,
};

export default function PublicationForm({ initialData = {}, mode = "create", isLegalUnitPreselected = false }) {
  // Initialize period dates from initialData only
  const getInitialPeriodStart = () => {
    return initialData.period_start || "";
  };

  const getInitialPeriodEnd = () => {
    return initialData.period_end || "";
  };

  const [selectedLegalUnit, setSelectedLegalUnit] = useState(initialData.legalUnit || "");
  const [periodStart, setPeriodStart] = useState(getInitialPeriodStart());
  const [periodEnd, setPeriodEnd] = useState(getInitialPeriodEnd());
  const [declarationData, setDeclarationData] = useState(initialData.data || {});
  const [documents, setDocuments] = useState(initialData.documents || []);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const { steps, currentStep, setCurrentStep, currentStepIndex, goToNextStep, goToPrevStep } = usePublicationSteps();

  // Référence pour stocker le dernier brouillon
  const lastDraft = useRef({
    declarationData,
    documents,
    selectedLegalUnit,
    periodStart,
    periodEnd,
    confirmationChecked,
    step: currentStep,
  });

  // Validation
  function validateStep(stepKey) {
    switch (stepKey) {
      case "formEntreprise":
        if (!selectedLegalUnit) return "Veuillez sélectionner une entreprise.";
        const periodError = validatePeriod(periodStart, periodEnd);
        if (periodError) return periodError;
        return null;
      case "formEmpreinte":
        return validateEmpreinte(declarationData);
      case "formExtraIndic":
        return validateExtraIndic(declarationData);
      case "formDocuments":
        // Les documents sont optionnels, pas d'erreur de validation
        return null;
      case "formRecap":
        if (!confirmationChecked) return "Veuillez confirmer la déclaration.";
        return null;
      default:
        return null;
    }
  }

  useEffect(() => {
    const errorMsg = validateStep(currentStep);

    // TOUJOURS mettre à jour l'erreur pour éviter le cache
    setErrors((prev) => {
      if (errorMsg) {
        return { ...prev, [currentStep]: errorMsg };
      } else {
        const updated = { ...prev };
        delete updated[currentStep];
        return updated;
      }
    });
  }, [declarationData, documents, selectedLegalUnit, periodStart, periodEnd, confirmationChecked, currentStep]);

  // Effet séparé pour la sauvegarde automatique
  useEffect(() => {
    const errorMsg = validateStep(currentStep);

    // Sauvegarder le brouillon si aucune erreur
    if (!errorMsg && !errors[currentStep]) {
      const hasChanged =
        !isEqual(declarationData, lastDraft.current.declarationData) ||
        !isEqual(documents, lastDraft.current.documents) ||
        !isEqual(selectedLegalUnit, lastDraft.current.selectedLegalUnit) ||
        periodStart !== lastDraft.current.periodStart ||
        periodEnd !== lastDraft.current.periodEnd ||
        confirmationChecked !== lastDraft.current.confirmationChecked ||
        currentStep !== lastDraft.current.step;

      if (hasChanged) {
        saveDraft();
        lastDraft.current = {
          declarationData,
          documents,
          selectedLegalUnit,
          periodStart,
          periodEnd,
          step: currentStep,
        };
      }
    }
  }, [declarationData, documents, selectedLegalUnit, periodStart, periodEnd, confirmationChecked, currentStep, errors]);

  useEffect(() => {
    // Ajoute un délai pour laisser le DOM se mettre à jour
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, [currentStep]);

  async function handleNextStep() {
    const errorMsg = validateStep(currentStep);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [currentStep]: errorMsg }));
      return;
    }
    // Also check if there are existing errors in the errors state (from child components)
    if (errors[currentStep]) {
      return;
    }
    goToNextStep();
  }

  function handlePrevStep() {
    const errorMsg = validateStep(currentStep);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [currentStep]: errorMsg }));
    }
    goToPrevStep();
  }

  function handleStepChange(targetStep) {
    if (targetStep === currentStep) return;
    const errorMsg = validateStep(currentStep);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [currentStep]: errorMsg }));
    }
    // Also check if there are existing errors in the errors state (from child components)
    if (errors[currentStep]) {
      return;
    }

    setCurrentStep(targetStep);
  }

  async function saveDraft() {
    if (currentStepIndex === steps.length - 1) return;

    const year = periodEnd ? new Date(periodEnd).getFullYear() : undefined;

    if (selectedLegalUnit && selectedLegalUnit.id && year) {
      // Check published indicators only on formEntreprise step
      if (currentStep === "formEntreprise") {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.sinese.fr';
          const res = await fetch(
            `${apiUrl}/v2/legalunitfootprint/${selectedLegalUnit.siren}`
          );
          if (res.ok) {
            const data = await res.json();
            const footprint = data.data?.footprint || {};

            // Count indicators with flag "p" (published) for the selected year
            const publishedIndicatorCount = Object.values(footprint).filter(
              (indicator) => indicator?.flag === "p" && Number(indicator?.year) === year
            ).length;

            // If all 12 ESE indicators are already published for this year, don't allow new declaration
            if (publishedIndicatorCount === 12) {
              setErrors((prev) => ({
                ...prev,
                formEntreprise:
                  `Tous les indicateurs ESE ont déjà été publiés pour l'année ${year} pour cette entreprise. Aucune nouvelle déclaration n'est possible.`,
              }));
              return;
            }
          }
        } catch (e) {
          console.error("Erreur lors de la vérification des indicateurs publiés:", e);
          // Continue with save even if API call fails
        }
      }

      try {
        await addPublication({
          legalUnit: selectedLegalUnit,
          declarationData,
          documents,
          year,
          periodStart,
          periodEnd,
          status: "draft",
        });
      } catch (e) {
        console.error("Erreur lors de l'enregistrement du brouillon :", e);
      }
    }
  }

  async function handleSubmitPublication() {
    setLoading(true);
    try {
      const errorMsg = validateStep(currentStep);
      if (errorMsg) {
        setErrors((prev) => ({ ...prev, [currentStep]: errorMsg }));
        setLoading(false);
        return;
      }

      // Uploader les documents avant de soumettre la publication
      let uploadedDocuments = documents;
      if (documents.length > 0) {
        uploadedDocuments = await uploadDocumentsToOVH(documents, selectedLegalUnit.siren);
      }

      await addPublication({
        legalUnit: selectedLegalUnit,
        declarationData,
        documents: uploadedDocuments,
        year: periodEnd ? new Date(periodEnd).getFullYear() : undefined,
        periodStart,
        periodEnd,
        status: "pending",
      });
      setSuccess(true);
    } catch (e) {
      console.error("Erreur lors de la soumission:", e);
      setErrors((prev) => ({ ...prev, submit: e.message || "Erreur lors de la soumission" }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="publication-page">
      <div className="container">
        <Card className="publication-form-card border-0">
          <Card.Body>
            <h3 className="main-title">
              {mode === "edit" ? "Modifier la publication" : "Nouvelle demande de publication"}
            </h3>

            <Row className="g-4">
              <ProgressSidebar
                steps={steps}
                currentStep={currentStep}
                currentStepIndex={currentStepIndex}
                handleStepChange={handleStepChange}
                errors={errors}
              />
              <Col className="col-lg-9">
                <div className="form-section-header">
                  <h3>
                    {steps[currentStepIndex].icon &&
                      (() => {
                        const IconComponent = LUCIDE_ICONS[steps[currentStepIndex].icon];
                        return IconComponent ? <IconComponent size={20} className="me-2" style={{ display: 'inline' }} /> : null;
                      })()
                    }
                    {steps[currentStepIndex].label}
                  </h3>
                  <div className="text-muted">
                    {currentStep === "formEntreprise" &&
                      "Sélectionnez ou ajoutez une entreprise pour commencer votre déclaration."}
                    {currentStep === "formEmpreinte" &&
                      "Complétez les indicateurs de l'empreinte sociétale qui seront publiés sur SINESE."}
                    {currentStep === "formExtraIndic" &&
                      "Ajoutez ici des indicateurs complémentaires déjà déclarés auprès d'organismes publics pour enrichir vos données accessibles sur SINESE."}
                    {currentStep === "formDocuments" &&
                      "Joignez votre rapport RSE/ESG (PDF ou XBRL). Il sera publié avec votre empreinte sociétale sur SINESE."}
                    {currentStep === "formRecap" && "Vérifiez et validez votre demande de publication."}
                  </div>
                </div>

                {/* Forms by step */}
                {currentStep === "formEntreprise" && (
                  <LegalUnitForm
                    selectedLegalUnit={selectedLegalUnit}
                    setSelectedLegalUnit={setSelectedLegalUnit}
                    periodStart={periodStart}
                    setPeriodStart={setPeriodStart}
                    periodEnd={periodEnd}
                    setPeriodEnd={setPeriodEnd}
                    mode={mode}
                    setErrors={setErrors}
                    isLegalUnitPreselected={isLegalUnitPreselected}
                  />
                )}
                {currentStep === "formEmpreinte" && (
                  <IndicatorsForm
                    data={declarationData || {}}
                    categories={["Création de la valeur", "Empreinte sociale", "Empreinte environnementale"]}
                    onChange={(data) => setDeclarationData((d) => ({ ...d, ...data }))}
                    errors={errors}
                  />
                )}
                {currentStep === "formExtraIndic" && (
                  <IndicatorsForm
                    data={declarationData || {}}
                    categories="Indicateurs supplémentaires"
                    onChange={(data) => setDeclarationData((d) => ({ ...d, ...data }))}
                    errors={errors}
                  />
                )}
                {currentStep === "formDocuments" && (
                  <DocumentUploadForm
                    documents={documents}
                    onChange={setDocuments}
                    selectedLegalUnit={selectedLegalUnit}
                  />
                )}
                {currentStep === "formRecap" && (
                  <RecapForm
                    legalUnit={selectedLegalUnit}
                    declarationData={declarationData}
                    documents={documents}
                    setConfirmationChecked={setConfirmationChecked}
                    confirmationChecked={confirmationChecked}
                    periodEnd={periodEnd}
                  />
                )}

                {/* Error message for current step */}
                {errors[currentStep] && (
                  <div className="alert alert-danger mt-4 mb-4">
                    <AlertTriangle size={18} className="me-2" style={{ display: 'inline' }} />
                    <div>{errors[currentStep]}</div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="form-actions">
                  {currentStepIndex > 0 && (
                    <Button variant="light" onClick={handlePrevStep}>
                      <ChevronLeft size={16} className="me-1" style={{ display: 'inline' }} /> Précédent
                    </Button>
                  )}
                  <Button
                    variant={currentStepIndex === steps.length - 1 ? "secondary" : "primary"}
                    disabled={loading || !!errors[currentStep]}
                    onClick={() => {
                      if (currentStepIndex === steps.length - 1) {
                        handleSubmitPublication();
                      } else {
                        handleNextStep();
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Envoi en cours...
                      </>
                    ) : currentStepIndex === 0 && mode !== "edit" ? (
                      <>
                        Commencer <ChevronRight size={16} className="ms-1" style={{ display: 'inline' }} />
                      </>
                    ) : currentStepIndex === steps.length - 1 ? (
                      <>
                        <CheckCircle size={16} className="me-1" style={{ display: 'inline' }} /> Envoyer la demande
                      </>
                    ) : (
                      <>
                        Suivant <ChevronRight size={16} className="ms-1" style={{ display: 'inline' }} />
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
      <PublicationModalSuccess show={success} onHide={() => setSuccess(false)} />
    </div>
  );
}

function ProgressSidebar({ steps, currentStep, currentStepIndex, handleStepChange, errors }) {
  return (
    <Col md={3} className="progress-sidebar">
      <ListGroup variant="flush" className="mb-3">
        {steps.map((step, idx) => {
          const hasError = !!errors[step.key];
          const isActive = currentStep === step.key;
          const IconComponent = step.icon ? LUCIDE_ICONS[step.icon] : null;

          if (step.parent) {
            return (
              <ListGroup.Item
                key={step.key}
                action
                active={isActive}
                onClick={() => handleStepChange(step.key)}
                className="ps-4 d-flex align-items-center"
              >
                <span className="me-2"></span>
                <span className="flex-grow-1">{step.label}</span>
                {hasError && <AlertTriangle size={16} className="text-danger" title="Erreur sur cette étape" />}
              </ListGroup.Item>
            );
          }

          return (
            <ListGroup.Item
              key={step.key}
              action
              active={isActive}
              onClick={() => handleStepChange(step.key)}
              className={`d-flex align-items-center ${isActive ? "active" : ""}`}
              disabled={step.disabled}
            >
              {IconComponent && <IconComponent size={18} className="me-2" />}
              <span className="flex-grow-1">{step.label}</span>
              {hasError && (
                <AlertTriangle size={16} className="text-danger" title="Erreur sur cette étape" />
              )}
            </ListGroup.Item>
          );
        })}
      </ListGroup>

      <ProgressBar
        now={((currentStepIndex + 1) / steps.length) * 100}
        className="mt-2"
      />
    </Col>
  );
}

function PublicationModalSuccess({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>

      <Modal.Body className="text-center py-5 px-4">
        <div className="mb-4">
          <CheckCircle size={24} className="text-success" />
        </div>
        <h5 className="fw-bold mb-2">Demande de publication envoyée !</h5>
        <p className="text-muted mb-4">
          Votre demande a bien été reçue. Vous serez notifié par email dès que votre publication sera validée.
        </p>

        <a
          href="/publications/espace/gestion"
          className="btn btn-primary"
          onClick={onHide}
        >
          Voir mes demandes de publication
        </a>
      </Modal.Body>
    </Modal>
  );
}
