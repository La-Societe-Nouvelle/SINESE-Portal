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
            <Nav.Link href="/">
              Rechercher une entreprise
            </Nav.Link>
            <Nav.Link href="/publier-empreinte" target="_blank">
              Publier mon empreinte
            </Nav.Link>
            <Nav.Link href="https://api.lasocietenouvelle.org/" target="_blank" >
              API Publique <i className="bi bi-box-arrow-up-right"></i>
            </Nav.Link>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
