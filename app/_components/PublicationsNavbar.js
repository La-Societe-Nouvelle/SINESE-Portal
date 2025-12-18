"use client";

import { Container, Navbar, Nav, NavbarBrand, NavbarCollapse, NavLink, NavbarToggle, Dropdown } from "react-bootstrap";
import { LogOut, Upload, Settings, User, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function PublicationsNavbar() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/publications/connexion" });
  };

  return (
    <Navbar expand="lg" className="header-nav" variant="light">
      <Container fluid className="px-4">
        <NavbarBrand href="/publications/espace" className="d-flex align-items-center  border-2 border-end border-light pe-3">
          <img src="/logo-sinese.svg" alt="SINESE" height={50} className="me-3" />
          <div className="d-flex flex-column">
            <span className="h5 mb-0 ">SINESE</span>
            <span className="d-none d-lg-inline text-muted small" >
              Espace de publications
            </span>
          </div>
        </NavbarBrand>

        <NavbarToggle aria-controls="publications-navbar-nav" />
        <NavbarCollapse id="publications-navbar-nav">
          <Nav className="me-auto">
            <NavLink href="/publications/espace/publier" className="nav-item-custom">
              <Upload size={16} className="me-2" />
              <span>Demande de publication</span>
            </NavLink>

            <NavLink href="/publications/espace/gestion" className="nav-item-custom">
              <Settings size={16} className="me-2" />
              <span>Gérer mes publications</span>
            </NavLink>

            {session?.user?.role === "admin" && (
              <NavLink href="/publications/admin/dashboard" className="nav-item-custom">
                <Shield size={16} className="me-2" />
                <span>Dashboard Admin</span>
              </NavLink>
            )}
          </Nav>

          <Nav className="ms-auto">
            {session?.user && (
              <Dropdown>
                <Dropdown.Toggle
                  variant="link"
                  className="nav-item-custom text-decoration-none p-0"
                  id="user-dropdown"
                >
                  <User size={16} className="me-2" />
                  <span className="d-none d-lg-inline">
                    {session.user.firstName && session.user.lastName
                      ? `${session.user.firstName} ${session.user.lastName}`
                      : session.user.email}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end">
                  <Dropdown.Item href="/publications/espace/profil">
                    <User size={16} className="me-2" />
                    Mon profil
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <LogOut size={16} className="me-2" />
                    Déconnexion
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </NavbarCollapse>
      </Container>
    </Navbar>
  );
}
