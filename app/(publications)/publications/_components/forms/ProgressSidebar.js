"use client";
import { useState, Fragment } from "react";
import { Building, FileText, BarChart3, AlertTriangle, ChevronRight } from "lucide-react";
import { Col, ListGroup, ProgressBar, Badge } from "react-bootstrap";

const LUCIDE_ICONS = { Building, FileText, BarChart3 };

export default function ProgressSidebar({ 
  steps, 
  currentStep, 
  currentStepIndex, 
  handleStepChange, 
  errors, 
  completedEseIndicators, 
  totalEseIndicators, 
  completedSupplementaryIndicators, 
  totalSupplementaryIndicators,
  selectedLegalUnit,
  selectedYear
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const activeStep = steps[currentStepIndex];
  
  // Check if user can navigate to other steps
  const canNavigate = selectedLegalUnit && selectedYear;

  return (
    <Col md={3} className="progress-sidebar">
      {/* Mobile: compact dropdown-style selector */}
      <div className="progress-sidebar-mobile">
        <button
          className="progress-sidebar-mobile-toggle"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          aria-expanded={mobileExpanded}
        >
          <span className="d-flex align-items-center gap-2">
            {activeStep?.icon && (() => {
              const IC = LUCIDE_ICONS[activeStep.icon];
              return IC ? <IC size={16} /> : null;
            })()}
            <span>Étape {currentStepIndex + 1}/{steps.length} — {activeStep?.label}</span>
          </span>
          <ChevronRight size={16} className={`sidebar-mobile-chevron ${mobileExpanded ? "expanded" : ""}`} />
        </button>
        {mobileExpanded && (
          <div className="progress-sidebar-mobile-menu">
            {steps.map((step, idx) => {
              if (step.disabled) return null;
              const hasError = !!errors[step.key];
              const isActive = currentStep === step.key;
              const IconComponent = step.icon ? LUCIDE_ICONS[step.icon] : null;
              const isOptional = step.key === "formIndicateurs" || step.key === "formRapport";
              const isDisabled = step.key !== "formEntreprise" && !canNavigate;

              return (
                <button
                  key={step.key}
                  className={`progress-sidebar-mobile-item ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                  onClick={() => { 
                    if (!isDisabled) {
                      handleStepChange(step.key);
                      setMobileExpanded(false);
                    }
                  }}
                  disabled={isDisabled}
                >
                  {IconComponent && <IconComponent size={16} />}
                  <span className="flex-grow-1">{step.label}</span>
                  {isOptional && <Badge bg="light" text="muted" className="optional-badge-sm">Optionnel</Badge>}
                  {hasError && <AlertTriangle size={14} className="text-danger" />}
                </button>
              );
            })}
          </div>
        )}
        <ProgressBar
          now={((currentStepIndex + 1) / steps.length) * 100}
          className="mt-2"
        />
      </div>

      {/* Desktop: full sidebar */}
      <div className="progress-sidebar-desktop">
        <ListGroup variant="flush" className="mb-3">
          {steps.map((step) => {
            const hasError = !!errors[step.key];
            const isActive = currentStep === step.key;
            const IconComponent = step.icon ? LUCIDE_ICONS[step.icon] : null;
            const isOptional = step.key === "formIndicateurs" || step.key === "formRapport";
            const isDisabled = step.key !== "formEntreprise" && !canNavigate;

            if (step.disabled) return null;

            return (
              <Fragment key={step.key}>
                <ListGroup.Item
                  action={!isDisabled}
                  active={isActive}
                  onClick={() => !isDisabled && handleStepChange(step.key)}
                  className={`d-flex align-items-center ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                  style={{ cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.5 : 1 }}
                >
                  {IconComponent && <IconComponent size={18} className="me-2" />}
                  <span className="flex-grow-1">
                    {step.label}
                  </span>
                  {hasError && (
                    <AlertTriangle size={16} className="text-danger" title="Erreur sur cette étape" />
                  )}
                </ListGroup.Item>
                {step.key === "formIndicateurs" && isActive && (
                  <>
                    <ListGroup.Item className="ps-5 small text-muted d-flex align-items-center">
                      <span className="flex-grow-1">Indicateurs ESE</span>
                      <Badge bg="secondary" className="ms-2">
                        {completedEseIndicators}/{totalEseIndicators}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="ps-5 small text-muted d-flex align-items-center">
                      <span className="flex-grow-1">Autres indicateurs</span>
                      <Badge bg="secondary" className="ms-2">
                        {completedSupplementaryIndicators}/{totalSupplementaryIndicators}
                      </Badge>
                    </ListGroup.Item>
                  </>
                )}
              </Fragment>
            );
          })}
        </ListGroup>

        <ProgressBar
          now={((currentStepIndex + 1) / steps.length) * 100}
          className="mt-2"
        />
      </div>
    </Col>
  );
}
