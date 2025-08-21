"use client";

import { Card, Row, Col, Button, Badge } from "react-bootstrap";
import { MapPin, Users, Building, BarChart3, Heart, Star, TrendingUp } from "lucide-react";

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
                    <span className="text-muted me-2">{company.activitePrincipaleLibelle}</span>
                    {company.activitePrincipaleCode && (
                      <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                        NAF {company.activitePrincipaleCode}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Badges de statut */}
                <div className="company-badges flex-shrink-0">
                  {company.economieSocialeSolidaire && (
                    <span className="badge bg-success me-1 mb-1" title="Économie Sociale et Solidaire">
                      <Heart size={12} className="me-1" />ESS
                    </span>
                  )}
                  {company.societeMission && (
                    <span className="badge bg-purple me-1 mb-1" title="Société à mission" style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                      <Star size={12} className="me-1" />Mission
                    </span>
                  )}
                  {company.donneesPubliees && company.donneesPubliees.length > 0 && (
                    <span 
                      className={`badge me-1 mb-1 ${
                        company.donneesPubliees.length >= 5 ? 'bg-success' : 
                        company.donneesPubliees.length >= 3 ? 'bg-warning text-dark' : 'bg-info'
                      }`}
                      title={`${company.donneesPubliees.length} indicateur${company.donneesPubliees.length > 1 ? 's' : ''} publié${company.donneesPubliees.length > 1 ? 's' : ''}`}
                    >
                      <TrendingUp size={12} className="me-1" />
                      {company.donneesPubliees.length} indicateur{company.donneesPubliees.length > 1 ? 's' : ''}
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
                
                {/* SIREN en bas à droite */}
                <div className="mt-3 text-end">
                  <small className="text-muted">
                    SIREN: <span className="fw-bold">{company.siren}</span>
                  </small>
                </div>
              </div>
            </div>
          </Col>
          
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <div className="d-flex flex-column align-items-md-end h-100 justify-content-between">
              {/* Actions principales */}
              <div className="company-actions mb-3">
                <Button 
                  href={`/entreprise/${company.siren}`}
                  variant="primary"
                  className="btn-lg px-4"
                  style={{ borderRadius: '0.5rem' }}
                >
                  <BarChart3 size={16} className="me-2" />
                  Voir l'empreinte
                </Button>
              </div>
              
              {/* Indicateurs de qualité des données */}
              {company.donneesPubliees && company.donneesPubliees.length > 0 && (
                <div className="data-quality-info">
                  <div className="text-center">
                    <div className="d-flex justify-content-center align-items-center mb-2">
                      <div 
                        className="progress-circle" 
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `conic-gradient(#198754 ${(company.donneesPubliees.length / 12) * 360}deg, #e9ecef 0deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}
                      >
                        <div 
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            color: '#198754'
                          }}
                        >
                          {Math.round((company.donneesPubliees.length / 12) * 100)}%
                        </div>
                      </div>
                    </div>
                    <small className="text-muted">
                      Transparence des données
                    </small>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}