// La Société Nouvelle

//-- Bootstrap
import { Accordion, Row } from "react-bootstrap";

//-- Components
import { IndicatorChartContainer } from "./IndicatorDetails";
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
  indics: []
}]

export const ContentSocialFootprint = ({
  footprint,
  divisionFootprint,
  historicalDivisionFootprint,
  additionnalData,
}) => {

  return (
    <Row className="indic-details">
      <Accordion defaultActiveKey={[0,1,2,3]} alwaysOpen>
        {sections.map((section,index) => {
            return (
              <Accordion.Item eventKey={index}>
                <Accordion.Header as={"h3"}>{section.label}</Accordion.Header>
                <Accordion.Body>
                  <Row>
                  {section.indics.map((indic) =>
                    <IndicatorChartContainer
                      key={indic}
                      indic={indic}
                      footprint={footprint}
                      divisionFootprint={divisionFootprint}
                      historicalDivisionFootprint={historicalDivisionFootprint}
                    />
                  )}
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            )
          })}
        
        {/* {additionnalIndicatorsComponents.length > 0 && (
          <Accordion.Item eventKey="3">
            <Accordion.Header>Autres indicateurs disponibles</Accordion.Header>
            <Accordion.Body>
              <Row>{additionnalIndicatorsComponents}</Row>
            </Accordion.Body>
          </Accordion.Item>
        )} */}
      </Accordion>
    </Row>
  );
};
