"use client";

import { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Modal } from "react-bootstrap";
import { Plus, Search } from "lucide-react";
import { fetchLegalUnits, addLegalUnit } from "@/services/legalUnitService";

export default function PublicationLegalUnitSelector({ selectedLegalunitId, onLegalUnitSelect }) {
  const [legalUnits, setLegalUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingUnit, setCreatingUnit] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({ siren: "", denomination: "" });

  // Charger les entreprises existantes
  useEffect(() => {
    const loadLegalUnits = async () => {
      try {
        setLoading(true);
        const units = await fetchLegalUnits();
        setLegalUnits(units);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLegalUnits();
  }, []);

  // Gérer la création d'une nouvelle entreprise
  const handleCreateLegalUnit = async (e) => {
    e.preventDefault();
    setCreatingUnit(true);
    setCreateError("");

    try {
      const newUnit = await addLegalUnit({
        siren: formData.siren,
        denomination: formData.denomination,
      });

      // Ajouter la nouvelle unité à la liste
      setLegalUnits([...legalUnits, newUnit]);

      // Sélectionner automatiquement la nouvelle unité
      onLegalUnitSelect(newUnit);

      // Réinitialiser le formulaire et fermer la modal
      setFormData({ siren: "", denomination: "" });
      setShowCreateModal(false);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreatingUnit(false);
    }
  };

  if (loading) {
    return (
      <Form.Group className="mb-3">
        <Form.Label>Entreprise</Form.Label>
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Chargement des entreprises...</span>
        </div>
      </Form.Group>
    );
  }

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Entreprise</Form.Label>
        {error && <Alert variant="danger" className="mb-2">{error}</Alert>}

        {legalUnits.length === 0 ? (
          <div className="alert alert-info">
            <p className="mb-0">Aucune entreprise trouvée. Créez votre première entreprise pour commencer.</p>
          </div>
        ) : (
          <Form.Select
            value={selectedLegalunitId || ""}
            onChange={(e) => {
              const selected = legalUnits.find(unit => unit.id === parseInt(e.target.value));
              onLegalUnitSelect(selected);
            }}
            required
          >
            <option value="">-- Sélectionnez une entreprise --</option>
            {legalUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.denomination} (SIREN: {unit.siren})
              </option>
            ))}
          </Form.Select>
        )}

        <Button
          variant="outline-primary"
          size="sm"
          className="mt-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} className="me-2" />
          Ajouter une nouvelle entreprise
        </Button>
      </Form.Group>

      {/* Modal de création d'entreprise */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une nouvelle entreprise</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {createError && <Alert variant="danger">{createError}</Alert>}

          <Form onSubmit={handleCreateLegalUnit}>
            <Form.Group className="mb-3">
              <Form.Label>SIREN de l'entreprise</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: 123456789"
                value={formData.siren}
                onChange={(e) => setFormData({ ...formData, siren: e.target.value })}
                required
                disabled={creatingUnit}
              />
              <Form.Text className="text-muted">
                Le SIREN doit être un numéro valide de 9 chiffres.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dénomination de l'entreprise</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: ACME Corporation"
                value={formData.denomination}
                onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                required
                disabled={creatingUnit}
              />
            </Form.Group>

            <Form.Text className="text-muted d-block mb-3">
              L'entreprise sera vérifiée dans le répertoire SINESE.
            </Form.Text>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={creatingUnit || !formData.siren || !formData.denomination}
              >
                {creatingUnit ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="me-2" />
                    Ajouter l'entreprise
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={creatingUnit}
              >
                Annuler
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
