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
      <Card className={`indicator-card h-100 ${flag === 'd' ? 'indicator-card-default' : ''}`}>
        <Card.Header className="bg-light border-bottom py-3">
          {/* ODDs en haut */}
          <div className="d-flex flex-wrap gap-1 align-items-center mb-2">
            <div className="indicator-icon me-2">
              {inEmpreinteSocietale ? (
                <Image
                  width="30"
                  height="30"
                  src={"/ESE/icon-ese-bleues/" + indic.toLowerCase() + ".svg"}
                  alt={indic}
                />
              ) : (
                <Image
                  width="30"
                  height="30"
                  src={logoPath}
                  alt={indic}
                />
              )}
            </div>

            {odds.map((odd) => (
              <img
                key={odd}
                src={`/images/odd/F-WEB-Goal-${odd}.png`}
                width={20}
                height={20}
                alt={`ODD ${odd}`}
              />
            ))}
          </div>



          <div className="indicator-header">
            <h5 className="indicator-title">{libelle}</h5>
          </div>
        </Card.Header>

        <Card.Body className="p-3">


          {/* Graphique */}
          <div className="chart-container mb-2">
            <IndicatorChart
              indic={indic}
              legalUnitData={legalUnitData}
              divisionData={divisionData}
            />
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-center gap-5 align-items-center mb-3 ">
            <button
              onClick={() => setModalOpen(indic)}
              className="small btn btn-primary btn-sm d-flex align-items-center "
            >
              <Eye size={14} className="me-1" />
              Voir détails
            </button>

            <a
              href={`https://lasocietenouvelle.org/indicateurs/${indic.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn small btn-light btn-sm d-flex align-items-center"
            >
              <ExternalLink size={10} className="me-1" />
              En savoir plus
            </a>
          </div>

          {/* Source */}
          {divisionData[indic] && (
            <div className="text-center">
              <span className="text-muted" style={{ fontSize: '9px', opacity: 0.7 }}>
                Source (Valeur de la branche) : {divisionData[indic].source}
              </span>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ----- Modal - Détails ----- */}
      {modalOpen == indic && (
        <Modal show={true} onHide={() => setModalOpen(null)} centered size="lg" className="indicator-details-modal">
          <Modal.Header closeButton className="border-0 pb-0">
            <div className="d-flex align-items-center w-100">
              <div className="indicator-modal-icon me-3">
                {inEmpreinteSocietale ? (
                  <Image
                    width="40"
                    height="40"
                    src={"/ESE/icon-ese-bleues/" + indic.toLowerCase() + ".svg"}
                    alt={indic}
                  />
                ) : (
                  <Image
                    width="40"
                    height="40"
                    src={logoPath}
                    alt={indic}
                  />
                )}
              </div>
              <div className="flex-grow-1">
                <Modal.Title className="mb-1 text-primary">{libelle}</Modal.Title>
        
              </div>
            </div>
          </Modal.Header>
          <Modal.Body className="px-4 py-3">
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