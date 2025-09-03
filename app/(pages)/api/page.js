"use client";

import { Container, Row, Col, Card, Badge, Button, Alert, Nav, Tab } from "react-bootstrap";
import {
  Database,
  Code,
  ExternalLink,
  Copy,
  CheckCircle,
  Settings,
  Zap,
  FileText,
  ArrowRight,
  Globe,
  Clock,
  Shield,
  Info
} from "lucide-react";
import { useState } from "react";
import PageHeader from "@/_components/PageHeader";

export default function ApiPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedExample, setCopiedExample] = useState(null);

  const copyToClipboard = (text, exampleId) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(exampleId);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  const endpoints = [
    {
      id: "footprint",
      method: "GET",
      path: "/v2/legalunit/{siren}/footprint",
      description: "Récupère l'empreinte sociétale complète d'une entreprise",
      parameters: [
        { name: "siren", type: "string", required: true, description: "Numéro SIREN de l'entreprise (9 chiffres)" }
      ],
      example: {
        request: "https://api.lasocietenouvelle.org/v2/legalunit/552032534/footprint",
        response: {
          header: { code: 200, message: "success" },
          legalUnit: {
            siren: "552032534",
            denomination: "LA SOCIETE NOUVELLE",
            activitePrincipaleCode: "7022Z"
          },
          footprint: {
            ECO: { value: 85.4, flag: "p" },
            ART: { value: 12.3, flag: "d" },
            SOC: { value: 91.2, flag: "p" }
          }
        }
      }
    },
    {
      id: "division",
      method: "GET",
      path: "/v2/defaultfootprint/",
      description: "Récupère les données sectorielles par défaut",
      parameters: [
        { name: "code", type: "string", required: true, description: "Code division A88 (2 chiffres)" },
        { name: "aggregate", type: "string", required: false, description: "Type d'agrégation (défaut: PRD)" },
        { name: "area", type: "string", required: false, description: "Zone géographique (défaut: FRA)" }
      ],
      example: {
        request: "https://api.lasocietenouvelle.org/v2/defaultfootprint/?code=70&aggregate=PRD&area=FRA",
        response: {
          header: { code: 200, message: "success" },
          footprint: {
            ECO: { value: 78.2 },
            ART: { value: 15.6 },
            SOC: { value: 88.9 }
          }
        }
      }
    },
    {
      id: "macro",
      method: "GET",
      path: "/v2/macrodata/macro_fpt_a88",
      description: "Récupère les données macroéconomiques historiques par division",
      parameters: [
        { name: "division", type: "string", required: true, description: "Code division A88" },
        { name: "aggregate", type: "string", required: false, description: "Type d'agrégation" },
        { name: "area", type: "string", required: false, description: "Zone géographique" }
      ],
      example: {
        request: "https://api.lasocietenouvelle.org/v2/macrodata/macro_fpt_a88?division=70&aggregate=PRD&area=FRA",
        response: {
          header: { code: 200, message: "success" },
          data: [
            { indic: "ECO", year: 2023, value: 78.2 },
            { indic: "ECO", year: 2022, value: 76.8 }
          ]
        }
      }
    }
  ];

  const indicators = [
    { code: "ART", name: "Artisanat et Commerce équitable", unit: "%" },
    { code: "ECO", name: "Contribution aux économies locales", unit: "%" },
    { code: "GEQ", name: "Égalité professionnelle", unit: "%" },
    { code: "GHG", name: "Intensité d'émissions de gaz à effet de serre", unit: "g CO2e/€" },
    { code: "HAZ", name: "Utilisation de produits dangereux", unit: "%" },
    { code: "IDR", name: "Évolution des écarts de rémunérations", unit: "%" },
    { code: "KNW", name: "Évolution de la formation du capital humain", unit: "%" },
    { code: "MAT", name: "Intensité d'extraction de matières premières", unit: "g/€" },
    { code: "NRG", name: "Intensité énergétique", unit: "kJ/€" },
    { code: "SOC", name: "Contribution à la société civile", unit: "%" },
    { code: "WAS", name: "Intensité de production de déchets", unit: "g/€" },
    { code: "WAT", name: "Intensité de consommation d'eau", unit: "L/€" }
  ];

  return (
    <div className="api-page">
      {/* Header */}
      <PageHeader
        title="API SINESE"
        subtitle="Intégrez directement les données d'empreinte sociétale dans vos applications"
        path="api"
        icon={
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="3" width="20" height="4" fill="currentColor" opacity="0.3" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" />
            <line x1="8" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="5" cy="5.5" r="0.5" fill="currentColor" />
            <circle cx="6.5" cy="5.5" r="0.5" fill="currentColor" />
            <circle cx="8" cy="5.5" r="0.5" fill="currentColor" />
            <path d="M18 9v6l2-2-2-2v-2z" fill="currentColor" />
          </svg>
        }
      />

      <Container className="py-5">
        {/* Navigation */}
        <Nav variant="pills" className="mb-4" activeKey={activeTab} onSelect={setActiveTab}>
          <Nav.Item>
            <Nav.Link eventKey="overview">Vue d'ensemble</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="endpoints">Points de terminaison</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="indicators">Indicateurs</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="examples">Exemples</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Container activeKey={activeTab}>
          <Tab.Content>
            {/* Vue d'ensemble */}
            <Tab.Pane eventKey="overview">
              <Row>
                <Col lg={8}>
                  <Card className="mb-4">
                    <Card.Body >
                      <h2 className="h4 mb-3">À propos de l'API SINESE</h2>
                      <p>
                        L'API SINESE vous donne accès aux données d'empreinte sociétale et
                        environnementale de plus de 2,3 millions d'entreprises françaises.
                        Développée par La Société Nouvelle, cette API vous permet d'intégrer facilement
                        les 12 indicateurs clés de performance extra-financière dans vos projets.
                      </p>

                      <Alert variant="info" className="mb-4">
                        <div>
                          <Info size={20} className="me-2 text-primary" />
                          <strong>API publique et gratuite</strong>
                          <p className="mb-0 mt-2">
                            L'API SINESE est accessible librement sans authentification.
                            Les données sont à jour en temps réel et couvrent l'ensemble
                            des entreprises françaises actives.
                          </p>
                        </div>
                      </Alert>

                      {/* Caractéristiques techniques */}
                      <Row className="mb-4">
                        <Col md={6}>
                          <Card className="h-100 bg-light">
                            <Card.Body className="d-flex align-items-center">
                              <Zap size={24} className="text-primary me-3" />
                              <div>
                                <h6 className="mb-1">Disponibilité</h6>
                                <small className="text-muted">99.5% de temps de fonctionnement</small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="h-100 bg-light">
                            <Card.Body className="d-flex align-items-center">
                              <Shield size={24} className="text-primary me-3" />
                              <div>
                                <h6 className="mb-1">Limite de débit</h6>
                                <small className="text-muted">1000 requêtes par minute</small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Card className="h-100 bg-light">
                            <Card.Body className="d-flex align-items-center">
                              <Globe size={24} className="text-primary me-3" />
                              <div>
                                <h6 className="mb-1">URL de base</h6>
                                <code className="small">api.lasocietenouvelle.org</code>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="h-100 bg-light">
                            <Card.Body className="d-flex align-items-center">
                              <Clock size={24} className="text-primary me-3" />
                              <div>
                                <h6 className="mb-1">Actualisation</h6>
                                <small className="text-muted">Données en temps réel</small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4}>
                  <Card className="border-primary">
                    <Card.Header className="bg-primary">
                      <h5 className="text-white mb-0 d-flex align-items-center">
                        <Settings size={20} className="me-2" />
                        Démarrage rapide
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <h6>Obtenir l'empreinte d'une entreprise :</h6>
                      <div className="bg-light p-3 rounded mb-3">
                        <code className="small">
                          GET /v2/legalunit/552032534/footprint
                        </code>
                      </div>
                      <Button variant="outline-primary" size="sm" className="w-100">
                        <ExternalLink size={14} className="me-1" />
                        Essayer maintenant
                      </Button>
                    </Card.Body>
                  </Card>

                  <Card className="mt-3 ">
                    <Card.Body>
                      <h6 className="text-primary">Support & Contact</h6>
                      <p className="small mb-3">
                        Questions techniques ou suggestions d'amélioration ?
                      </p>
                      <Button variant="link" size="sm" className="p-0">
                        Contacter l'équipe →
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* Points de terminaison */}
            <Tab.Pane eventKey="endpoints">
              <h2 className="h4 mb-4">Points de terminaison disponibles</h2>

              {endpoints.map((endpoint) => (
                <Card key={endpoint.id} className="mb-4 shadow-sm">
                  <Card.Header className="bg-light border-0">
                    <div className="d-flex align-items-center">
                      <Badge
                        bg={endpoint.method === "GET" ? "success" : "primary"}
                        className="me-3"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-primary">{endpoint.path}</code>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-3">{endpoint.description}</p>

                    {/* Paramètres */}
                    {endpoint.parameters.length > 0 && (
                      <div className="mb-3">
                        <h6>Paramètres :</h6>
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Nom</th>
                                <th>Type</th>
                                <th>Requis</th>
                                <th>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.parameters.map((param) => (
                                <tr key={param.name}>
                                  <td><code>{param.name}</code></td>
                                  <td><Badge bg="secondary">{param.type}</Badge></td>
                                  <td>
                                    {param.required ? (
                                      <Badge bg="danger">Oui</Badge>
                                    ) : (
                                      <Badge bg="secondary">Non</Badge>
                                    )}
                                  </td>
                                  <td>{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Exemple */}
                    <div className="row">
                      <div className="col-md-6">
                        <h6>Exemple de requête :</h6>
                        <div className="bg-dark text-light p-3 rounded position-relative">
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="position-absolute top-0 end-0 mt-2 me-2"
                            onClick={() => copyToClipboard(endpoint.example.request, `req-${endpoint.id}`)}
                          >
                            {copiedExample === `req-${endpoint.id}` ? (
                              <CheckCircle size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </Button>
                          <code className="small text-light">
                            {endpoint.example.request}
                          </code>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <h6>Exemple de réponse :</h6>
                        <div className="bg-dark text-light p-3 rounded position-relative">
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="position-absolute top-0 end-0 mt-2 me-2"
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.example.response, null, 2), `res-${endpoint.id}`)}
                          >
                            {copiedExample === `res-${endpoint.id}` ? (
                              <CheckCircle size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </Button>
                          <code className="small text-light">
                            {JSON.stringify(endpoint.example.response, null, 2)}
                          </code>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Tab.Pane>

            {/* Indicateurs */}
            <Tab.Pane eventKey="indicators">
              <h2 className="h4 mb-4">Indicateurs disponibles</h2>
              <p className="mb-4">
                L'API SINESE fournit des données sur 12 indicateurs d'empreinte sociétale,
                couvrant les dimensions sociale, environnementale et économique.
              </p>

              <Row>
                {indicators.map((indicator) => (
                  <Col key={indicator.code} md={6} lg={4} className="mb-3">
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                          <Badge bg="primary" className="me-2">{indicator.code}</Badge>
                          <small className="text-muted">{indicator.unit}</small>
                        </div>
                        <h6 className="card-title">{indicator.name}</h6>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Alert variant="info" className="mt-4">
                <div>
                  <Info size={20} className="me-2 text-primary" />
                  <strong>Interprétation des données</strong>
                  <p className="mb-0 mt-2">
                    Chaque indicateur est accompagné d'un flag indiquant la source des données :
                    <code className="ms-2">p</code> = données publiées par l'entreprise,
                    <code className="ms-2">d</code> = données par défaut (sectorielles)
                    <code className="ms-2">e</code> = données estimées.
                  </p>
                </div>
              </Alert>
            </Tab.Pane>

            {/* Exemples */}
            <Tab.Pane eventKey="examples">
              <h2 className="h4 mb-4">Exemples d'utilisation</h2>

              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">JavaScript / Node.js</h5>
                </Card.Header>
                <Card.Body>
                  <div className="bg-dark text-light p-3 rounded position-relative">
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="position-absolute top-0 end-0 mt-2 me-2"
                      onClick={() => copyToClipboard(`// Récupérer l'empreinte d'une entreprise
const response = await fetch('https://api.lasocietenouvelle.org/v2/legalunit/552032534/footprint');
const data = await response.json();

if (data.header.code === 200) {
  console.log('Entreprise:', data.legalUnit.denomination);
  console.log('Empreinte:', data.footprint);
} else {
  console.error('Erreur:', data.header.message);
}`, 'js-example')}
                    >
                      {copiedExample === 'js-example' ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                    <code className="small">
                      {`// Récupérer l'empreinte d'une entreprise
const response = await fetch('https://api.lasocietenouvelle.org/v2/legalunit/552032534/footprint');
const data = await response.json();

if (data.header.code === 200) {
  console.log('Entreprise:', data.legalUnit.denomination);
  console.log('Empreinte:', data.footprint);
} else {
  console.error('Erreur:', data.header.message);
}`}
                    </code>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">Python</h5>
                </Card.Header>
                <Card.Body>
                  <div className="bg-dark text-light p-3 rounded position-relative">
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="position-absolute top-0 end-0 mt-2 me-2"
                      onClick={() => copyToClipboard(`import requests

# Récupérer l'empreinte d'une entreprise
url = "https://api.lasocietenouvelle.org/v2/legalunit/552032534/footprint"
response = requests.get(url)
data = response.json()

if data['header']['code'] == 200:
    print(f"Entreprise: {data['legalUnit']['denomination']}")
    print(f"Empreinte: {data['footprint']}")
else:
    print(f"Erreur: {data['header']['message']}")`, 'python-example')}
                    >
                      {copiedExample === 'python-example' ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                    <code className="small">
                      {`import requests

# Récupérer l'empreinte d'une entreprise
url = "https://api.lasocietenouvelle.org/v2/legalunit/552032534/footprint"
response = requests.get(url)
data = response.json()

if data['header']['code'] == 200:
    print(f"Entreprise: {data['legalUnit']['denomination']}")
    print(f"Empreinte: {data['footprint']}")
else:
    print(f"Erreur: {data['header']['message']}")`}
                    </code>
                  </div>
                </Card.Body>
              </Card>

              <Card className="shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">cURL</h5>
                </Card.Header>
                <Card.Body>
                  <div className="bg-dark text-light p-3 rounded position-relative">
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="position-absolute top-0 end-0 mt-2 me-2"
                      onClick={() => copyToClipboard(`curl -X GET "https://api.lasocietenouvelle.org/v2/legalunit/552032534/footprint" \\
     -H "Accept: application/json"`, 'curl-example')}
                    >
                      {copiedExample === 'curl-example' ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                    <code className="small">
                      {`curl -X GET "https://api.lasocietenouvelle.org/v2/legalunit/552032534/footprint" \\
     -H "Accept: application/json"`}
                    </code>
                  </div>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        {/* Section ressources complémentaires */}
        <Row className="mt-5">
          <Col md={4}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <FileText size={32} className="text-primary mb-3" />
                <h5 className="text-primary">Documentation complète</h5>
                <p className="small">
                  Accédez à la documentation technique détaillée avec tous les schémas de données.
                </p>
                <Button variant="outline-primary" size="sm" href="https://lasocietenouvelle.readme.io/" target="_blank">
                  Voir la documentation <ArrowRight size={14} className="ms-1" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 ">
              <Card.Body className="text-center">
                <Database size={32} className="text-primary mb-3" />
                <h5 className="text-primary">Jeux de données</h5>
                <p className="small">
                  Téléchargez les données complètes en format CSV ou explorez nos datasets.
                </p>
                <Button variant="outline-primary" size="sm" href="/datasets">
                  Accéder aux données <ArrowRight size={14} className="ms-1" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 ">
              <Card.Body className="text-center">
                <Globe size={32} className="text-primary mb-3" />
                <h5 className="text-primary">Interface web</h5>
                <p className="small">
                  Explorez les données des entreprises directement sur le portail web.
                </p>
                <Button variant="outline-primary" size="sm" href="/recherche">
                  Rechercher <ArrowRight size={14} className="ms-1" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}