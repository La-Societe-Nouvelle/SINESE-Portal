"use client";
import { addPublication, addReport } from "@/services/publicationService";
import { Building, FileText, BarChart3, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle, Upload, Link2, Info, Save } from "lucide-react";
import { Button, Modal, Row, Col, Card, Form, Badge, Table } from "react-bootstrap";
import { isEqual } from "lodash";
import { useState, useEffect, useRef } from "react";
import { validateEmpreinte, validateExtraIndic, validatePeriod } from "../../_utils";
import IndicatorsForm from "./IndicatorsForm";
import LegalUnitForm from "./LegalUnitForm";
import DocumentUploadForm, { uploadDocumentsToOVH } from "./DocumentUploadForm";
import usePublicationSteps from "../../_hooks/usePublicationSteps";
import ProgressSidebar from "./ProgressSidebar";
import indicators from "../../_lib/indicators.json";

const LUCIDE_ICONS = { Building, FileText, BarChart3, CheckCircle };

const REPORT_TYPES = [
  { value: "RSE", label: "Rapport RSE" },
  { value: "ESRS", label: "Rapport de durabilité - ESRS" },
  { value: "CSRD", label: "Rapport de durabilité - CSRD" },
  { value: "VSME", label: "Rapport de durabilité - VSME" },
  { value: "AUTRE", label: "Autre rapport de durabilité" },

];
export default function PublicationForm({ initialData = {}, mode = "create", isLegalUnitPreselected = false }) {
  // Entreprise (shared)
  const [selectedLegalUnit, setSelectedLegalUnit] = useState(initialData.legalUnit || "");
  const [selectedYear, setSelectedYear] = useState(initialData.year || "");
  const [showDetailPeriod, setShowDetailPeriod] = useState(
    initialData.period_start != null && initialData.period_end != null && initialData.period_start !== "" && initialData.period_end !== ""
  );
  console.log("Initial showDetailPeriod:", initialData.period_start);
  // Indicateurs
  const [periodStart, setPeriodStart] = useState(initialData.period_start || "");
  const [periodEnd, setPeriodEnd] = useState(initialData.period_end || "");
  const [declarationData, setDeclarationData] = useState(initialData.data || {});

  // Rapport
  const [reportType, setReportType] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [reportDocuments, setReportDocuments] = useState([]);
  const [externalUrl, setExternalUrl] = useState("");

  // Shared
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [draftSavedNotification, setDraftSavedNotification] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const { steps, currentStep, setCurrentStep, currentStepIndex, goToNextStep, goToPrevStep } = usePublicationSteps();

  // Track if the user has started filling indicators or report
  const hasIndicators = Object.values(declarationData).some(
    (ind) => ind && ind.value !== undefined && ind.value !== ""
  );
  const hasReport = reportType && (
    (uploadMode === "file" && reportDocuments.length > 0) ||
    (uploadMode === "url" && externalUrl.trim())
  );

  // Référence pour stocker le dernier brouillon
  const lastDraft = useRef({
    declarationData,
    selectedLegalUnit,
    periodStart,
    periodEnd,
    step: currentStep,
  });

  // Validation
  function validateStep(stepKey) {
    switch (stepKey) {
      case "formEntreprise":
        if (!selectedLegalUnit) return "Veuillez sélectionner une entreprise.";
        if (!selectedYear) return "Veuillez sélectionner une année.";
        return null;
      case "formIndicateurs": {
        // Optionnel : si rien n'est rempli, c'est OK (on passera au rapport)
        // Mais si l'utilisateur a commencé, on valide
        if (!hasIndicators) return null;
        // Only validate period if detail period is enabled
        if (showDetailPeriod) {
          const periodError = validatePeriod(periodStart, periodEnd);
          if (periodError) return periodError;
        }
        const empreinteError = validateEmpreinte(declarationData);
        if (empreinteError) return empreinteError;
        return validateExtraIndic(declarationData);
      }
      case "formRapport":
        if (!reportType && reportDocuments.length === 0 && !externalUrl.trim()) return null;
        if (!reportType) return "Veuillez sélectionner un type de rapport (RSE, CSRD, ESG, VSME...).";
        if (uploadMode === "file" && reportDocuments.length === 0) {
          return "Veuillez déposer au moins un fichier (formats acceptés : PDF, DOC, DOCX).";
        }
        if (uploadMode === "url" && !externalUrl.trim()) {
          return "Veuillez renseigner l'URL complète du rapport (ex: https://exemple.com/rapport.pdf).";
        }
        if (uploadMode === "url") {
          try { new URL(externalUrl.trim()); } catch { return "L'URL fournie n'est pas valide. Vérifiez qu'elle commence par https:// ou http://."; }
        }
        return null;
      case "formRecap":
        if (!hasIndicators && !hasReport) {
          return "Au moins une section doit être remplie : publiez des indicateurs (étape 2) et/ou un rapport de durabilité (étape 3).";
        }
        if (!confirmationChecked) return "Veuillez cocher la case de certification pour confirmer l'exactitude des informations.";
        return null;
      default:
        return null;
    }
  }

  useEffect(() => {
    const errorMsg = validateStep(currentStep);
    setErrors((prev) => {
      // Only show errors if user has interacted with the form
      if (userInteracted && errorMsg) {
        return { ...prev, [currentStep]: errorMsg };
      } else {
        const updated = { ...prev };
        delete updated[currentStep];
        return updated;
      }
    });
  }, [declarationData, selectedLegalUnit, selectedYear, periodStart, periodEnd, confirmationChecked, currentStep, reportType, uploadMode, reportDocuments, externalUrl, showDetailPeriod, userInteracted]);

  // Auto-save draft for indicators
  useEffect(() => {
    const errorMsg = validateStep(currentStep);
    if (!errorMsg && !errors[currentStep]) {
      const hasChanged =
        !isEqual(declarationData, lastDraft.current.declarationData) ||
        !isEqual(selectedLegalUnit, lastDraft.current.selectedLegalUnit) ||
        periodStart !== lastDraft.current.periodStart ||
        periodEnd !== lastDraft.current.periodEnd ||
        currentStep !== lastDraft.current.step;

      if (hasChanged && hasIndicators) {
        saveDraft();
        lastDraft.current = {
          declarationData,
          selectedLegalUnit,
          periodStart,
          periodEnd,
          step: currentStep,
        };
      }
    }
  }, [declarationData, selectedLegalUnit, periodStart, periodEnd, currentStep, errors]);

  useEffect(() => {
    setUserInteracted(false);
    setTimeout(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, 50);
  }, [currentStep]);

  async function handleNextStep() {
    setUserInteracted(true);
    const errorMsg = validateStep(currentStep);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [currentStep]: errorMsg }));
      return;
    }
    if (errors[currentStep]) return;
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
    if (errors[currentStep]) return;
    setCurrentStep(targetStep);
  }

  async function saveDraft() {
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

      // Submit indicators if filled
      if (hasIndicators) {
        const year = selectedYear || (periodEnd ? new Date(periodEnd).getFullYear() : undefined);

        // Upload report documents attached to indicator publication
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
          // Upload to OVH if not already done
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
  }

  // Calculate completed indicators count - ESE indicators
  const completedEseIndicators = Object.entries(declarationData).filter(([key, ind]) => {
    const indicatorInfo = indicators[key];
    return indicatorInfo && indicatorInfo.category !== "Indicateurs supplémentaires" &&
      ind && ind.value !== undefined && ind.value !== "" &&
      ind.uncertainty !== undefined && ind.uncertainty !== "";
  }).length;

  // Calculate completed indicators count - Supplementary indicators
  const completedSupplementaryIndicators = Object.entries(declarationData).filter(([key, ind]) => {
    const indicatorInfo = indicators[key];
    return indicatorInfo && indicatorInfo.category === "Indicateurs supplémentaires" &&
      ind && ind.value !== undefined && ind.value !== "";
  }).length;

  // Get total indicators count
  const totalEseIndicators = Object.values(indicators).filter(ind =>
    ind.category !== "Indicateurs supplémentaires"
  ).length;

  const totalSupplementaryIndicators = Object.values(indicators).filter(ind =>
    ind.category === "Indicateurs supplémentaires"
  ).length;

  return (
    <div className="publication-page">
      <div className="container">
        <Card className="publication-form-card border-0">
          <Card.Body>
            <h3 className="main-title">
              <span className="me-2">Déclaration de publication</span>
            </h3>

            <Row className="g-4">
              <ProgressSidebar
                steps={steps}
                currentStep={currentStep}
                currentStepIndex={currentStepIndex}
                handleStepChange={handleStepChange}
                errors={errors}
                completedEseIndicators={completedEseIndicators}
                totalEseIndicators={totalEseIndicators}
                completedSupplementaryIndicators={completedSupplementaryIndicators}
                totalSupplementaryIndicators={totalSupplementaryIndicators}
                selectedLegalUnit={selectedLegalUnit}
                selectedYear={selectedYear}
              />
              <Col className="col-lg-9">
                {/* Auto-save notification */}
                {draftSavedNotification && (
                  <div className="draft-saved-toast">
                    <Save size={14} style={{ display: "inline" }} />
                    Brouillon sauvegardé
                  </div>
                )}

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
                    {currentStep === "formIndicateurs" &&
                      "Renseignez les indicateurs que vous souhaitez publier. Vous pouvez aussi passer cette étape si vous souhaitez uniquement publier un rapport."}
                    {currentStep === "formRapport" &&
                      "Choisissez le type de rapport et joignez le document ou indiquez son URL. Vous pouvez passer cette étape si vous souhaitez uniquement publier des indicateurs."}
                    {currentStep === "formRecap" && "Vérifiez et validez votre demande de publication au sein du répertoire SINESE."}
                  </div>

                </div>

                {/* Step: Entreprise */}
                {currentStep === "formEntreprise" && (
                  <LegalUnitForm
                    selectedLegalUnit={selectedLegalUnit}
                    setSelectedLegalUnit={setSelectedLegalUnit}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    showDetailPeriod={showDetailPeriod}
                    setShowDetailPeriod={setShowDetailPeriod}
                    periodStart={periodStart}
                    setPeriodStart={setPeriodStart}
                    periodEnd={periodEnd}
                    setPeriodEnd={setPeriodEnd}
                    mode={mode}
                    setErrors={setErrors}
                    isLegalUnitPreselected={isLegalUnitPreselected}
                    hidePeriod={false}
                  />
                )}

                {/* Step: Indicateurs (period + ESE + extra) */}
                {currentStep === "formIndicateurs" && (
                  <div>

                    <h5 className="mb-3">Empreinte sociétale</h5>
                    <IndicatorsForm
                      data={declarationData || {}}
                      categories={["Création de la valeur", "Empreinte sociale", "Empreinte environnementale"]}
                      onChange={(data) => setDeclarationData((d) => ({ ...d, ...data }))}
                      errors={errors}
                    />

                    <h5 className="mt-4 mb-3">Indicateurs supplémentaires</h5>
                    <p className="text-muted small">
                      Indicateurs complémentaires déjà déclarés auprès d'organismes publics.
                    </p>
                    <IndicatorsForm
                      data={declarationData || {}}
                      categories="Indicateurs supplémentaires"
                      onChange={(data) => setDeclarationData((d) => ({ ...d, ...data }))}
                      errors={errors}
                    />


                  </div>
                )}

                {/* Step: Rapport */}
                {currentStep === "formRapport" && (
                  <div className="report-form">
                    <Form.Group className="form-group" controlId="reportType">
                      <Form.Label>Type de rapport</Form.Label>
                      <Form.Select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option value="">Sélectionner un type de rapport</option>
                        {REPORT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="form-group mt-4">
                      <Form.Label>Mode de publication</Form.Label>
                      <div className="d-flex gap-3 mb-3">
                        <Button
                          variant={uploadMode === "file" ? "primary" : "outline-primary"}
                          onClick={() => setUploadMode("file")}
                          className="d-flex align-items-center gap-2"
                        >
                          <Upload size={16} style={{ display: "inline" }} />
                          Déposer un fichier
                        </Button>
                        <Button
                          variant={uploadMode === "url" ? "primary" : "outline-primary"}
                          onClick={() => setUploadMode("url")}
                          className="d-flex align-items-center gap-2"
                        >
                          <Link2 size={16} style={{ display: "inline" }} />
                          Lien externe
                        </Button>
                      </div>
                    </Form.Group>

                    {uploadMode === "file" ? (
                      <DocumentUploadForm
                        documents={reportDocuments}
                        onChange={setReportDocuments}
                        selectedLegalUnit={selectedLegalUnit}
                      />
                    ) : (
                      <Form.Group className="form-group" controlId="externalUrl">
                        <Form.Label>URL du rapport</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://exemple.com/rapport-rse-2025.pdf"
                          value={externalUrl}
                          onChange={(e) => setExternalUrl(e.target.value)}
                        />
                      </Form.Group>
                    )}


                  </div>
                )}

                {/* Step: Récapitulatif */}
                {currentStep === "formRecap" && (
                  <RecapSection
                    legalUnit={selectedLegalUnit}
                    declarationData={declarationData}
                    hasIndicators={hasIndicators}
                    hasReport={hasReport}
                    reportType={reportType}
                    uploadMode={uploadMode}
                    reportDocuments={reportDocuments}
                    externalUrl={externalUrl}
                    selectedYear={selectedYear}
                    showDetailPeriod={showDetailPeriod}
                    periodStart={periodStart}
                    periodEnd={periodEnd}
                    confirmationChecked={confirmationChecked}
                    setConfirmationChecked={setConfirmationChecked}
                  />
                )}

                {/* Warning for optional steps */}
                {warnings[currentStep] && !errors[currentStep] && (
                  <div className="alert alert-warning mt-4 mb-4">
                    <Info size={18} className="me-2" style={{ display: 'inline', flexShrink: 0 }} />
                    <div>{warnings[currentStep]}</div>
                  </div>
                )}



                {/* Error message for current step (only after user interaction) */}
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
                <div className="form-actions form-actions-sticky">
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

function RecapSection({
  legalUnit, declarationData, hasIndicators, hasReport,
  reportType, uploadMode, reportDocuments, externalUrl,
  selectedYear, showDetailPeriod, periodStart, periodEnd, confirmationChecked, setConfirmationChecked,
}) {
  const year = selectedYear || (periodEnd ? new Date(periodEnd).getFullYear() : null);
  const extraIndicators = Object.entries(indicators).filter(
    ([_, meta]) => meta.category === "Indicateurs supplémentaires"
  );

  return (
    <div>
      {/* Company info */}
      <div className="recap-section">
        <div className="recap-info">
          <p>
            <b>Entreprise :</b> {legalUnit?.denomination} {legalUnit?.siren ? `(${legalUnit?.siren})` : ""}
          </p>
          <p>
            <b>Année de déclaration :</b> {year || "Non spécifiée"}
            {showDetailPeriod && periodStart && periodEnd && (
              <p className="text-muted small mb-0 mt-2">
                Période : du {new Date(periodStart).toLocaleDateString("fr-FR")} au {new Date(periodEnd).toLocaleDateString("fr-FR")}
              </p>
            )}

          </p>
        </div>
      </div>

      {/* Indicators recap */}
      {hasIndicators && (
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="mb-0 d-flex align-items-center">
                <BarChart3 size={18} className="me-2" />
                Indicateurs
              </h6>
            </div>

          </Card.Header>
          <Card.Body className="p-0">
            <Table className="mb-0 table-sm table-striped">
              <thead>
                <tr>
                  <th>Indicateur</th>
                  <th>Valeur</th>
                  <th>Incertitude (%)</th>
                  <th>Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(indicators).map(([key, meta]) => {
                  const indicator = declarationData?.[key];
                  if (!indicator || indicator.value === undefined || indicator.value === "") return null;
                  if (meta.category === "Indicateurs supplémentaires") return null;
                  return (
                    <tr key={key}>
                      <td>{meta.libelle}</td>
                      <td className="fw-500">{indicator.value}</td>
                      <td>{indicator.uncertainty ?? <span className="text-muted">-</span>}</td>
                      <td>{indicator.comment || <span className="text-muted">-</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Extra indicators recap */}
      {hasIndicators && extraIndicators.some(
        ([key]) => declarationData?.[key] && declarationData[key].value !== undefined && declarationData[key].value !== ""
      ) && (
          <Card className="mb-3">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Indicateurs supplémentaires</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0 table-sm table-striped">
                <thead>
                  <tr><th>Indicateur</th><th>Valeur</th><th>Commentaire</th></tr>
                </thead>
                <tbody>
                  {extraIndicators.map(([key, meta]) => {
                    const indicator = declarationData?.[key];
                    if (!indicator || indicator.value === undefined || indicator.value === "") return null;
                    return (
                      <tr key={key}>
                        <td>{meta.libelle}</td>
                        <td className="fw-500">{indicator.value}</td>
                        <td>{indicator.comment || <span className="text-muted">-</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

      {/* Report recap */}
      {hasReport && (
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h6 className="mb-0 d-flex align-items-center">
              <FileText size={18} className="me-2" />
              Rapport
            </h6>
          </Card.Header>
          <Card.Body>
            <Row className="mb-2">
              <Col md={4}><strong>Type :</strong></Col>
              <Col md={8}>
                <Badge bg="info">
                  {REPORT_TYPES.find((t) => t.value === reportType)?.label || reportType}
                </Badge>
              </Col>
            </Row>
            <Row>
              <Col md={4}><strong>Document :</strong></Col>
              <Col md={8}>
                {uploadMode === "file" ? (
                  reportDocuments.map((doc) => (
                    <div key={doc.id}>
                      <FileText size={14} className="me-1" style={{ display: "inline" }} />
                      {doc.name} ({formatFileSize(doc.size)})
                    </div>
                  ))
                ) : (
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    <Link2 size={14} className="me-1" style={{ display: "inline" }} />
                    {externalUrl}
                  </a>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Form.Check
        type="checkbox"
        id="honor-check"
        label="Je certifie sur l'honneur l'exactitude des informations fournies dans cette déclaration et confirme que je suis autorisé à publier ces données."
        required
        checked={confirmationChecked}
        onChange={(e) => setConfirmationChecked(e.target.checked)}
      />
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function PublicationModalSuccess({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center py-5 px-4">
        <div className="success-icon-wrapper">
          <CheckCircle size={48} className="text-success success-icon-animated" />
        </div>
        <h4 className="fw-bold mb-2 mt-4">Demande envoyée avec succès</h4>
        <p className="text-muted mb-2">
          Votre demande de publication a bien été reçue et sera examinée par notre équipe.
        </p>
        <p className="text-muted mb-4 small">
          Vous recevrez un email de confirmation dès que votre publication sera validée.
        </p>

        <div className="d-flex flex-column gap-2">
          <a
            href="/publications/espace/gestion"
            className="btn btn-primary"
            onClick={onHide}
          >
            Voir mes demandes de publication
          </a>
          <a
            href="/publications/espace/publier"
            className="btn btn-outline-secondary btn-sm"
          >
            Faire une nouvelle publication
          </a>
        </div>
      </Modal.Body>
    </Modal>
  );
}
