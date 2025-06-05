import "./styles/App.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Container, Row, Col } from "react-bootstrap";

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
        <Container fluid className="d-flex flex-column min-vh-100 p-0">
          <Row className="flex-grow-1 m-0">
            {/* Sidebar */}
            <Col xs={12} md={2} lg={2} className="sidebar d-flex flex-column align-items-start p-0">
              {/* Logo et titre */}
              <div className="sidebar-header w-100 d-flex flex-column align-items-center p-2 border-bottom">
                <img src="/logo-La-Societe-Nouvelle.svg" alt="SINESE" height={60} className="mb-3" />
              </div>
              {/* Navigation */}
              <div className="sidebar-nav w-100 d-flex flex-column gap-3 p-4">
                <a href="/" className="sidebar-link active">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="sidebar-link-title">Entreprises</div>
                    <span className="sidebar-link-arrow">
                      <i className="bi bi-chevron-right"></i>
                    </span>
                  </div>
                  <div className="sidebar-link-desc">Empreintes des entreprises françaises</div>
                </a>
                <a href="/macroeconomie" className="sidebar-link">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="sidebar-link-title">Macroéconomie</div>
                    <span className="sidebar-link-arrow">
                      <i className="bi bi-chevron-right"></i>
                    </span>
                  </div>
                  <div className="sidebar-link-desc">Empreintes des activités économiques</div>
                </a>
              </div>
            </Col>
            {/* Main content */}
            <Col xs={12} md={9} lg={10} className={`main-content `}>
              {children}
            </Col>
          </Row>
          {/* Footer */}
          <footer className="footer d-flex justify-content-between align-items-center px-4 py-3 border-top">
            <Row>
              <Col className="text-muted">
                © {new Date().getFullYear()} SINESE - Système d'Information National sur l'Empreinte Sociétale des
                Entreprises
              </Col>
              <Col className="text-end">
                <a href="/mentions-legales" className="text-muted">
                  Mentions légales
                </a>
              </Col>
            </Row>
          </footer>
        </Container>
      </body>
    </html>
  );
}
