import React from "react";
import {
  Container,
  Image,
  Nav,
  Navbar,
} from "react-bootstrap";



const Header = () => {

  return (
    <Navbar expand="lg" bg="white" className="top-bar">
      <Container >
        <Navbar.Brand href="/">
          <Image
            src="/logo-La-Societe-Nouvelle.svg"
            height="70"
            className="d-inline-block align-center"
            alt="logo"
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-collapse" />
        <Navbar.Collapse id="navbar-collapse">
          <Nav className="ms-auto d-flex align-items-center">
            <Nav.Link href="/" className="active">
              Empreinte des entreprises
            </Nav.Link>
            <Nav.Link href="/macro">
              Empreinte des activités économiques
            </Nav.Link>
            <Nav.Link href="https://lasocietenouvelle.org/publier-empreinte"  className="btn btn-secondary btn-sm" target="_blank">
              Publier mon empreinte <i className="bi bi-box-arrow-up-right"></i>
            </Nav.Link>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
