
"use client";

import { Container, Row, Col, Card } from 'react-bootstrap';
import PageHeader from '@/_components/PageHeader';

export default function MentionsLegales() {
  return (
    <div className="open-data-portal">
      <PageHeader 
        title="Mentions légales" 
        variant='compact'
        subtitle="Informations légales concernant La Société Nouvelle et le portail SINESE."
        path="mentions-legales" 
        icon={
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8l4-4 4 4zm-2-7V3.5L18.5 9H14z"/>
          </svg>
        }
      />
      
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>

            {/* Entreprise */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h3 className="text-primary mb-4 d-flex align-items-center">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V8.5L21 9ZM3 9V7L9 8.5V6.5L3 9ZM15 20.93C14.5 20.75 14 20.5 13.5 20.14L12 19.5L10.5 20.14C10 20.5 9.5 20.75 9 20.93V22H15V20.93Z"/>
                  </svg>
                  La Société Nouvelle
                </h3>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <strong className="text-muted small">Forme juridique</strong>
                    <p className="mb-0">SAS au capital de 1 000 €</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong className="text-muted small">SIREN</strong>
                    <p className="mb-0">889 182 770</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong className="text-muted small">Siège social</strong>
                    <p className="mb-0">165 avenue de Bretagne<br />59000 LILLE</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong className="text-muted small">Responsable</strong>
                    <p className="mb-0">Sylvain HUMILIERE</p>
                  </div>
                  <div className="col-12">
                    <strong className="text-muted small">Contact</strong>
                    <p className="mb-0">
                      <a href="mailto:contact@lasocietenouvelle.org" className="text-secondary">
                        contact@lasocietenouvelle.org
                      </a>
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Hébergement */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h3 className="text-primary mb-4 d-flex align-items-center">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                    <path d="M4.93 4.93l1.41 1.41C8.1 4.57 10.5 3 12 3c1.5 0 3.9 1.57 5.66 3.34l1.41-1.41C16.9 2.76 14.5 1 12 1S7.1 2.76 4.93 4.93zM12 7c-1.11 0-2.11.45-2.83 1.17L12 11l2.83-2.83C14.11 7.45 13.11 7 12 7zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                  </svg>
                  Hébergement
                </h3>
                
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h5 className="mb-2">Vercel Inc.</h5>
                    <address className="text-muted mb-0">
                      340 S Lemon Ave #4133<br />
                      Walnut, CA 91789<br />
                      États-Unis
                    </address>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <a 
                      href="https://vercel.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-flex align-items-center"
                      style={{ width: 'fit-content', marginLeft: 'auto' }}
                    >
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="me-1">
                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                      </svg>
                      vercel.com
                    </a>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
