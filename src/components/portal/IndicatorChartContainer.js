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
    <Col key={indic} className="my-4" lg={4}>
      <div className="p-3 border border-1 rounded-1 shadow-sm">
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
              src={inEmpreinteSocietale ? "/ESE/icon-ese-bleues/" + indic.toLowerCase() + ".svg" : logoPath}
              alt={indic}
            />
          </div>
          <div>
            <h3 className="h6">{libelle}</h3>
            <p className="source mt-1">{unitLabel}</p>
            {/* <p className="source mt-1">
              <a
                href={"https://lasocietenouvelle.org/indicateurs/" + indic.toLowerCase()}
                target="_blank"
                className="text-primary"
                title="Plus d'informations sur l'indicateur"
              >
                Informations sur l'indicateur &raquo;
              </a>
            </p> */}
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
        <div className="chart-wrapper my-4">
          {/* <p className="source ms-3 mb-2">en {unitSymbol}</p> */}
          <IndicatorChart
            indic={indic}
            legalUnitData={legalUnitData}
            divisionData={divisionData}
          />
        </div>
        {/* ----- Badge ----- */}
        {/* <div className="mb-3 d-flex justify-content-evenly">
          <FlagBadge 
            flag={flag} 
          />
        </div> */}
        {/* ----- Sources ----- */}
        {divisionData[indic] &&
          <div className="mt-2">
            <p className="source mb-0">
              Source (Valeur de la branche) : {divisionData[indic].source}
            </p>
          </div>}
      </div>

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