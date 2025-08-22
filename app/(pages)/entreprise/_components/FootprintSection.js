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
      icon: <TrendingUp size={24} className="text-success" />,
      description: "Indicateurs économiques et de création de valeur",
      indicators: ["ECO", "ART", "SOC"],
      color: "success"
    },
    {
      title: "Empreinte sociale", 
      icon: <Users size={24} className="text-info" />,
      description: "Impact social et égalité des chances",
      indicators: ["IDR", "GEQ", "KNW"],
      color: "info"
    },
    {
      title: "Empreinte environnementale",
      icon: <Leaf size={24} className="text-warning" />,
      description: "Impact environnemental et ressources",
      indicators: ["GHG", "NRG", "WAT", "MAT", "WAS", "HAZ"],
      color: "warning"
    }
  ];

  // Indicateurs additionnels (hors panel ESE)
  const additionalIndicators = ["IEP", "BEGES", "MIF"];

  const allData = { ...footprint, ...additionnalData };

  return (
    <div className="footprint-sections">
      {/* Section principale - Indicateurs ESE */}
      <Card className="mb-5 shadow-sm border-0">
        <Card.Header className="bg-light py-3 border-bottom">
          <h2 className="h4 mb-1 text-primary">
          
            Empreinte Sociétale et Environnementale
          </h2>
   
        </Card.Header>
        
        <Card.Body className="p-4">
          {eseCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-5">
              <div className="category-header mb-3 pb-2 border-bottom border-light">
                <div className="d-flex align-items-center">
                  {category.icon}
                  <div className="ms-2">
                    <h3 className="h6 mb-0 fw-semibold">{category.title}</h3>
                    <small className="text-muted">{category.description}</small>
                  </div>
                </div>
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