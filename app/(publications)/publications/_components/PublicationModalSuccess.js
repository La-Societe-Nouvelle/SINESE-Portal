"use client";
import { Modal } from "react-bootstrap";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublicationModalSuccess({ show, onHide }) {
  const router = useRouter();

  const handleGoToGestion = () => {
    onHide();
    router.push("/publications/espace/gestion");
  };

  const handleNewPublication = () => {
    onHide();
    router.push("/publications/espace/publier");
  };

  return (
    <Modal show={show} onHide={handleGoToGestion} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center py-5 px-4">
        <div className="success-icon-wrapper">
          <CheckCircle size={48} className="text-success success-icon-animated" />
        </div>
        <h4 className="fw-bold mb-2 mt-4">Demande envoyée avec succès</h4>
        <p className="text-muted mb-2">
          Votre demande de publication a bien été reçue et sera examinée par notre équipe.
        </p>


        <div className="d-flex flex-column gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGoToGestion}
          >
            Voir mes demandes de publication
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleNewPublication}
          >
            Faire une nouvelle publication
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
