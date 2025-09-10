import { Col, Container, Image, ListGroup, Nav, Row, Form, Button, InputGroup } from "react-bootstrap";
import { Mail, HelpCircle, Home } from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();


  return (
    <footer className="footer">
      {/* Section Newsletter */}
      <div className="newsletter-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h3 className="fw-bold mb-2">Restez informé de l'actualité SINESE</h3>
              <p className="mb-0 opacity-90">
                Restez au courant des évolutions de SINESE : nouvelles données disponibles,
                améliorations de la plateforme et avancées du projet.
              </p>
            </Col>
            <Col lg={6} className="text-center text-lg-end">
              <a href="/newsletter" className="btn btn-primary">
                <Mail size={18} className="me-2" />
                S'inscrire à la newsletter
              </a>

            </Col>
          </Row>
        </Container>
      </div>

      {/* Section principale du footer */}
      <div className="main-footer py-5">
        <Container>
          <Row className="g-4">
            {/* À propos */}
            <Col lg={4} md={6}>
              <div className="footer-section">
                <h5 className="fw-bold mb-3">À propos de SINESE</h5>
                <p className=" mb-3">
                  Le Système d'Information National sur l'Empreinte Sociétale des Entreprises,
                  développé par La Société Nouvelle pour rendre transparents les impacts
                  sociaux et environnementaux des entreprises françaises.
                </p>
                <div className="d-flex gap-3">
                  <a href="https://github.com/La-Societe-Nouvelle/" target="_blank" rel="noreferrer" className="fs-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/la-societe-nouvelle/" target="_blank" rel="noreferrer" className="fs-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a href="https://discord.gg/ANFwWZc3eu" target="_blank" rel="noreferrer" className="fs-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>
                </div>
              </div>
            </Col>

            {/* Navigation */}
            <Col lg={2} md={6}>
              <div className="footer-section">
                <h6 className="fw-bold mb-3">Explorer</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="/recherche" className=" text-decoration-none">Recherche entreprises</a></li>
                  <li className="mb-2"><a href="/macroeconomies" className=" text-decoration-none">Données sectorielles</a></li>
                  <li className="mb-2"><a href="https://lasocietenouvelle.org/indicateurs" className=" text-decoration-none" target="_blank" rel="noreferrer">Indicateurs ESE</a></li>
                  <li className="mb-2"><a href="https://docs.lasocietenouvelle.org/empreinte-societale/mesure" className=" text-decoration-none" target="_blank" rel="noreferrer">Méthodologie</a></li>
                </ul>
              </div>
            </Col>

            {/* Resources */}
            <Col lg={3} md={6}>
              <div className="footer-section">
                <h6 className="fw-bold mb-3">Ressources</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="/api" className=" text-decoration-none">API publique</a></li>
                  <li className="mb-2"><a href="https://docs.lasocietenouvelle.org" className=" text-decoration-none" target="_blank">Documentation</a></li>
                  <li className="mb-2"><a href="https://partners.metriz.lasocietenouvelle.org/" className=" text-decoration-none" target="_blank">Metriz | Mesure de l'empreinte sociétale</a></li>
                </ul>
              </div>
            </Col>

            {/* Contact */}
            <Col lg={3} md={6}>
              <div className="footer-section">
                <h6 className="fw-bold mb-3">Contact & Support</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <a href="/contact" className=" text-decoration-none">
                      <Mail size={16} className="me-2" />Nous contacter
                    </a>
                  </li>

                  <li className="mb-2">
                    <a href="https://lasocietenouvelle.org" target="_blank" className=" text-decoration-none">
                      <Home size={16} className="me-2" />La Société Nouvelle
                    </a>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* Footer bottom */}
      <div className="footer-bottom py-3">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <p className="mb-0 ">
                &copy; {year} La Société Nouvelle • SINESE • Tous droits réservés
              </p>
            </Col>
            <Col md={6} className="text-md-end mt-2 mt-md-0">
              <ul className="list-inline mb-0">
                <li className="list-inline-item">
                  <a href="/mentions-legales" className=" text-decoration-none small">
                    Mentions légales
                  </a>
                </li>
                <li className="list-inline-item mx-2 ">•</li>
                <li className="list-inline-item">
                  <a href="/politique-confidentialite" className=" text-decoration-none small">
                    Confidentialité
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
