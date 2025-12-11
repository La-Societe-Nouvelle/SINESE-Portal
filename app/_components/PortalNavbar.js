import { Container, Navbar, Nav, NavbarBrand, NavbarCollapse, NavLink, NavbarToggle, Button } from "react-bootstrap";
import { Upload, Search, TrendingUp, DatabaseIcon, Code } from "lucide-react";

export default function PortalNavbar() {
  return (
    <Navbar expand="lg" className="header-nav" variant="light">
      <Container fluid className="px-4">
        <NavbarBrand href="/" className="d-flex align-items-center">
          <img src="/logo-sinese.svg" alt="SINESE" height={50} className="me-3" />
          <div className="d-flex flex-column">
            <span className="h5 mb-0 ">SINESE</span>
            <span className="d-none d-lg-inline text-muted small" >
              Portail Open Data
            </span>
          </div>
        </NavbarBrand>

        <NavbarToggle aria-controls="basic-navbar-nav" />
        <NavbarCollapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink href="/recherche" className="nav-item-custom">
              <Search size={16} className="me-2" />
              <span>Entreprises</span>
            </NavLink>

            <NavLink href="/macroeconomies" className="nav-item-custom">
              <TrendingUp size={16} className="me-2" />
              <span>Macroéconomie</span>
            </NavLink>
            <NavLink href="/datasets" className="nav-item-custom">
              <DatabaseIcon size={16} className="me-2" />
              <span>Open Data</span>
            </NavLink>
            <NavLink href="/api-sinese" className="nav-item-custom">
              <Code size={16} className="me-2" />
              <span>API</span>
            </NavLink>
          </Nav>

          <Nav className="ms-auto">
            <Button href="/publications/connexion" variant="secondary">
              <Upload size={16} className="me-2" />
              Publier sur SINESE.fr
            </Button>
          </Nav>
        </NavbarCollapse>
      </Container>
    </Navbar>
  );
}
