"use client";

import { Card, Row, Col, Button, Badge } from "react-bootstrap";
import { MapPin, Users, Building, BarChart3, Heart, Star, TrendingUp, Info, CheckCircle, BadgeCheck, Calculator } from "lucide-react";
import { getEffectifLabel, getEffectifBadgeColor } from "@/_utils/effectifMapping";
import { hasPublishedOrEstimatedData } from "@/_utils/utils";

export default function CompanyCard({ company }) {
  return (
    <Card className="company-card mb-4  hover-shadow">
      <Card.Body className="p-4">
        <Row className="align-items-start">
          <Col md={8}>
            <div className="company-info">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="flex-grow-1 me-3">
                  <h4 className="mb-1 fw-bold company-name">
                    <a
                      href={`/entreprise/${company.siren}`}
                      className="text-decoration-none text-primary hover-underline"
                    >
                      {company.denomination}
                    </a>

                    {company.totalIndicators !== 0 && (
                      <span title="Données publiées">
                        <BadgeCheck size={20} className="text-success ms-1" />
                      </span>
                    )}
                  </h4>

                  {/* Secteur d'activité avec code NAF */}
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-muted small me-2">{company.activitePrincipaleLibelle}</span>
                    {company.activitePrincipaleCode && (
                      <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                        NAF {company.activitePrincipaleCode}
                      </span>
                    )}
                    <Badge bg="light" className="border">
                      SIREN {company.siren}
                    </Badge>
                  </div>


                </div>

                {/* Badges de statut */}
                <div className="company-badges flex-shrink-0">
                  {company.economieSocialeSolidaire && (
                    <span className="badge me-1 mb-1" title="Économie Sociale et Solidaire" style={{ backgroundColor: '#198754', color: 'white' }}>
                      ESS
                    </span>
                  )}
                  {company.societeMission && (
                    <span className="badge bg-purple me-1 mb-1" title="Société à mission" style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                      Société à mission
                    </span>
                  )}
                </div>
              </div>
              {/* Informations essentielles groupées */}
              <div className="company-details">
                <Row className="g-3">
                  <Col sm={6} md={4}>
                    <div className="detail-item">
                      <MapPin size={16} className="text-muted me-2" />
                      <div className="d-inline">
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Localisation</small>
                        <span className="fw-medium">{company.codeCommuneSiege} {company.communeSiege}</span>
                      </div>
                    </div>
                  </Col>

                  <Col sm={6} md={4}>
                    <div className="detail-item">
                      <Users size={16} className="text-muted me-2" />
                      <div className="d-inline">
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Effectif</small>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-medium">
                            {getEffectifLabel(company.trancheEffectifs)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col sm={6} md={4}>
                    <div className="detail-item">
                      <Building size={16} className="text-muted me-2" />
                      <div className="d-inline">
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Forme juridique</small>
                        <span className="fw-medium">{company.categorieJuridiqueLibelle}</span>
                      </div>
                    </div>
                  </Col>
                </Row>

              </div>
            </div>
          </Col>

          <Col md={4} className="company-footprint">

            {/* Indicateurs visuels */}
            <div className="indicators-visual p-2">

              {/* Données publiées */}
              {(company.publishedIndicators?.ese?.length || 0) > 0 && (
                <div className="indicator-circle text-center">
                  <div className="indicator-base indicator-published">
                    {company.publishedIndicators.ese.length}
                  </div>
                  <small className="text-muted indicator-label">
                    Indicateurs publiés
                  </small>
                </div>
              )}

              {/* Données estimées */}
              {company.estimatedIndicators?.length > 0 && (
                <div className="indicator-circle text-center">
                  <div className="indicator-base indicator-light">
                    {company.estimatedIndicators.length}
                  </div>
                  <small className="text-muted indicator-label">
                    Indicateurs estimés
                  </small>
                </div>
              )}

              {/* Indicateurs hors panel ESE */}
              {company.publishedIndicators?.external.length > 0 && (
                <div className="indicator-circle text-center">
                  <div className="indicator-base indicator-light">
                    {company.publishedIndicators.external.length}
                  </div>
                  <small className="text-muted indicator-label">
                    Autres indicateurs
                  </small>
                </div>
              )}


            </div>

            <div className="company-actions mb-3">
              {hasPublishedOrEstimatedData(company) ? (
                <Button
                  href={`/entreprise/${company.siren}`}
                  variant="secondary"
                  style={{ borderRadius: '0.5rem', minWidth: '200px' }}
                >
                  <BarChart3 size={16} className="me-2" />
                  Voir l'empreinte
                </Button>
              ) : (
                <Button
                  href={`/entreprise/${company.siren}`}
                  variant="outline-primary"
                  style={{ borderRadius: '0.5rem', minWidth: '200px' }}
                >
                  <Calculator size={16} className="me-2" />
                  Estimer l'empreinte
                </Button>
              )}
            </div>


          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}