"use client";

import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { Search, Building2, Scale, Calendar } from "lucide-react";
import PageHeader from "@/_components/PageHeader";
import FileRow from "./FileRow";

function flattenResources(datasets) {
  return datasets.flatMap((dataset) => {
    if (dataset.files?.length > 0) {
      return dataset.files.map((file) => ({
        title: dataset.title,
        format: file.format,
        name: file.name,
        size: file.size,
        fileKey: file.fullPath,
        lastUpdate: file.lastModified || dataset.lastUpdate,
        contentType: file.contentType,
        fallbackSize: dataset.size,
      }));
    }
    return dataset.formats.map((format) => ({
      title: dataset.title,
      format,
      name: `${dataset.id}.${format.toLowerCase()}`,
      size: null,
      fileKey: null,
      lastUpdate: dataset.lastUpdate,
      contentType: null,
      fallbackSize: dataset.size,
    }));
  });
}

function getMostRecentUpdate(datasets) {
  return datasets.reduce((latest, d) => {
    if (!d.lastUpdate) return latest;
    return !latest || new Date(d.lastUpdate) > new Date(latest) ? d.lastUpdate : latest;
  }, null);
}

export default function DatasetsView({ datasets, error }) {
  const resources = flattenResources(datasets);
  const license = datasets[0]?.license || "Licence Ouverte / Open Licence";
  const mostRecentUpdate = getMostRecentUpdate(datasets);
  const updatedLabel = mostRecentUpdate
    ? new Date(mostRecentUpdate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : "-";

  return (
    <div className="datasets-page">
      {/* Header */}
      <PageHeader
        title="Jeux de données SINESE"
        subtitle="Accédez aux données ouvertes d'empreinte sociétale et environnementale des entreprises françaises"
        path="datasets"
        icon={
          <svg width="20" height="20"
            fill="currentColor" viewBox="0 0
  24 24">
            <rect x="3" y="4" width="18"
              height="16" rx="2" fill="none"
              stroke="currentColor"
              strokeWidth="1.5" />
            <rect x="3" y="4" width="18"
              height="4" rx="2"
              fill="currentColor"
              opacity="0.2" />
            <line x1="3" y1="12" x2="21"
              y2="12" stroke="currentColor"
              strokeWidth="0.5" />
            <line x1="3" y1="16" x2="21"
              y2="16" stroke="currentColor"
              strokeWidth="0.5" />
            <line x1="9" y1="8" x2="21"
              y2="8" stroke="currentColor"
              strokeWidth="0.5" />
            <circle cx="6" cy="14" r="1"
              fill="currentColor" />
            <circle cx="6" cy="18" r="1"
              fill="currentColor" />
          </svg>
        }

      />

      <Container>

        <h2 className="dataset-repo__title">Répertoire SINESE des entreprises</h2>
        <Row className="mb-4">
          <Col lg={8}>
            <p className="dataset-repo__description">
              Les données d'empreinte sociétale sont calculées selon la méthodologie de La Société Nouvelle
              et couvrent 12 indicateurs clés (social, environnemental, économique). Certaines données sont
              publiées directement par les entreprises, d'autres sont estimées à partir de données sectorielles.
            </p>
          </Col>
          <Col lg={4}>
            <dl className="dataset-meta">
              <div className="dataset-meta__row">
                <dt><Building2 size={14} className="me-1" />Producteur</dt>
                <dd>La Société Nouvelle</dd>
              </div>
              <div className="dataset-meta__row">
                <dt><Scale size={14} className="me-1" />Licence</dt>
                <dd>{license}</dd>
              </div>
              <div className="dataset-meta__row">
                <dt><Calendar size={14} className="me-1" />Dernière mise à jour</dt>
                <dd>{updatedLabel}</dd>
              </div>
            </dl>
          </Col>
        </Row>

        {error && (
          <Alert variant="warning" className="mb-4">
            Impossible de récupérer les données à jour, affichage des données de secours.
          </Alert>
        )}

        <h3 className="dataset-repo__subtitle">Fichiers</h3>
        <div className="file-list">
          {resources.map((resource) => (
            <FileRow key={`${resource.name}-${resource.format}`} {...resource} />
          ))}
        </div>

        {/* Informations complémentaires */}
        <Row className="my-5">
          <Col md={6}>
            <Card className="h-100 bg-light">
              <Card.Body>
                <h5 className="text-primary">Réutiliser les données</h5>
                <p className="small">
                  Ces jeux de données sont publiés sous licence ouverte : vous pouvez les réutiliser
                  librement pour vos analyses, recherches ou applications, en mentionnant la source.
                </p>
                <p className="small">
                  Pour un accès en temps réel plutôt qu'un fichier mensuel, l'API publique SINESE
                  donne accès directement aux empreintes des entreprises.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0"
                  href="https://api.sinese.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explorer l'API →
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 bg-light">
              <Card.Body>
                <h5 className="text-primary">Support technique</h5>
                <p className="small">
                  Besoin d'aide pour utiliser les données ? Consultez notre
                  documentation ou contactez notre équipe technique.
                </p>
                <Button variant="link" size="sm" className="p-0" href="mailto:support@lasocietenouvelle.org">
                  Contacter le support →
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Call to action recherche */}
        <div className="dataset-cta">
          <Search size={28} className="dataset-cta__icon" />
          <div>
            <h4>Vous cherchez une entreprise en particulier ?</h4>
            <p>
              Utilisez notre moteur de recherche pour consulter directement son empreinte
              sociétale sur SINESE.
            </p>
          </div>
          <Button variant="primary" href="/recherche" className="dataset-cta__action">
            Rechercher une entreprise →
          </Button>
        </div>
      </Container>
    </div>
  );
}
