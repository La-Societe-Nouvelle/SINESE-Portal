import "./styles/main.scss";
import { Container, Navbar, Nav, NavbarBrand, NavbarCollapse, NavLink, NavbarToggle, Button } from "react-bootstrap";
import Footer from "./_components/footer";
import BackToTop from "./_components/BackToTop";
import { Upload, Building2, Search, TrendingUp, Mail, DatabaseIcon, Link, ChevronDown, Code } from "lucide-react";

export const metadata = {
  metadataBase: new URL("https://sinese.fr"),
  title: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
  description:
    "Le portail SINESE répertorie les données relatives à l'empreinte sociétale des entreprises en France. Il permet de consulter en toute transparence les performances extra-financières des entreprises afin d'identifier celles dont les activités sont alignées avec les objectifs et plans nationaux sur les enjeux clés de durabilité.",
  keywords: [
    "SINESE",
    "Empreinte Sociétale",
    "Entreprises",
    "Système d'Information",
    "Développement Durable",
    "Responsabilité Sociétale des Entreprises",
    "Impact Sociétal",
    "Données Ouvertes",
  ],
  authors: [{ name: "SINESE" }],
  creator: "SINESE",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://sinese.fr",
    siteName: "SINESE",
    title: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
    description:
      "Le portail SINESE répertorie les données relatives à l'empreinte sociétale des entreprises en France. Il permet de consulter en toute transparence les performances extra-financières des entreprises afin d'identifier celles dont les activités sont alignées avec les objectifs et plans nationaux sur les enjeux clés de durabilité.",
    images: [
      {
        url: "/images/og-image-sinese.jpg",
        width: 1200,
        height: 630,
        alt: "SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises",
        type: "image/jpeg",
      },
    ],
  },
  alternates: {
    canonical: "https://sinese.fr",
  },
};

export default function RootLayout({ children }) {

  return (
    <html lang="fr">
      <body>
        <Navbar expand="lg" className="header-nav" variant="light">
          <Container fluid className="px-4">
            <NavbarBrand href="/" className="d-flex align-items-center">
              <img src="/logo-sinese.svg" alt="SINESE" height={50} className="me-3" />
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
                <NavLink href="/api" className="nav-item-custom">
                  <Code size={16} className="me-2" />
                  <span>API</span>
                </NavLink>
              </Nav>

              <Nav className="ms-auto">
                <Button href="https://publication.sinese.fr/" variant="secondary" >
                  <Upload size={16} className="me-2" />
                  Publier sur SINESE.fr
                </Button>

              </Nav>
            </NavbarCollapse>
          </Container>
        </Navbar>

        <main className="main-content flex-grow-1">
          {children}
        </main>

        <BackToTop />
        <Footer></Footer>
      </body>
    </html>
  );
}
