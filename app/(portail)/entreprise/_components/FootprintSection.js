"use client";

import { Card, Row, Col } from "react-bootstrap";
import { TrendingUp, Users, Leaf, Info } from "lucide-react";
import { IndicatorChartContainer } from "@/_components/portal/IndicatorChartContainer";
import DefaultDataExplanation from "./DefaultDataExplanation";
import Link from "next/link";

export default function FootprintSection({
  hasDefaultData,
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

          {
            hasDefaultData && (
              <div className="mb-4 p-4 shadow-sm bg-light">
                <div className="d-flex align-items-center justify-content-start mb-2">
                  <Info size={16} className=" me-2" />
                  <h3 className="h6 mb-0 ">Données sectorielles utilisées</h3>
                </div>
                <p className="text-muted mb-0 " style={{ fontSize: '0.8rem' }}>
                  Certains indicateurs utilisent des <b>

                    <Link href="https://www.lasocietenouvelle.org/docs/donnees-par-defaut" target="_blank" rel="noopener noreferrer" >
                      valeurs sectorielles par défaut
                    </Link>
                  </b>
                  calculées à partir de données statistiques nationales. Ces estimations permettent
                  d'évaluer l'empreinte sociétale même sans données spécifiques de l'entreprise.
                  Les valeurs par défaut sont établies selon l'activité principale (code NAF),
                  les effectifs et d'autres caractéristiques de l'entreprise.
                </p>
                <p className="mt-3 mb-2 fw-medium" style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
                  <b>Vous êtes dirigeant de cette entreprise ? </b>
                  <Link href="https://publication.sinese.fr/" target="_blank" rel="noopener noreferrer">Publiez vos données réelles</Link> pour améliorer la précision de votre empreinte sociétale.
                </p>
              </div>

            )
          }

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