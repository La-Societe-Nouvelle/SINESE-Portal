"use client";
import { Modal, Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { Building, Search, CheckCircle, AlertTriangle, X, ShieldAlert } from "lucide-react";

export default function AddLegalUnitModal({ show, onHide, onAdd }) {
  const [form, setForm] = useState({ denomination: "", siren: "" });
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(false);
  const [error, setError] = useState("");
  const [isInactive, setIsInactive] = useState(false);
  const [attachedToOther, setAttachedToOther] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!show) {
      setForm({ denomination: "", siren: "" });
      setFound(false);
      setError("");
      setIsInactive(false);
      setAttachedToOther(false);
      setConfirmed(false);
    }
  }, [show]);

  useEffect(() => {
    const fetchLegalUnit = async () => {
      setError("");
      setFound(false);
      setIsInactive(false);
      setAttachedToOther(false);
      setConfirmed(false);
      setSearching(true);
      setForm((f) => ({ ...f, denomination: "" }));

      try {
        const res = await fetch(`https://api.lasocietenouvelle.org/legalunit/${form.siren}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!data.legalUnits || data.legalUnits.length === 0) {
          setError("Aucune entreprise trouvée pour ce SIREN.");
          setSearching(false);
          return;
        }
        const legalUnit = data.legalUnits[0];
        setForm((f) => ({ ...f, denomination: legalUnit.denomination }));
        setFound(true);

        // Check if the company is inactive
        if (legalUnit.etatAdministratifUniteLegale && legalUnit.etatAdministratifUniteLegale !== "A") {
          setIsInactive(true);
        }

        // Check attachment to another user
        const checkRes = await fetch(`/api/legal-units/check?siren=${form.siren}`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          setAttachedToOther(checkData.attachedToOtherUser);
        }
      } catch {
        setError("Aucune entreprise trouvée pour ce SIREN.");
      } finally {
        setSearching(false);
      }
    };

    if (/^\d{9}$/.test(form.siren)) {
      fetchLegalUnit();
    } else {
      setForm((f) => ({ ...f, denomination: "" }));
      setFound(false);
      setError("");
      setIsInactive(false);
      setAttachedToOther(false);
      setConfirmed(false);
    }
  }, [form.siren]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.replace(/\D/g, "") });
    if (e.target.name === "siren") {
      setFound(false);
      setError("");
    }
  };

  const handleDenominationChange = (e) => {
    setForm({ ...form, denomination: e.target.value });
    setFound(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.denomination || !form.siren) return;
    await onAdd({ ...form });
    setForm({ denomination: "", siren: "" });
  };

  const requiresConfirmation = attachedToOther || isInactive;
  const canSubmit = found && !searching && !error && (!requiresConfirmation || confirmed);

  return (
    <Modal show={show} onHide={onHide} centered className="add-legal-unit-modal">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Building size={24} className="text-primary" />
          Ajouter une entreprise
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        <Form onSubmit={handleSubmit}>
          {/* SIREN Field */}
          <Form.Group className="mb-4" controlId="siren">
            <Form.Label>Numéro SIREN</Form.Label>
            <InputGroup className="mb-2">
              <InputGroup.Text>
                <Search size={18} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                name="siren"
                value={form.siren}
                onChange={handleChange}
                placeholder="Entrez 9 chiffres"
                required
                maxLength={9}
                minLength={9}
                pattern="\d{9}"
                autoComplete="off"
              />
            </InputGroup>
          </Form.Group>

          {/* Denomination Field */}
          <Form.Group className="mb-3" controlId="denomination">
            <Form.Label>Dénomination</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Building size={18} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                name="denomination"
                value={form.denomination}
                onChange={handleDenominationChange}
                placeholder="ex : Société Nouvelle"
                required
                readOnly={found}
                autoComplete="off"
              />
              {searching && (
                <InputGroup.Text>
                  <Spinner animation="border" size="sm" />
                </InputGroup.Text>
              )}
              {found && !searching && (
                <InputGroup.Text>
                  <CheckCircle size={18} className="text-success" />
                </InputGroup.Text>
              )}
            </InputGroup>
          </Form.Group>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4 d-flex align-items-start gap-2">
              <AlertTriangle size={18} className="flex-shrink-0 mt-1" />
              <div>{error}</div>
            </Alert>
          )}

          {/* Inactive company warning */}
          {isInactive && (
            <Alert variant="warning" className="mb-3 d-flex align-items-start gap-2">
              <ShieldAlert size={18} className="flex-shrink-0 mt-1" />
              <div>
                <strong>Entreprise inactive ou dissoute.</strong> Cette unité légale n'est plus active
                selon le répertoire INSEE. Publier des données pour une entreprise dissoute peut
                engager votre responsabilité juridique.
              </div>
            </Alert>
          )}

          {/* Attachment warning */}
          {attachedToOther && (
            <Alert variant="warning" className="mb-3 d-flex align-items-start gap-2">
              <AlertTriangle size={18} className="flex-shrink-0 mt-1" />
              <div>
                <p className="small">
                  <b>Ce SIREN est déjà rattaché à un autre compte utilisateur.</b> Si vous
                  n'êtes pas mandaté pour déclarer au nom de cette entreprise, vous pourriez engager
                  votre responsabilité juridique.{" "}
                  Si vous pensez qu'il s'agit d'une erreur et que vous devriez être le seul à pouvoir
                  déclarer pour cette entreprise,{" "}
                  <a href="/contact" target="_blank" rel="noopener noreferrer" className="text-primary">
                    contactez-nous
                  </a>.
                </p>
              </div>
            </Alert>
          )}


          {/* Confirmation checkbox */}
          {requiresConfirmation && found && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="confirm-attachment"
                label="Je confirme être autorisé à publier pour cette entreprise."
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
            </Form.Group>
          )}

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button variant="link" onClick={onHide} size="sm">
              <X size={16} className="me-1" style={{ display: "inline" }} />
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              size="sm"
              disabled={!canSubmit}
            >
              <CheckCircle size={16} className="me-1" style={{ display: "inline" }} />
              Ajouter l'entreprise
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
