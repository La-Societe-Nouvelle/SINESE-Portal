"use client";

import { Button, Badge } from "react-bootstrap";
import { CheckSquare2, ChevronRight } from "lucide-react";

export default function NafTrigger({
  selectedCodes = [],
  onToggle = () => { },
}) {
  const hasSelection = selectedCodes.length > 0;

  return (
    <Button
      className="btn-trigger"
      onClick={onToggle}
    >
      <div className="d-flex align-items-center flex-grow-1">
        {hasSelection ? (
          <>
            <Badge bg="primary" className="me-2">
              {selectedCodes.length}
            </Badge>
            <span className="text-dark">
             activité{selectedCodes.length > 1 ? 's' : ''} sélectionnée{selectedCodes.length > 1 ? 's' : ''}
            </span>
            <CheckSquare2 size={16} className="ms-auto text-primary" />
          </>
        ) : (
          <>
            <span className="placeholder-text">
              Sélectionner une ou plusieurs activités...
            </span>
            <ChevronRight size={16} className="ms-2" />
          </>
        )}
      </div>
    </Button>

  );
}