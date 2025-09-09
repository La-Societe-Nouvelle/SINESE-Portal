"use client";

import { Container, Row, Col, Image } from "react-bootstrap";
import PageHeader from "../../_components/PageHeader";

export default function Newsletter() {
  return (
    <div className="open-data-portal">
      <PageHeader
        title="Newsletter"
        subtitle="Recevez nos actualités sur l'empreinte sociétale, les données ouvertes et les nouveautés du portail SINESE."
        path="newsletter"
        variant="minimal"
        icon={
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        }
      />
      <Container className="pb-5">
        <div style={{
          background: 'white',
          border: '1px solid #e9ecf3',
          borderRadius: '0.75rem',
          padding: '1rem',
          boxShadow: '0 2px 12px rgba(59, 77, 143, 0.08)',
          overflow: 'hidden'
        }}>



          <Row className="align-items-center">
            {/* Formulaire newsletter */}
            <Col lg={7} className="mb-4 mb-lg-0">
              <div>
                <div className="d-flex align-items-center mb-3 px-3 pt-2">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#3b4d8f20',
                      color: '#3b4d8f'
                    }}
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                  <h4 className="text-primary mb-0">Inscription newsletter</h4>
                </div>

                <iframe
                  width="100%"
                  height="800px"
                  src="https://a2dec458.sibforms.com/serve/MUIEAE87cWMEBduAwTKh6kNCKZRFF4iVG4F1d0WT5TuD4LYdWSn_LdL8FHgC0SuDGKSKe7PVrx-vcOQn8KwHR6JmimxBzdH7seeIYDD_5K31DYP3Y-qGV8gcbVSHehd2qWU8j90PIYaydyKOEGO6S_ijEsBCiialfd2BEvM6AB8_FZXMOJgtsFu6sOOtOd7zLqnu4tEIEE8HEHTc"
                  frameBorder="0"
                  style={{ borderRadius: '0.5rem' }}
                />
              </div>
            </Col>

            {/* Illustration et avantages */}
            <Col lg={5}>
              <div className="text-center mb-4">
                <Image
                  fluid
                  src="illustrations/newsletter.svg"
                  alt="Newsletter illustration"
                  style={{ maxHeight: '300px' }}
                />
              </div>

              {/* Avantages */}
              <div className="ps-lg-4">
                <h5 className="text-primary mb-3">Pourquoi s'abonner ?</h5>
                <div className="mb-3 d-flex align-items-start">
                  <svg width="16" height="16" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <small className="text-muted">
                    <strong>Nouveautés du portail</strong> - Nouvelles fonctionnalités et indicateurs
                  </small>
                </div>
                <div className="mb-3 d-flex align-items-start">
                  <svg width="16" height="16" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <small className="text-muted">
                    <strong>Actualités RSE</strong> - Évolutions réglementaires et bonnes pratiques
                  </small>
                </div>
                <div className="mb-3 d-flex align-items-start">
                  <svg width="16" height="16" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <small className="text-muted">
                    <strong>Données ouvertes</strong> - Nouveaux jeux de données et analyses
                  </small>
                </div>
                <div className="d-flex align-items-start">
                  <svg width="16" height="16" fill="#e74c5a" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <small className="text-muted">
                    <strong>Événements</strong> - Webinaires et formations sur la mesure d'impact
                  </small>
                </div>
              </div>
            </Col>
          </Row>


        </div>
      </Container>
    </div>
  );
}
