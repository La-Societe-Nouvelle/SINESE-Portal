import { Col, Container, Image, ListGroup, Nav, Row, Form, Button, InputGroup } from "react-bootstrap";
import { Github, Linkedin, MessageCircle, Mail, HelpCircle, Home } from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();


  return (
    <footer className="footer">
      {/* Section Newsletter */}
      <div className="newsletter-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h3 className="fw-bold mb-2">Restez informé des actualités SINESE</h3>
              <p className="mb-0 opacity-90">
                Recevez les dernières données, analyses et mises à jour sur l'empreinte sociétale des entreprises.
              </p>
            </Col>
            <Col lg={6}>
            
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
                    <Github size={24} />
                  </a>
                  <a href="https://www.linkedin.com/company/la-societe-nouvelle/" target="_blank" rel="noreferrer" className="fs-4">
                    <Linkedin size={24} />
                  </a>
                  <a href="https://discord.gg/ANFwWZc3eu" target="_blank" rel="noreferrer" className="fs-4">
                    <MessageCircle size={24} />
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
                  <li className="mb-2"><a href="/indicateurs" className=" text-decoration-none">Indicateurs ESE</a></li>
                  <li className="mb-2"><a href="/methodologie" className=" text-decoration-none">Méthodologie</a></li>
                </ul>
              </div>
            </Col>

            {/* Resources */}
            <Col lg={3} md={6}>
              <div className="footer-section">
                <h6 className="fw-bold mb-3">Ressources</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="/api" className=" text-decoration-none">API publique</a></li>
                  <li className="mb-2"><a href="/faq" className=" text-decoration-none">FAQ</a></li>
                  <li className="mb-2"><a href="/documentation" className=" text-decoration-none">Documentation</a></li>
                  <li className="mb-2"><a href="/open-source" className=" text-decoration-none">Open Source</a></li>
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
                    <a href="/support" className=" text-decoration-none">
                      <HelpCircle size={16} className="me-2" />Support technique
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
      <div className="footer-bottom bg-dark border-top border-secondary py-3">
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
                <li className="list-inline-item mx-2 ">•</li>
                <li className="list-inline-item">
                  <a href="/cgv" className=" text-decoration-none small">
                    CGU
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
