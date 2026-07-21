import { Container } from "react-bootstrap";

export default function IncidentBanner() {
  return (
    <div className="incident-banner">
      <Container>
        <div className="incident-banner-content">
          <span aria-hidden="true">⚠️</span>
          <span>
            Suite à un incident chez notre hébergeur, la recherche d'entreprises et le service de publication sont actuellement indisponibles. Merci de votre patience.
          </span>
        </div>
      </Container>
    </div>
  );
}
