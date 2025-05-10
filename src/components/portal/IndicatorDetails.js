// La Société Nouvelle

//-- React
import { useState } from "react";

//-- Bootstrap
import { Badge, Button, Col, Image, Modal } from "react-bootstrap";

//-- Packages
import _ from "lodash";

//-- Charts
import { IndicatorChart } from "../charts/IndicatorChart";
import FootprintDataChart from "../charts/FootprintDataChart";
import HistoricalDataChart from "../charts/HistoricalDatachart";

//-- Utils
import FlagBadge from "./FlagBadges";

//-- Libs
import metaIndics from "../../lib/indics.json";
import { InformationDetailsModal } from "./InformationDetailsModal";

/* Basic indicator view */

export const IndicatorChartContainer = ({
  indic,
  footprint,
  divisionFootprint,
  historicalData,
  historicalDivisionFootprint
}) => {
  // --------------------------------------------------
  // Metadonnées

  const metaIndic = metaIndics[indic];
  const {
    libelle,
    odds,
    unitSymbol,
    nbDecimals
  } = metaIndics[indic];

  // --------------------------------------------------
  // State
  
  const [modalOpen, setModalOpen] = useState(null);
  const [showHistoricalChart, setShowHistoricalChart] = useState(false);
  
  // --------------------------------------------------

  const {
    value,
    year,
    flag
  } = footprint[indic]
  
  return (
    <Col key={indic} className="my-4" lg={4}>
      <div className="p-3 border border-3 rounded-3">
        {/* ----- Liste des ODDs ----- */}
        <div className="odds d-flex gap-1 w-100 mb-3">
          {odds.map((odd) => (
            <img
              key={odd}
              src={`/images/odd/F-WEB-Goal-${odd}.png`}
              width={25}
              height={25}
              alt={`Odd ${odd}`}
            />
          ))}
        </div>
        {/* ----- Icone + Titre de l'indicateur / Lien vers la documentation ----- */}
        <div className="indic-title">
          <div className="indic-icon">
            <Image
              height="20px"
              src={"/ESE/icon-ese-bleues/" + indic.toLowerCase() + ".svg"}
              alt={indic}
            />
          </div>
          <div>
            <h3 className="h6">{libelle}</h3>
            <p className="source mt-1">
              <a
                href={"https://lasocietenouvelle.org/indicateurs/" + indic.toLowerCase()}
                target="_blank"
                className="text-primary"
                title="Plus d'informations sur l'indicateur"
              >
                Informations sur l'indicateur &raquo;
              </a>
            </p>
          </div>
        </div>
        {/* ----- Affichage modale avec le détail ----- */}
        <div className={"text-end"}>
          <Badge
            pill
            bg="light"
            className="ms-2 text-primary"
            title="Plus de détails"
          >
            <i className="bi bi-plus-circle-fill"></i>{" "}
            <button className="btn-badge" onClick={() => setModalOpen(indic)}>
              Détails &raquo;
            </button>
          </Badge>
        </div>
        {/* ----- Affichage graphique ----- */}
        <div>
          <p className="source mt-3 mb-0 fw-bold">{unitSymbol}</p>
          <div className="chart-wrapper">
            <IndicatorChart
              indic={indic}
              value={value}
              comparativeValue={divisionFootprint[indic].value}
              unit={unitSymbol}
              flag={flag}
              year={year}
            />
          </div>
        </div>
        {/* ----- Badge ----- */}
        <div className="mb-3 d-flex justify-content-evenly">
          <FlagBadge 
            flag={flag} 
          />
        </div>
        {/* ----- Sources ----- */}
        <div className="mt-2">
          <p className="source mb-0">
            Source (Valeur de la branche) : {divisionFootprint[indic].source}
          </p>
        </div>
      </div>

      {/* ----- Modal - Détails ----- */}
      {modalOpen == indic && (
        <Modal show={true} onHide={() => setModalOpen(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="text-center">{libelle} </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-white rounded-3 mx-3">
            <InformationDetailsModal
              indic={indic}
              footprint={footprint}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(null)}
            >
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Col>
  );
};