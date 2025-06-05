import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Col, Container, Image, ListGroup, Nav, Row } from "react-bootstrap";

function Footer() {
  const router = useRouter();
  const [page, setPage] = useState(router.pathname);
  const year = new Date().getFullYear();

  useEffect(() => {
    setPage(router.pathname);
  });

  return (
    <footer>
      <div className="top-footer">
        <Container>
          <Row>
            <Col xs={12} lg={4} className="text-center text-lg-start">
              <h6>Abonnez-vous !</h6>
              <div className="d-flex justify-content-center justify-content-lg-start align-items-center icon-link">
                <i className="bi bi-envelope-paper" role="img"></i>
                <a href="/newsletter" title="Inscription à la newsletter">
                  Newsletter
                </a>
              </div>
            </Col>
            <Col
              xs={12}
              lg={4}
              className="text-center text-lg-start mt-3 mt-lg-0"
            >
              <h6>Suivez-nous </h6>

              <ListGroup
                horizontal
                className="justify-content-center justify-content-lg-start"
              >
                <ListGroup.Item>
                  <a
                    href="https://github.com/La-Societe-Nouvelle/"
                    target="_blank"
                    rel="noreferrer"
                    title="GitHub"
                  >
                    <i
                      className="bi bi-github mx-2 mx-lg-0 me-lg-3"
                      role="img"
                    ></i>
                  </a>
                </ListGroup.Item>
                <ListGroup.Item>
                  <a
                    href="https://www.linkedin.com/company/la-societe-nouvelle/"
                    target="_blank"
                    rel="noreferrer"
                    title="LinkedIn"
                  >
                    <i
                      className="bi bi-linkedin mx-2 mx-lg-0 me-lg-3"
                      role="img"
                    ></i>
                  </a>
                </ListGroup.Item>
                <ListGroup.Item>
                  <a
                    href="https://discord.gg/ANFwWZc3eu"
                    target="_blank"
                    rel="noreferrer"
                    title="Discord"
                  >
                    <i
                      className="bi bi-discord mx-2 mx-lg-0 me-lg-3"
                      role="img"
                    ></i>
                  </a>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col
              xs={12}
              lg={4}
              className="text-center text-lg-start mt-3 mt-lg-0"
            >
              <h6> Contactez-nous</h6>
              <div className="d-flex justify-content-center justify-content-lg-start align-items-center icon-link">
                <i className="bi bi-envelope-fill" role="img"></i>
                <a href="/contact" title="Contactez nous">
                  Formulaire de contact
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="footer">
        {/* <div className="text-center mt-4">
          <Image
            src="/celeste-blanc.svg"
            height={30}
            alt="Celeste personnage du logo de La Société Nouvelle"
          ></Image>
        </div> */}
   
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <p className="mx-2 mb-0">&copy;{year} La Société Nouvelle</p>
              <ul className="nav">
                <li className="nav-item">
                  <a className="nav-link" href="/mentions-legales">
                    Mentions légales
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/politique-confidentialite">
                    Politique de confidentialité
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/contact">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </Container>
  
      </div>
    </footer>
  );
}

export default Footer;
