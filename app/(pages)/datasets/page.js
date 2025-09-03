"use client";

import { Container, Row, Col, Card, Badge, Button, Alert } from "react-bootstrap";
import { Download, FileSpreadsheet, Archive, Calendar, Users, Database, Info, ExternalLink } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/_components/PageHeader";

export default function DatasetsPage() {
  const [downloadLoading, setDownloadLoading] = useState(null);

  const handleDownload = async (format, dataset) => {
    setDownloadLoading(`${dataset}-${format}`);
    // Simulation d'un téléchargement
    setTimeout(() => {
      setDownloadLoading(null);
      // Ici vous pouvez implémenter la logique de téléchargement réelle
    }, 2000);
  };

  const datasets = [
    {
      id: "legal-units-footprint",
      title: "SINESE - Fichier stock UniteLegale du 01 Septembre 2025",
      description: "Base de données complète des empreintes sociales et environnementales des entreprises françaises selon les indicateurs SINESE.",
      lastUpdate: "2025-09-01",
      records: "2,347,891",
      formats: ["CSV", "ZIP"],
      size: "156 MB",
      indicators: ["ART", "ECO", "GEQ", "GHG", "HAZ", "IDR", "KNW", "MAT", "NRG", "SOC", "WAS", "WAT"],
      license: "Licence Ouverte / Open Licence",
      frequency: "Mensuelle"
    },
    {
      id: "indicators-metadata",
      title: "Métadonnées des indicateurs SINESE",
      description: "Documentation technique et métadonnées complètes des 12 indicateurs d'empreinte sociétale utilisés dans SINESE.",
      lastUpdate: "2024-11-20",
      records: "12",
      formats: ["CSV", "JSON"],
      size: "64 KB",
      license: "Licence Ouverte / Open Licence",
      frequency: "Trimestrielle"
    },

  ];

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
        {/* Informations générales */}
        <Alert variant="info" className="mb-4">
          <div>
            <Info size={20} className="me-2 text-primary" />
            <strong>À propos des données SINESE</strong>
            <p className="mb-0 mt-2">
              Les données d'empreinte sociétale sont calculées selon la méthodologie de La Société Nouvelle
              et couvrent 12 indicateurs clés (social, environnemental, économique).
              Certaines données sont publiées directement par les entreprises, d'autres sont estimées
              à partir de données sectorielles.
            </p>
          </div>
        </Alert>

        {/* Liste des datasets */}
        <Row>
          {datasets.map((dataset) => (
            <Col key={dataset.id} lg={12} className="mb-4">
              <Card className="h-100 shadow-sm ">
                <Card.Header className="bg-light border-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h3 className="h5 mb-2 text-primary">{dataset.title}</h3>
                      <p className="text-muted mb-0">{dataset.description}</p>
                    </div>

                  </div>
                </Card.Header>

                <Card.Body>
                  <Row className="mb-4">
                    <Col md={3}>
                      <div className="stat-item">
                        <small className="text-muted d-block">Dernière mise à jour</small>
                        <strong>{new Date(dataset.lastUpdate).toLocaleDateString('fr-FR')}</strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stat-item">
                        <small className="text-muted d-block">Nombre d'enregistrements</small>
                        <strong>{dataset.records}</strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stat-item">
                        <small className="text-muted d-block">Taille</small>
                        <strong>{dataset.size}</strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stat-item">
                        <small className="text-muted d-block">Fréquence</small>
                        <strong>{dataset.frequency}</strong>
                      </div>
                    </Col>
                  </Row>

                  {/* Formats et téléchargement */}
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <small className="text-muted me-3">Télécharger :</small>
                    {dataset.formats.map((format) => (
                      <Button
                        key={format}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(format.toLowerCase(), dataset.id)}
                        disabled={downloadLoading === `${dataset.id}-${format.toLowerCase()}`}
                        className="d-flex align-items-center"
                      >
                        {format === "ZIP" ? (
                          <Archive size={14} className="me-1" />
                        ) : (
                          <FileSpreadsheet size={14} className="me-1" />
                        )}
                        {downloadLoading === `${dataset.id}-${format.toLowerCase()}` ? "..." : format}
                      </Button>
                    ))}
                  </div>
                </Card.Body>

                <Card.Footer className="bg-white border-0 pt-0">
                  <small className="text-muted">
                    <strong>Licence :</strong> {dataset.license}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
        {/* Informations complémentaires */}
        <Row className="my-5">
          <Col md={6}>
            <Card className="h-100 bg-light">
              <Card.Body>
                <h5 className="text-primary">Utilisation des données</h5>
                <p className="small">
                  Ces données sont mises à disposition sous licence ouverte.
                  Vous pouvez les utiliser librement pour vos analyses, recherches
                  ou applications, en mentionnant la source.
                </p>
                <p className="small">
                  Pour accéder aux données en temps réel, consultez la documentation de notre API.
                </p>
                <Button variant="link" size="sm" className="p-0" href="/api">
                  Documentation API →
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
                <Button variant="link" size="sm" className="p-0">
                  Contacter le support →
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}