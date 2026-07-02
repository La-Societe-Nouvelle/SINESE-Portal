"use client";
import { Modal, Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { Building, Search, CheckCircle, AlertTriangle, FilePlus } from "lucide-react";
import { REPORT_TYPES } from "../forms/ReportForm";
import { createAdminPublication } from "@/actions/admin/publications";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export default function AdminPublishModal({ show, onHide, onSuccess }) {
  const [siren, setSiren] = useState("");
  const [denomination, setDenomination] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(false);
  const [year, setYear] = useState(String(CURRENT_YEAR - 1));
  const [reportType, setReportType] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) {
      setSiren("");
      setDenomination("");
      setFound(false);
      setYear(String(CURRENT_YEAR - 1));
      setReportType("");
      setReportUrl("");
      setError("");
    }
  }, [show]);

  useEffect(() => {
    if (!/^\d{9}$/.test(siren)) {
      setDenomination("");
      setFound(false);
      return;
    }

    const fetchUnit = async () => {
      setSearching(true);
      setFound(false);
      setDenomination("");
      setError("");
      try {
        const res = await fetch(`https://api.lasocietenouvelle.org/legalunit/${siren}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!data.legalUnits?.length) {
          setError("Aucune entreprise trouvée pour ce SIREN.");
          return;
        }
        setDenomination(data.legalUnits[0].denomination);
        setFound(true);
      } catch {
        setError("Aucune entreprise trouvée pour ce SIREN.");
      } finally {
        setSearching(false);
      }
    };

    fetchUnit();
  }, [siren]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!found || !year) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await createAdminPublication({
        siren,
        year: parseInt(year),
        reportType: reportType || null,
        reportUrl: reportUrl.trim() || null,
      });
      if (result.error) throw new Error(result.error);
      onSuccess();
      onHide();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = found && year && !searching && !submitting;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <FilePlus size={22} className="text-primary" />
          Nouvelle publication admin
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* SIREN */}
          <Form.Group className="mb-3">
            <Form.Label>SIREN</Form.Label>
            <InputGroup>
              <InputGroup.Text><Search size={16} className="text-muted" /></InputGroup.Text>
              <Form.Control
                value={siren}
                onChange={(e) => setSiren(e.target.value.replace(/\D/g, ""))}
                placeholder="9 chiffres"
                maxLength={9}
                autoComplete="off"
              />
              {searching && <InputGroup.Text><Spinner animation="border" size="sm" /></InputGroup.Text>}
              {found && !searching && <InputGroup.Text><CheckCircle size={16} className="text-success" /></InputGroup.Text>}
            </InputGroup>
          </Form.Group>

          {/* Dénomination */}
          {found && (
            <Form.Group className="mb-3">
              <Form.Label>Dénomination</Form.Label>
              <InputGroup>
                <InputGroup.Text><Building size={16} className="text-muted" /></InputGroup.Text>
                <Form.Control value={denomination} readOnly />
              </InputGroup>
            </Form.Group>
          )}

          {/* Année */}
          <Form.Group className="mb-3">
            <Form.Label>Année</Form.Label>
            <Form.Select value={year} onChange={(e) => setYear(e.target.value)}>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Rapport (optionnel) */}
          <Form.Group className="mb-3">
            <Form.Label>Type de rapport <span className="text-muted">(optionnel)</span></Form.Label>
            <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="">— Aucun rapport —</option>
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {reportType && (
            <Form.Group className="mb-3">
              <Form.Label>URL du rapport</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://..."
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
              />
            </Form.Group>
          )}

          {error && (
            <Alert variant="danger" className="d-flex align-items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" onClick={onHide} type="button">Annuler</Button>
            <Button variant="primary" type="submit" disabled={!canSubmit}>
              {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : <CheckCircle size={16} className="me-1" style={{ display: "inline" }} />}
              Publier
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
