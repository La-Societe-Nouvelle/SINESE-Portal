import { ExternalLink, Megaphone } from "lucide-react";
import Link from "next/link";
import { Container } from "react-bootstrap";

export default function PartnershipBanner() {
  return (
    <div className="partnership-banner">
      <Container>
        <div className="partnership-banner-content">
          <Megaphone className="text-secondary" size={24} />
          <span className="partnership-banner-text">
            <b>Appel à partenariat 2026 </b> — Soutenez nos travaux pour l'année 2026 !
          </span>
          <Link href="https://lasocietenouvelle.org/appel-partenariat" className="partnership-banner-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            En savoir plus
            <ExternalLink className="ms-1" size={16} />
          </Link>
        </div>
      </Container>
    </div>
  );
}
