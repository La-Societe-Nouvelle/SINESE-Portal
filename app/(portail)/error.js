"use client";

import { Button, Container } from "react-bootstrap";

export default function PortailError({ reset }) {
  return (
    <Container>
      <section className="text-center py-5">
        <h3>Une erreur est survenue</h3>
        <p className="text-muted mb-4">
          Impossible de récupérer les informations. Veuillez réessayer plus tard.
        </p>
        <Button variant="secondary" onClick={() => reset()}>
          Réessayer
        </Button>
      </section>
    </Container>
  );
}
