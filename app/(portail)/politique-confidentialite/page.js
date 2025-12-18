"use client";

import React from "react";
import PageHeader from "@/_components/PageHeader";
import { Container, Row, Col, Card } from "react-bootstrap";

export default function PolitiqueConfidentialite() {
  return (
    <div className="open-data-portal">
      <PageHeader
        title="Politique de confidentialité"
        subtitle="Protection et utilisation de vos données personnelles sur le portail SINESE conformément au RGPD."
        path="politique-confidentialite"
        variant="compact"
        icon={
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
        }
      />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>

            {/* Préambule */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h3 className="text-primary mb-4 d-flex align-items-center">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  Préambule
                </h3>
                <p className="mb-3">
                  Cette politique de confidentialité s'applique au site{" "}
                  <a href="https://lasocietenouvelle.org" className="text-secondary">
                    lasocietenouvelle.org
                  </a>.
                </p>
                <p className="mb-0">
                  Cette politique explique comment les données personnelles sont collectées, 
                  utilisées et protégées lorsque vous utilisez notre formulaire de contact 
                  ou publiez l'empreinte sociétale d'une entreprise, conformément au 
                  Règlement général sur la protection des données (RGPD).
                </p>
              </Card.Body>
            </Card>

            {/* Collecte des données */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h3 className="text-primary mb-4 d-flex align-items-center">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                    <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-5H18V4h-2V2H8v2H6v2H3.5v2L5 7h14l1.5-2v-2z"/>
                  </svg>
                  Collecte des données personnelles
                </h3>
                
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <h5 className="text-secondary mb-3">Formulaire de contact</h5>
                    <ul className="list-unstyled">
                      <li className="mb-2 d-flex align-items-start">
                        <svg width="12" height="12" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span className="small">Nom et prénom</span>
                      </li>
                      <li className="mb-2 d-flex align-items-start">
                        <svg width="12" height="12" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span className="small">Adresse e-mail</span>
                      </li>
                      <li className="mb-2 d-flex align-items-start">
                        <svg width="12" height="12" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span className="small">Sujet de la demande</span>
                      </li>
                      <li className="d-flex align-items-start">
                        <svg width="12" height="12" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span className="small">Contenu du message</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="col-md-6">
                    <h5 className="text-secondary mb-3">Publication d'empreinte</h5>
                    <ul className="list-unstyled">
                      <li className="mb-2 d-flex align-items-start">
                        <svg width="12" height="12" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span className="small">Nom et prénom</span>
                      </li>
                      <li className="mb-2 d-flex align-items-start">
                        <svg width="12" height="12" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span className="small">Adresse e-mail</span>
                      </li>
                      <li className="d-flex align-items-start">
                        <svg width="12" height="12" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                          <circle cx="12" cy="12" r="2"/>
                        </svg>
                        <span className="small">Numéro SIREN</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Utilisation et conservation */}
            <div className="row mb-4">
              <div className="col-md-6 mb-4 mb-md-0">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <h4 className="text-primary mb-3 d-flex align-items-center">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                      Utilisation
                    </h4>
                    <p className="small mb-2">
                      Les données du formulaire de contact sont utilisées uniquement pour répondre à votre demande.
                    </p>
                    <p className="small mb-2">
                      Les données personnelles liées à la publication restent confidentielles.
                    </p>
                    <p className="small mb-0">
                      Aucune donnée personnelle n'est divulguée à des tiers sans consentement.
                    </p>
                  </Card.Body>
                </Card>
              </div>
              
              <div className="col-md-6">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <h4 className="text-primary mb-3 d-flex align-items-center">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Conservation
                    </h4>
                    <p className="small mb-2">
                      Conservation le temps nécessaire pour répondre à votre demande.
                    </p>
                    <p className="small mb-2">
                      Suppression sécurisée lorsque les données ne sont plus nécessaires.
                    </p>
                    <p className="small mb-0">
                      Données d'empreinte conservées sauf demande de suppression.
                    </p>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Vos droits */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h3 className="text-primary mb-4 d-flex align-items-center">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  Vos droits
                </h3>
                
                <p className="mb-3">
                  Conformément à la Loi Informatique et Libertés du 6 janvier 1978, 
                  vous disposez d'un droit d'accès, de rectification, d'opposition 
                  et de limitation de vos données personnelles.
                </p>
                
                <div className="p-3 rounded" style={{ backgroundColor: '#f8f9fc', border: '1px solid #e9ecf3' }}>
                  <h6 className="text-secondary mb-2">Pour exercer vos droits :</h6>
                  <p className="mb-0 small">
                    <svg width="16" height="16" fill="#3b4d8f" viewBox="0 0 24 24" className="me-2">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Contactez-nous à{" "}
                    <a href="mailto:support@lasocietenouvelle.org" className="text-secondary fw-semibold">
                      support@lasocietenouvelle.org
                    </a>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
