import indicators from "./../../_lib/indicators.json";
import { Table, Form, Card, Row, Col, Badge } from "react-bootstrap";
import { BarChart3, FileText, Link2 } from "lucide-react";
import { usePublicationFormContext } from "../../_context/PublicationFormContext";
import { REPORT_TYPES } from "./ReportForm";
import { formatFileSize } from "../../_utils";

export default function RecapForm() {
  const {
    selectedLegalUnit: legalUnit,
    declarationData,
    hasIndicators,
    hasReport,
    reportType,
    uploadMode,
    reportDocuments,
    externalUrl,
    selectedYear,
    showDetailPeriod,
    periodStart,
    periodEnd,
    confirmationChecked,
    setConfirmationChecked,
  } = usePublicationFormContext();

  const year = selectedYear || (periodEnd ? new Date(periodEnd).getFullYear() : null);
  const extraIndicators = Object.entries(indicators).filter(
    ([_, meta]) => meta.category === "Indicateurs supplémentaires"
  );

  return (
    <div>
      {/* Informations sur l'entreprise */}
      <div className="recap-section">
        <div className="recap-info">
          <p>
            <b>Entreprise :</b> {legalUnit?.denomination} {legalUnit?.siren ? `(${legalUnit?.siren})` : ""}
          </p>
          <p>
            <b>Année de déclaration :</b> {year || "Non spécifiée"}
            {showDetailPeriod && periodStart && periodEnd && (
              <span className="text-muted small mb-0 mt-2" style={{ display: "block" }}>
                Période : du {new Date(periodStart).toLocaleDateString("fr-FR")} au {new Date(periodEnd).toLocaleDateString("fr-FR")}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Récapitulatif des indicateurs principaux */}
      {hasIndicators && (
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="mb-0 d-flex align-items-center">
                <BarChart3 size={18} className="me-2" />
                Indicateurs principaux
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

      {/* Récapitulatif des indicateurs supplémentaires */}
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
                <tr>
                  <th>Indicateur</th>
                  <th>Valeur</th>
                  <th>Commentaire</th>
                </tr>
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

      {/* Récapitulatif du rapport */}
      {hasReport && (
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h6 className="mb-0 d-flex align-items-center">
              <FileText size={18} className="me-2" />
              Rapport joint
            </h6>
          </Card.Header>
          <Card.Body>
            <Row className="mb-2">
              <Col md={4}><strong>Type de rapport :</strong></Col>
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

      {/* Confirmation sur l'honneur */}
      <div
        className={`confirmation-box ${confirmationChecked ? "confirmed" : ""}`}
        onClick={() => setConfirmationChecked(!confirmationChecked)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setConfirmationChecked(!confirmationChecked); } }}
      >
        <Form.Check
          type="checkbox"
          id="honor-check"
          label="Je certifie sur l'honneur que les informations fournies dans cette publication sont exactes et que je suis autorisé(e) à publier ces données."
          required
          checked={confirmationChecked}
          onChange={(e) => setConfirmationChecked(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
        {!confirmationChecked && (
          <p className="text-muted small mt-2 mb-0">
            Veuillez cocher cette case pour pouvoir soumettre votre publication.
          </p>
        )}
      </div>
    </div>
  );
}
