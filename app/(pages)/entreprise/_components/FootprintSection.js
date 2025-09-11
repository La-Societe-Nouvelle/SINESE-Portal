"use client";

import { Card, Row, Col } from "react-bootstrap";
import { TrendingUp, Users, Leaf } from "lucide-react";
import { IndicatorChartContainer } from "@/_components/portal/IndicatorChartContainer";

export default function FootprintSection({
  footprint,
  divisionFootprint,
  historicalDivisionFootprint,
  additionnalData
}) {
  // Organisation des indicateurs ESE par catégorie
  const eseCategories = [
    {
      title: "Création de la valeur",
      description: "Indicateurs économiques et de création de valeur",
      indicators: ["ECO", "ART", "SOC"],
    },
    {
      title: "Empreinte sociale",
      description: "Impact social et égalité des chances",
      indicators: ["IDR", "GEQ", "KNW"],
    },
    {
      title: "Empreinte environnementale",
      description: "Impact environnemental et ressources",
      indicators: ["GHG", "NRG", "WAT", "MAT", "WAS", "HAZ"],
    }
  ];

  // Indicateurs additionnels (hors panel ESE)
  const additionalIndicators = ["IEP", "BEGES", "MIF"];

  const allData = { ...footprint, ...additionnalData };

  return (
    <div className="footprint-sections">
      {/* Section principale - Indicateurs ESE */}
      <Card className="mb-5">
        <Card.Header className="bg-light py-3 border-bottom">
          <h3 className="mb-1">
            Empreinte Sociétale et Environnementale
          </h3>
        </Card.Header>

        <Card.Body className="p-4">
          {eseCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-5">
              <div className="category-header mb-3 pb-2 border-bottom border-light">
                <h4 >{category.title}</h4>
              </div>

              <Row className="g-4">
                {category.indicators
                  .filter(indic => Object.keys(allData).includes(indic))
                  .map(indic => (
                    <IndicatorChartContainer
                      key={indic}
                      indic={indic}
                      legalUnitData={allData}
                      divisionData={divisionFootprint}
                      historicalDivisionFootprint={historicalDivisionFootprint}
                    />
                  ))
                }
              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Section secondaire - Données additionnelles */}
      {additionalIndicators.some(indic => Object.keys(allData).includes(indic)) && (
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header className="bg-light py-3 border-bottom">
            <h3 className="h6 mb-1 text-primary">
              Données additionnelles
            </h3>
            <small className="text-muted mb-0">
              Indicateurs complémentaires
            </small>
          </Card.Header>

          <Card.Body className="p-4">
            <Row className="g-4">
              {additionalIndicators
                .filter(indic => Object.keys(allData).includes(indic))
                .map(indic => (
                  <IndicatorChartContainer
                    key={indic}
                    indic={indic}
                    legalUnitData={allData}
                    divisionData={divisionFootprint}
                    historicalDivisionFootprint={historicalDivisionFootprint}
                  />
                ))
              }
            </Row>
          </Card.Body>
        </Card>
      )}

    </div>
  );
}