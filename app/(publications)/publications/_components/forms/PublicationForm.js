"use client";
import { AlertTriangle, Info, Save } from "lucide-react";
import { Row, Col, Card } from "react-bootstrap";
import { PublicationFormProvider, usePublicationFormContext } from "../../_context/PublicationFormContext";
import usePublicationSubmit from "../../_hooks/usePublicationSubmit";
import { validateStep } from "../../_utils/validation";
import IndicatorsForm from "./IndicatorsForm";
import LegalUnitForm from "./LegalUnitForm";
import ProgressSidebar from "./ProgressSidebar";
import ReportForm from "./ReportForm";
import RecapForm from "./RecapForm";
import PublicationModalSuccess from "../PublicationModalSuccess";
import StepHeader from "./StepHeader";
import NavigationButtons from "./NavigationButtons";

export default function PublicationForm({ initialData = {}, mode = "create", isLegalUnitPreselected = false }) {
  return (
    <PublicationFormProvider initialData={initialData} mode={mode} isLegalUnitPreselected={isLegalUnitPreselected}>
      <PublicationFormContent />
    </PublicationFormProvider>
  );
}

function PublicationFormContent() {
  const ctx = usePublicationFormContext();
  const {
    steps, currentStep, currentStepIndex,
    errors, warnings, loading, success, userInteracted,
    draftSavedNotification, setSuccess,
    hasIndicators, hasReport,
    setUserInteracted, setErrors, goToNextStep, goToPrevStep, setCurrentStep,
    mode,
    // For IndicatorsForm
    declarationData, updateDeclarationData,
  } = ctx;

  const { handleSubmitPublication } = usePublicationSubmit();

  function handleNextStep() {
    setUserInteracted(true);
    const errorMsg = validateStep(currentStep, ctx, { hasIndicators, hasReport });
    if (errorMsg) {
      setErrors({ ...errors, [currentStep]: errorMsg });
      return;
    }
    if (errors[currentStep]) return;
    goToNextStep();
  }

  function handlePrevStep() {
    const errorMsg = validateStep(currentStep, ctx, { hasIndicators, hasReport });
    if (errorMsg) {
      setErrors({ ...errors, [currentStep]: errorMsg });
    }
    goToPrevStep();
  }

  function handleStepChange(targetStep) {
    if (targetStep === currentStep) return;
    const errorMsg = validateStep(currentStep, ctx, { hasIndicators, hasReport });
    if (errorMsg) {
      setErrors({ ...errors, [currentStep]: errorMsg });
    }
    if (errors[currentStep]) return;
    setCurrentStep(targetStep);
  }

  return (
    <div className="publication-page">
      <div className="container">
        <Card className="publication-form-card border-0">
          <Card.Body>
            <h3 className="main-title">
              <span className="me-2">Formulaire de publication</span>
            </h3>

            <Row className="g-4">
              <ProgressSidebar onStepChange={handleStepChange} />
              <Col className="col-lg-9">
                {/* Auto-save notification */}
                {draftSavedNotification && (
                  <div className="draft-saved-toast">
                    <Save size={14} style={{ display: "inline" }} />
                    Brouillon sauvegardé
                  </div>
                )}

                <StepHeader />

                {/* Step: Entreprise */}
                {currentStep === "formEntreprise" && <LegalUnitForm />}

                {/* Step: Indicateurs */}
                {currentStep === "formIndicateurs" && (
                  <div>
                    <h5 className="mb-3">Empreinte sociétale</h5>
                    <IndicatorsForm
                      data={declarationData || {}}
                      categories={["Création de la valeur", "Empreinte sociale", "Empreinte environnementale"]}
                      onChange={(data) => updateDeclarationData(data)}
                      errors={errors}
                    />
                    <h5 className="mt-4 mb-3">Indicateurs supplémentaires</h5>
                    <p className="text-muted small">
                      Indicateurs complémentaires déjà déclarés auprès d'organismes publics.
                    </p>
                    <IndicatorsForm
                      data={declarationData || {}}
                      categories="Indicateurs supplémentaires"
                      onChange={(data) => updateDeclarationData(data)}
                      errors={errors}
                    />
                  </div>
                )}

                {/* Step: Rapport */}
                {currentStep === "formRapport" && <ReportForm />}

                {/* Step: Récapitulatif */}
                {currentStep === "formRecap" && <RecapForm />}

                {/* Warning for optional steps */}
                {warnings[currentStep] && !errors[currentStep] && (
                  <div className="alert alert-warning mt-4 mb-4">
                    <Info size={18} className="me-2" style={{ display: 'inline', flexShrink: 0 }} />
                    <div>{warnings[currentStep]}</div>
                  </div>
                )}

                {/* Error message for current step */}
                {userInteracted && errors[currentStep] && (
                  <div className="alert alert-danger mt-4 mb-4">
                    <AlertTriangle size={18} className="me-2" style={{ display: 'inline', flexShrink: 0 }} />
                    <div>
                      <strong>Erreur :</strong> {errors[currentStep]}
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <div className="alert alert-danger mt-4 mb-4">
                    <AlertTriangle size={18} className="me-2" style={{ display: 'inline', flexShrink: 0 }} />
                    <div>
                      <strong>Erreur lors de la soumission :</strong> {errors.submit}
                      <p className="mt-2 mb-0 small">Si le problème persiste, veuillez contacter le support technique.</p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <NavigationButtons
                  currentStepIndex={currentStepIndex}
                  stepsLength={steps.length}
                  loading={loading}
                  hasError={!!errors[currentStep]}
                  disableNext={currentStep === "formRapport" && ((!hasIndicators && !hasReport) || !!errors.formIndicateurs || !!errors.formRapport)}
                  mode={mode}
                  onPrev={handlePrevStep}
                  onNext={handleNextStep}
                  onSubmit={handleSubmitPublication}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
      <PublicationModalSuccess show={success} onHide={() => setSuccess(false)} />
    </div>
  );
}

