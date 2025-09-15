// La Société Nouvelle

import React from "react";

//-- Bootstrap
import { Accordion, Row } from "react-bootstrap";

//-- Components
import { IndicatorChartContainer } from "./IndicatorChartContainer";
import { AdditionnalIndicatorDetails } from "./AdditionnalIndicatorDetails";

/** Visualisation des indicateurs de l'Empreinte Sociétale
 * 
 */

// --------------------------------------------------
// Répartition des indicateurs

const sections = [{
  label: "Création de la valeur",
  indics: ["ECO", "ART", "SOC"]
},{
  label: "Empreinte sociale",
  indics: ["IDR", "GEQ", "KNW"]
},{
  label: "Empreinte environnementale",
  indics: ["GHG", "NRG", "WAT", "MAT", "WAS", "HAZ"]
},{
  label: "Autres indicateurs disponibles",
  indics: ["IEP","BEGES","MIF"]
}]

export const ContentSocialFootprint = ({
  footprint,
  divisionFootprint,
  historicalDivisionFootprint,
  additionnalData,
}) => {

  console.log(additionnalData);
  const legalUnitData = {
    ...footprint,
    ...additionnalData
  };

  return (
    <Row className="indic-details">
      <Accordion defaultActiveKey={[0,1,2,3]} alwaysOpen>
        {sections.map((section,index) => 
          <Accordion.Item eventKey={index} key={index}>
            <Accordion.Header as={"h3"}>{section.label}</Accordion.Header>
            <Accordion.Body>
              <Row>
              {section.indics
                .filter((indic) => Object.keys(legalUnitData).includes(indic))
                .map((indic) =>
                  <IndicatorChartContainer
                    key={indic}
                    indic={indic}
                    legalUnitData={legalUnitData}
                    divisionData={divisionFootprint}
                    historicalDivisionFootprint={historicalDivisionFootprint}
                  />
                )}
              </Row>
            </Accordion.Body>
          </Accordion.Item>
          )}
      </Accordion>
    </Row>
  );
};
