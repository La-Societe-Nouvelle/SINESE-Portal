"use client";
import { Form, Button } from "react-bootstrap";
import { Upload, Link2 } from "lucide-react";
import DocumentUploadForm from "./DocumentUploadForm";
import { usePublicationFormContext } from "../../_context/PublicationFormContext";

const REPORT_TYPES = [
  { value: "RSE", label: "Rapport RSE" },
  { value: "ESRS", label: "Rapport de durabilité - ESRS" },
  { value: "CSRD", label: "Rapport de durabilité - CSRD" },
  { value: "VSME", label: "Rapport de durabilité - VSME" },
  { value: "AUTRE", label: "Autre rapport de durabilité" },
];

export { REPORT_TYPES };

export default function ReportForm() {
  const {
    reportType, setReportType,
    uploadMode, setUploadMode,
    reportDocuments, setReportDocuments,
    externalUrl, setExternalUrl,
    selectedLegalUnit,
  } = usePublicationFormContext();

  return (
    <div className="report-form">
      <Form.Group className="form-group" controlId="reportType">
        <Form.Label>Type de rapport</Form.Label>
        <Form.Select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          style={{ maxWidth: '400px' }}

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
  );
}
