import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "react-bootstrap";

export default function NavigationButtons({ currentStepIndex, stepsLength, loading, hasError, disableNext, mode, onPrev, onNext, onSubmit }) {
  const isLast = currentStepIndex === stepsLength - 1;
  const isFirst = currentStepIndex === 0;

  return (
    <div className="form-actions form-actions-sticky">
      {!isFirst && (
        <Button variant="light" onClick={onPrev}>
          <ChevronLeft size={16} className="me-1" style={{ display: 'inline' }} /> Précédent
        </Button>
      )}
      <Button
        variant={isLast ? "secondary" : "primary"}
        disabled={loading || hasError || disableNext}
        onClick={isLast ? onSubmit : onNext}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Envoi en cours...
          </>
        ) : isFirst && mode !== "edit" ? (
          <>
            Commencer <ChevronRight size={16} className="ms-1" style={{ display: 'inline' }} />
          </>
        ) : isLast ? (
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
  );
}
