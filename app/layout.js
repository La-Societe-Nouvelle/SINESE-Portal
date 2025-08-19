import "./styles/App.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Container, Navbar, Nav, NavbarBrand, NavLink } from "react-bootstrap";

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
        <div className="app-layout d-flex flex-column min-vh-100">
          <Navbar expand="lg" className="header-nav" variant="dark">
            <Container fluid className="px-4">
              <NavbarBrand href="/" className="d-flex align-items-center">
                <img src="/logo-La-Societe-Nouvelle.svg" alt="SINESE" height={45} className="me-3" />
                <div className="brand-text d-none d-md-block">
                  <div className="brand-title">SINESE</div>
                  <div className="brand-subtitle">Empreinte Sociétale</div>
                </div>
              </NavbarBrand>

              <Nav className="ms-auto">
                <NavLink href="/" className="nav-item-custom active">
                  <i className="bi bi-buildings me-2"></i>
                  <span>Entreprises</span>
                </NavLink>
                <NavLink href="/macroeconomie" className="nav-item-custom">
                  <i className="bi bi-graph-up me-2"></i>
                  <span>Macroéconomie</span>
                </NavLink>
                <NavLink href="/faq" className="nav-item-custom">
                  <i className="bi bi-question-circle me-2"></i>
                  <span className="d-none d-lg-inline">FAQ</span>
                </NavLink>
              </Nav>
            </Container>
          </Navbar>

          <main className="main-content flex-grow-1">
            {children}
          </main>

          <footer className="app-footer bg-white border-top">
            <Container fluid className="px-4">
              <div className="row align-items-center py-3">
                <div className="col-md-8">
                  <small className="text-muted">
                    © {new Date().getFullYear()} SINESE - Système d'Information National sur l'Empreinte Sociétale des Entreprises
                  </small>
                </div>
                <div className="col-md-4 text-end">
                  <a href="/mentions-legales" className="text-muted small me-3 text-decoration-none">
                    Mentions légales
                  </a>
                  <a href="/contact" className="text-muted small text-decoration-none">
                    Contact
                  </a>
                </div>
              </div>
            </Container>
          </footer>
        </div>
      </body>
    </html>
  );
}
