import "./styles/main.scss";
import { Container, Navbar, Nav, NavbarBrand, NavbarCollapse, NavLink, NavbarToggle } from "react-bootstrap";
import Footer from "./_components/footer";
import { Upload, Building2, Search, TrendingUp, Mail } from "lucide-react";

export const metadata = {
  metadataBase: new URL("https://sinese.fr"),
  title: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
  keywords: [
    "SINESE",
    "Empreinte Sociétale",
    "Entreprises",
    "Système d'Information",
    "Développement Durable",
    "Responsabilité Sociétale des Entreprises",
  ],
  description:
    "Le portail SINESE répertorie les données relatives à l'empreinte sociétale des entreprises en France. Il permet de consulter en toute transparence les performances extra-financières des entreprises afin d'identifier celles dont les activités sont alignées avec les objectifs et plans nationaux sur les enjeux clés de durabilité.",
  openGraph: {
    title: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
    description:
      "Le portail SINESE répertorie les données relatives à l'empreinte sociétale des entreprises en France. Il permet de consulter en toute transparence les performances extra-financières des entreprises afin d'identifier celles dont les activités sont alignées avec les objectifs et plans nationaux sur les enjeux clés de durabilité.",
    url: "https://sinese.fr",
    siteName: "SINESE",
    images: [
      {
        url: "/images/sinese-og-image.png",
        width: 1200,
        height: 630,
        alt: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
      },
    ],
  },
};

export default function RootLayout({ children }) {

  return (
    <html lang="fr">
      <body>
        <Navbar expand="lg" className="header-nav" variant="light">
          <Container fluid className="px-4">
            <NavbarBrand href="/" className="d-flex align-items-center">
              <img src="/logo-La-Societe-Nouvelle.svg" alt="SINESE" height={40} className="me-3" />

            </NavbarBrand>

            <NavbarToggle aria-controls="basic-navbar-nav" />
            <NavbarCollapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <NavLink href="/" className="nav-item-custom">
                  <Building2 size={16} className="me-2" />
                  <span>Entreprises</span>
                </NavLink>
                <NavLink href="/recherche" className="nav-item-custom">
                  <Search size={16} className="me-2" />
                  <span className="d-none d-lg-inline">Recherche</span>
                </NavLink>
                <NavLink href="/macroeconomies" className="nav-item-custom">
                  <TrendingUp size={16} className="me-2" />
                  <span>Macroéconomie</span>
                </NavLink>
              </Nav>

              <Nav className="ms-auto">
                <NavLink href="/publier" className="btn btn-secondary">
                  <Upload size={16} className="me-2" />
                  Publier sur SINESE
                </NavLink>
        
                <NavLink href="/contact" className="nav-item-custom">
                  <Mail size={16} className="me-2" />
                  <span className="d-none d-lg-inline">Contact</span>
                </NavLink>
              </Nav>
            </NavbarCollapse>
          </Container>
        </Navbar>

        <main className="main-content flex-grow-1">
          {children}
        </main>

        <Footer></Footer>
      </body>
    </html>
  );
}
