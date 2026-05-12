"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Container, Form, Button, InputGroup, Spinner, Alert, Card } from "react-bootstrap";
import { Building, Search, CheckCircle, AlertTriangle, ArrowLeft, Upload, Link2 } from "lucide-react";
import Link from "next/link";
import { REPORT_TYPES } from "../../../_components/forms/ReportForm";
import { createAdminPublication } from "@/actions/admin/publications";
import DocumentUploadForm, { uploadDocumentsToOVH } from "../../../_components/forms/DocumentUploadForm";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export default function AdminPublierPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [siren, setSiren] = useState("");
  const [denomination, setDenomination] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(false);
  const [sirenError, setSirenError] = useState("");

  const [year, setYear] = useState(String(CURRENT_YEAR - 1));
  const [reportType, setReportType] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [documents, setDocuments] = useState([]);
  const [externalUrl, setExternalUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/publications/connexion");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/publications/espace");
  }, [status, session, router]);

  useEffect(() => {
    if (!/^\d{9}$/.test(siren)) {
      setDenomination("");
      setFound(false);
      setSirenError("");
      return;
    }
    const fetchUnit = async () => {
      setSearching(true);
      setFound(false);
      setDenomination("");
      setSirenError("");
      try {
        const res = await fetch(`https://api.lasocietenouvelle.org/legalunit/${siren}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!data.legalUnits?.length) { setSirenError("Aucune entreprise trouvée pour ce SIREN."); return; }
        setDenomination(data.legalUnits[0].denomination);
        setFound(true);
      } catch {
        setSirenError("Aucune entreprise trouvée pour ce SIREN.");
      } finally {
        setSearching(false);
      }
    };
    fetchUnit();
  }, [siren]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!found || !year || !reportType) return;
    if (uploadMode === "file" && documents.length === 0) {
      setError("Veuillez ajouter un fichier PDF.");
      return;
    }
    if (uploadMode === "url" && !externalUrl.trim()) {
      setError("Veuillez renseigner l'URL du rapport.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      let reportUrl, storageType, fileName, fileSize, mimeType;

      if (uploadMode === "file") {
        const uploaded = await uploadDocumentsToOVH(documents, siren);
        const doc = uploaded[0];
        reportUrl = doc.url;
        storageType = "ovh";
        fileName = doc.name;
        fileSize = doc.size;
        mimeType = doc.type;
      } else {
        reportUrl = externalUrl.trim();
        storageType = "external";
      }

      const result = await createAdminPublication({
        siren,
        year: parseInt(year),
        reportType,
        reportUrl,
        storageType,
        fileName,
        fileSize,
        mimeType,
      });
      if (result.error) throw new Error(result.error);
      router.push("/publications/admin/dashboard");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <Container className="py-5 text-center"><Spinner animation="border" variant="primary" /></Container>;
  }
  if (!session || session.user.role !== "admin") return null;

  const canSubmit = found && year && reportType && !searching && !submitting;

  return (
    <Container className="py-4" >
      <div className="mb-4">
        <Link href="/publications/admin/dashboard" className="text-muted small d-inline-flex align-items-center gap-1 mb-3">
          <ArrowLeft size={14} />
          Retour au dashboard
        </Link>
        <h1 className="h3 mb-1">Publier un rapport</h1>
        <p className="text-muted mb-0">Déposer directement un rapport de durabilité pour une entreprise.</p>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* Entreprise */}
        <Card className="mb-4">
          <Card.Header className="bg-light"><h6 className="mb-0">Entreprise</h6></Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Numéro SIREN</Form.Label>
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
              {sirenError && (
                <Form.Text className="text-danger d-flex align-items-center gap-1 mt-1">
                  <AlertTriangle size={13} />{sirenError}
                </Form.Text>
              )}
            </Form.Group>
            {found && (
              <Form.Group>
                <Form.Label>Dénomination</Form.Label>
                <InputGroup>
                  <InputGroup.Text><Building size={16} className="text-muted" /></InputGroup.Text>
                  <Form.Control value={denomination} readOnly />
                </InputGroup>
              </Form.Group>
            )}
          </Card.Body>
        </Card>

        {/* Année + Type */}
        <Card className="mb-4">
          <Card.Header className="bg-light"><h6 className="mb-0">Déclaration</h6></Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Année</Form.Label>
              <Form.Select value={year} onChange={(e) => setYear(e.target.value)}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Type de rapport</Form.Label>
              <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value)} required>
                <option value="">— Sélectionner —</option>
                {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Rapport */}
        <Card className="mb-4">
          <Card.Header className="bg-light"><h6 className="mb-0">Rapport PDF</h6></Card.Header>
          <Card.Body>
            <div className="d-flex gap-3 mb-3">
              <Form.Check
                type="radio"
                id="mode-file"
                label={<><Upload size={14} className="me-1" />Uploader un fichier</>}
                checked={uploadMode === "file"}
                onChange={() => { setUploadMode("file"); setExternalUrl(""); }}
              />
              <Form.Check
                type="radio"
                id="mode-url"
                label={<><Link2 size={14} className="me-1" />Lien externe</>}
                checked={uploadMode === "url"}
                onChange={() => { setUploadMode("url"); setDocuments([]); }}
              />
            </div>

            {uploadMode === "file" ? (
              <DocumentUploadForm
                documents={documents}
                onChange={setDocuments}
                selectedLegalUnit={found ? { siren } : null}
              />
            ) : (
              <Form.Control
                type="url"
                placeholder="https://..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            )}
          </Card.Body>
        </Card>

        {error && (
          <Alert variant="danger" className="d-flex align-items-center gap-2 mb-4">
            <AlertTriangle size={16} />{error}
          </Alert>
        )}

        <div className="d-flex justify-content-end gap-2">
          <Button variant="light" as={Link} href="/publications/admin/dashboard">Annuler</Button>
          <Button variant="primary" type="submit" disabled={!canSubmit}>
            {submitting
              ? <><Spinner animation="border" size="sm" className="me-2" />Publication en cours...</>
              : <><CheckCircle size={16} className="me-1" style={{ display: "inline" }} />Publier</>
            }
          </Button>
        </div>
      </Form>
    </Container>
  );
}
