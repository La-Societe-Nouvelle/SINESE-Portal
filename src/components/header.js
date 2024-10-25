import React, { useEffect, useState } from "react";
import {
  Col,
  Container,
  Dropdown,
  Image,
  Nav,
  Navbar,
  NavDropdown,
  Row,
} from "react-bootstrap";

import metaData from "../lib/metaData.json";

import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();
  const [page, setPage] = useState(router.pathname);

  useEffect(() => {
    setPage(router.pathname);
  });

  if (page.startsWith("/databrowser")) {
    return (
      <Navbar className="justify-content-end border-bottom border-2">
        <Container fluid>
          <Navbar.Brand href="/databrowser" className="me-4">
            <Image src="/logo-La-Societe-Nouvelle.svg" height="80" alt="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="databrowser-navbar-nav" />
          <Navbar.Collapse id="databrowser-navbar-nav">
            <Nav>
              <NavDropdown
                title="Données"
                id="data-dropdown"
      
              >
                <NavDropdown
                  title="Empreintes des activités économiques"
                  className="dropdown-item"
                  key="end"
                  drop="end"
      
                >
                  <NavDropdown.Item href="/databrowser/dataset/macro_fpt">
                    Empreintes des activités économiques - données historiques
                  </NavDropdown.Item>
                  {/* <NavDropdown.Item href="/databrowser/dataset/macro_fpt_a38">
                    Empreintes des branches d'activité - données historiques
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/databrowser/dataset/macro_fpt_a88">
                    Empreintes des divisions économiques - données historiques
                  </NavDropdown.Item> */}
                  <NavDropdown.Item href="/databrowser/dataset/macro_fpt_trd">
                    Empreintes des activités économiques - tendances
                  </NavDropdown.Item>
                  {/* <NavDropdown.Item href="/databrowser/dataset/macro_fpt_trd_a38">
                    Empreintes des branches d'activité - tendances
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/databrowser/dataset/macro_fpt_trd_a88">
                    Empreintes des divisions économiques - tendances
                  </NavDropdown.Item> */}
                  <NavDropdown.Item href="/databrowser/dataset/macro_fpt_tgt">
                    Objectifs annuels par activité économique
                  </NavDropdown.Item>
                  {/* <NavDropdown.Item href="/databrowser/dataset/macro_fpt_tgt_a38">
                    Objectifs annuels par branches d'activité
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/databrowser/dataset/macro_fpt_tgt_a88">
                    Objectifs annuels des divisions économiques
                  </NavDropdown.Item> */}
                </NavDropdown>

                <NavDropdown.Divider />
                <NavDropdown
                  title="Données des comptes nationaux"
                  className="dropdown-item"
                  key="end"
                  drop="end"
                  
                >
                  <NavDropdown.Item href="/databrowser/dataset/na_cpeb">
                    Comptes de production et d'exploitation par branche
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/databrowser/dataset/na_ere">
                    Tableau des entrées ressources emplois
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/databrowser/dataset/na_pat_nf">
                    Comptes de patrimoine non-financier
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/databrowser/dataset/na_tei">
                    Tableau des entrées intermédiaires
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/databrowser/dataset/na_tess">
                    Tableau des entrées-sorties symétrique
                  </NavDropdown.Item>
                </NavDropdown>

                <NavDropdown.Divider />
                <NavDropdown
                  title="Autres jeux de données"
                  className="dropdown-item"
                  key="end"
                  drop="end"
                >
                  <NavDropdown.Item href="/databrowser/dataset/bts_data">
                    Indicateurs issus de la base tous salariés
                  </NavDropdown.Item>
                </NavDropdown>
              </NavDropdown>
              <Nav.Link
                href="https://api.lasocietenouvelle.org"
                target="_blank"
              >
                API
              </Nav.Link>
              <Nav.Link
                href="https://cran.r-project.org/web/packages/lsnstat/index.html"
                target="_blank"
              >
                LSN-stat
              </Nav.Link> 
              <Nav.Link
                href="https://github.com/La-Societe-Nouvelle/lsnr-lab"
                target="_blank"
              >
                LsnR-Lab
              </Nav.Link> 
              <Nav.Link href="/databrowser/publications">Publications</Nav.Link>
              <Nav.Link
                href="https://docs.lasocietenouvelle.org/series-donnees"
                target="_blank"
              >
                Documentation
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  if (page.startsWith("/devenir-partenaire")) {
    return (
      <Navbar className="justify-content-end border-bottom border-2">
        <Container fluid>
          <Navbar.Brand href="/devenir-partenaire" className="me-4">
            <Image src="/logo-La-Societe-Nouvelle.svg" height="80" alt="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="databrowser-navbar-nav" />
          <Navbar.Collapse id="databrowser-navbar-nav">
            <Nav>
              <Nav.Link
                href="/devenir-partenaire/expert-comptable"
              >
                EXPERTS COMPTABLES
              </Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link
                href="/devenir-partenaire/se-former"
              >
                SE FORMER
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
  if (page.startsWith("/publier-empreinte")) {
    return (
      <Navbar className="bg-light">
        <Container fluid>
          <Navbar.Brand href="/" className="m-auto">
            <Image src="/logo-La-Societe-Nouvelle.svg" height="75" alt="logo" />
          </Navbar.Brand>
   
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar expand="lg">
        <Container fluid>
          {/* <Navbar.Brand href="/">
            <Image
              src="/logo-La-Societe-Nouvelle.svg"
              height="80"
              className="d-inline-block align-center"
              alt="logo"
            />
          </Navbar.Brand> */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* <Nav.Link href="/" className="border-end border-3">
                <i className="bi bi-search"></i> Rechercher une entreprise
              </Nav.Link> */}
              <Nav.Link href="/publier-empreinte" target="_blank">
                Publier mes données
              </Nav.Link>
              <Nav.Link
                href="https://api.lasocietenouvelle.org"
                target="_blank"
                rel="noreferrer"
              >
                API publique
              </Nav.Link>
              <Nav.Link
                href="https://docs.lasocietenouvelle.org/public-api"
                target="_blank"
              >
                Documentation
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

export default Header;
