"use client";

import { Card, Row, Col, Button, Badge } from "react-bootstrap";
import { MapPin, Users, Building, BarChart3, Heart, Star, TrendingUp, Info } from "lucide-react";

export default function CompanyCard({ company }) {
  return (
    <Card className="company-card mb-4 border-0 shadow-sm hover-shadow">
      <Card.Body className="p-4">
        <Row className="align-items-start">
          <Col md={8}>
            <div className="company-info">
              {/* Header principal avec nom et badges */}
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="flex-grow-1 me-3">
                  <h4 className="mb-1 fw-bold company-name">
                    <a 
                      href={`/entreprise/${company.siren}`} 
                      className="text-decoration-none text-primary hover-underline"
                    >
                      {company.denomination}
                    </a>
                  </h4>
                  
                  {/* Secteur d'activité avec code NAF */}
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-muted small me-2">{company.activitePrincipaleLibelle}</span>
                    {company.activitePrincipaleCode && (
                      <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                        NAF {company.activitePrincipaleCode}
                      </span>
                    )}
                  </div>
                  
                  {/* Zone d'information consolidée */}
                  <div className="company-meta d-flex flex-wrap align-items-center gap-2 mb-3">
                    <Badge bg="light" text="dark" className="border">
                      SIREN {company.siren}
                    </Badge>
                    
                    {company.donneesPubliees && company.donneesPubliees.length > 0 && (
                      <Badge className="d-flex align-items-center" style={{ backgroundColor: '#198754', color: 'white' }}>
                        <TrendingUp size={12} className="me-1" />
                          Données publiées
                      </Badge>
                    )}
                    
              
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
                        <span className="fw-medium">{company.communeSiege}</span>
                      </div>
                    </div>
                  </Col>
                  
                  <Col sm={6} md={4}>
                    <div className="detail-item">
                      <Users size={16} className="text-muted me-2" />
                      <div className="d-inline">
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Effectif</small>
                        <span className="fw-medium">{company.trancheEffectifs || "Non communiqué"}</span>
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
          
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <div className="d-flex flex-column align-items-md-end h-100 justify-content-between">
              {/* Actions principales */}
              <div className="company-actions mb-3">
                <Button 
                  href={`/entreprise/${company.siren}`}
                  variant="secondary"
                  style={{ borderRadius: '0.5rem', minWidth: '180px' }}
                >
                    <BarChart3 size={16} className="me-2" />
                    Voir l'empreinte

                </Button>
              </div>
              
              {/* Indicateurs visuels */}
              <div className="indicators-visual p-2">
                <div className="d-flex justify-content-center gap-2 flex-wrap"
                     style={{ maxWidth: '200px', margin: '0 auto' }}>
                  
                  {/* Données publiées */}
                  {(company.donneesPubliees?.length || 0) > 0 && (
                    <div className="indicator-circle text-center">
                      <div className="indicator-base indicator-published">
                        {company.donneesPubliees.length}
                      </div>
                      <small className="text-muted indicator-label">
                        Publiés
                      </small>
                    </div>
                  )}

                  {/* Données estimées */}
                  {(company.donneesEstimees || 0) > 0 && (
                    <div className="indicator-circle text-center">
                      <div className="indicator-base indicator-light">
                        {company.donneesEstimees}
                      </div>
                      <small className="text-muted indicator-label">
                        Estimés
                      </small>
                    </div>
                  )}

                  {/* Données par défaut */}
                  {(company.donneesDefaut || 0) > 0 && (
                    <div className="indicator-circle text-center">
                      <div className="indicator-base indicator-light">
                        {company.donneesDefaut}
                      </div>
                      <small className="text-muted indicator-label">
                        Par défaut
                      </small>
                    </div>
                  )}

                  {/* Indicateurs hors panel ESE */}
                  {(company.indicateursHorsESE || 0) > 0 && (
                    <div className="indicator-circle text-center">
                      <div className="indicator-base indicator-light">
                        {company.indicateursHorsESE}
                      </div>
                      <small className="text-muted indicator-label">
                        Autres
                      </small>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}