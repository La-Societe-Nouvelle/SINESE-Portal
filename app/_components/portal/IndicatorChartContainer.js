// La Société Nouvelle

//-- React
import { useState } from "react";

//-- Bootstrap
import { Badge, Button, Col, Image, Modal, Card } from "react-bootstrap";
import { Info, ExternalLink, Eye } from "lucide-react";

//-- Charts
import { IndicatorChart } from "../charts/IndicatorChart";

//-- Utils
import FlagBadge from "./FlagBadges";

//-- Libs
import metaIndics from "@/_libs/indics";
import { InformationDetailsModal } from "./InformationDetailsModal";

/* Basic indicator view */

export const IndicatorChartContainer = ({
  indic,
  legalUnitData,
  divisionData,
  historicalData,
  historicalDivisionFootprint
}) => {
  // --------------------------------------------------
  // Metadonnées

  const {
    inEmpreinteSocietale,
    libelle,
    odds,
    unitLabel,
    logoPath
  } = metaIndics[indic];

  // --------------------------------------------------
  // State
  
  const [modalOpen, setModalOpen] = useState(null);
  const [showHistoricalChart, setShowHistoricalChart] = useState(false);
  
  // --------------------------------------------------

  const {
    flag
  } = legalUnitData[indic]
  
  return (
    <Col key={indic} className="mb-4" lg={4}>
      <Card className="h-100 shadow-sm border-0" style={{ transition: 'transform 0.2s ease' }}>
        <Card.Header className="bg-light border-bottom py-3">
          {/* ODDs en haut */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {odds.map((odd) => (
              <img
                key={odd}
                src={`/images/odd/F-WEB-Goal-${odd}.png`}
                width={24}
                height={24}
                alt={`ODD ${odd}`}
              />
            ))}
          </div>
          
          {/* Indicateur et flag */}
          <div className="d-flex align-items-center justify-content-center">
            <div className="indicator-icon me-3">
              {inEmpreinteSocietale ? (
                <Image
                  width="28"
                  height="28"
                  src={"/ESE/icon-ese-bleues/" + indic.toLowerCase() + ".svg"}
                  alt={indic}
                />
              ) : (
                <Image
                  width="28"
                  height="28"
                  src={logoPath}
                  alt={indic}
                />
              )}
            </div>
            <div className="text-center">
              <h4 className="h6 mb-1 fw-semibold text-primary">{libelle}</h4>
              <FlagBadge flag={flag} />
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-3">
          {/* Titre et unité */}
          <p className="indicator-info mb-3">
            <small className="text-muted small">{unitLabel}</small>
          </p>

          {/* Graphique */}
          <div className="chart-container mb-3">
            <IndicatorChart
              indic={indic}
              legalUnitData={legalUnitData}
              divisionData={divisionData}
            />
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <button
              onClick={() => setModalOpen(indic)}
              className="btn btn-link btn-sm d-flex align-items-center"
            >
              <Eye size={12} className="me-1" />
              Voir détails
            </button>
            
            <a
              href={`https://lasocietenouvelle.org/indicateurs/${indic.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-link btn-link-muted d-flex align-items-center"
            >
              <ExternalLink size={10} className="me-1" />
              En savoir plus
            </a>
          </div>

          {/* Source */}
          {divisionData[indic] && (
            <div className="text-center">
              <span className="text-muted" style={{ fontSize: '9px', opacity: 0.7 }}>
                Source : {divisionData[indic].source}
              </span>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ----- Modal - Détails ----- */}
      {modalOpen == indic && (
        <Modal show={true} onHide={() => setModalOpen(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="text-center">{libelle} </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-white rounded-2 mx-3 mb-3">
            <InformationDetailsModal
              indic={indic}
              footprint={legalUnitData}
            />
          </Modal.Body>
        </Modal>
      )}
    </Col>
  );
};