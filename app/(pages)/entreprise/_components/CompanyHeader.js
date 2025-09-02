"use client";

import { Badge, Row, Col, Alert } from "react-bootstrap";
import { Building, MapPin, Users, Heart, Star, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function CompanyHeader({ legalUnit }) {
  if (!legalUnit) return null;

  return (
    <div className="p-4 rounded-3 shadow-sm mb-4 border-light">
      <div className="company-alerts mb-3">
        {!legalUnit.statutdiffusion && (
          <Alert variant="warning" className="py-2 mb-3">
            <AlertTriangle size={16} className="me-2" />
            <small>Diffusion partielle - Informations limitées</small>
          </Alert>
        )}


      </div>

      <Row className="g-4">
        <Col lg={8}>
          {/* Informations essentielles */}
          <div className="company-details">
            <Row className="g-3">
              <Col md={4}>
                <div className="detail-group">
                  <div className="d-flex align-items-center mb-1">
                    <Building size={16} className="text-muted me-2" />
                    <small className="text-muted">SIREN</small>
                  </div>
                  <div className="fw-medium">{legalUnit.siren}</div>
                </div>
              </Col>

              <Col md={4}>
                <div className="detail-group">
                  <div className="d-flex align-items-center mb-1">
                    <MapPin size={16} className="text-muted me-2" />
                    <small className="text-muted">Siège</small>
                    {console.log(legalUnit)}
                  </div>
                  <div className="fw-medium">
                    {legalUnit.statutdiffusion
                      ? `${legalUnit.codeCommuneSiege} ${legalUnit.communeSiege}`
                      : legalUnit.communeSiege}
                  </div>
                </div>
              </Col>

              <Col md={4}>
                <div className="detail-group">
                  <div className="d-flex align-items-center mb-1">
                    <Users size={16} className="text-muted me-2" />
                    <small className="text-muted">Activité</small>
                  </div>
                  <div className="fw-medium small">
                    {legalUnit.activitePrincipaleLibelle}
                  </div>
                  <small className="badge bg-light-blue text-dark border mt-1">
                    NAF {legalUnit.activitePrincipaleCode}
                  </small>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
        {(
          legalUnit.societeMission || legalUnit.economieSocialeSolidaire || legalUnit.hasCraftedActivities
        ) && (
            <Col lg={4}>
              {/* Badges et statuts spéciaux */}
              <div className="company-badges">
                <small className="text-muted d-block mb-2">Statuts particuliers:</small>
                <div className="d-flex flex-wrap gap-2">
                  {legalUnit.societeMission && (
                    <Badge className="d-flex align-items-center" style={{ backgroundColor: '#6f42c1', color: 'white' }}>
                      <Star size={12} className="me-1" />
                      Société à mission
                    </Badge>
                  )}
                  {legalUnit.economieSocialeSolidaire && (
                    <Badge className="d-flex align-items-center" style={{ backgroundColor: '#198754', color: 'white' }}>
                      <Heart size={12} className="me-1" />
                      ESS
                    </Badge>
                  )}
                  {legalUnit.hasCraftedActivities && (
                    <Badge bg="info" className="d-flex align-items-center">
                      <CheckCircle2 size={12} className="me-1" />
                      Artisan
                    </Badge>
                  )}

                </div>
              </div>
            </Col>
          )
        }


      </Row>
    </div>
  );
}