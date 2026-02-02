import { Modal } from "react-bootstrap";
import { CheckCircle } from "lucide-react";

export default function PublicationModalSuccess({ show, onHide }) {
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
