"use client";

import { Button, Badge } from "react-bootstrap";
import {  CheckCircle, CheckSquare, CheckSquare2 } from "lucide-react";

export default function NafTrigger({
  selectedCodes = [],
  onToggle = () => { },
  className = ""
}) {
  const hasSelection = selectedCodes.length > 0;

  return (
    <div className={`naf-trigger ${className}`}>
      <Button
        variant="outline-primary"
        className="w-100 text-start d-flex align-items-center justify-content-between"
        onClick={onToggle}

      >
        <div className="d-flex align-items-center flex-grow-1">
          {hasSelection ? (
            <>
              <Badge bg="primary" className="me-1">
                {selectedCodes.length}
              </Badge>
              <small className="text-muted">
                activité{selectedCodes.length > 1 ? 's' : ''} sélectionnée{selectedCodes.length > 1 ? 's' : ''}
              </small>
              <CheckSquare2 size={16} className="ms-2 text-primary" />
            </>
          ) : (
            <>
              Sélectionner une ou plusieurs activités...
            </>
          )}
        </div>
      </Button>
    </div>
  );
}