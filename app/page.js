"use client";

import { useRef, useState } from "react";
import { Container, Row, Col, Form, InputGroup, Button, ListGroup, Spinner, Card } from "react-bootstrap";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef();

  const fetchSuggestions = async (q) => {
    setLoading(true);

    let stringQuery = q
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

    const res = await fetch(`/api/legalunit?q=${stringQuery}`);
    const data = await res.json();
    setSuggestions(data.legalUnits || []);
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(timeoutRef.current);
    if (value.length > 2) {
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
        setShowSuggestions(true);
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (siren) => {
    window.location.href = `/entreprise/${siren}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/recherche?s=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero__content">
          <div className="container text-center">
            <h1 className="hero__title">
              Toute l'information sur
              <span className="highlight">l'Empreinte Sociétale</span>
              des entreprises
            </h1>

            <p className="hero__subtitle">
              Consultez librement les données publiées sur les impacts de la valeur produite par les entreprises françaises.            </p>

            <div className="hero__search">
              <div className="search-box">
                <div className="search-input">
                  <i className="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Recherchez une entreprise par son nom ou son numéro SIREN..."
                    value={query}
                    onChange={handleChange}
                    onFocus={() => query.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  <button type="submit" onClick={handleSearch}>
                    Rechercher
                  </button>
                </div>
                <div className="advanced-search">
                  <a href="/recherche-avancee">
                    <i className="bi bi-sliders"></i>
                    <span>Recherche avancée</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overview">
        <Container fluid className="px-0">
          <Row className="g-0">
            {/* Côté gauche - fond blanc */}
            <Col lg={6} className="bg-white py-5">
              <Container>
                <div className="info px-4">
                  <h2 className=" mb-3">Système d'Information national sur l'Empreinte Sociale et Environnementale des Entreprises</h2>
                  <p>
                    Découvrez sur SINESE les données d'empreinte sociétale des entreprises, produites par La Société Nouvelle.
                  </p>

                  <div className="stats-grid mb-4">
                    <div className="stat-box">
                      <div className="stat-number">5M+</div>
                      <div className="stat-label">Entreprises modélisées</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">84,150+</div>
                      <div className="stat-label">Données extra-financières</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">88</div>
                      <div className="stat-label">Secteurs modélisés</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">12</div>
                      <div className="stat-label">Indicateurs mesurés</div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-3">
                    <a href="/recherche" className="btn btn-primary">
                      <i className="bi bi-search me-2"></i>Rechercher une entreprise
                    </a>
                    <a href="/macroeconomies" className="btn btn-outline-secondary">
                      <i className="bi bi-bar-chart me-2"></i>Données sectorielles
                    </a>
                  </div>
                </div>
              </Container>
            </Col>

            {/* Côté droit - fond bleu clair */}
            <Col lg={6} className="bg-light py-5">
              <Container>
                <div className="data-sources px-4">
                  <h2>Sources des données</h2>
                  <p className="mb-4">
                    L’<strong>Empreinte Sociétale des Entreprises</strong> est calculée par La Société Nouvelle
                    à partir de sa <strong><a href="/" target="_blank" rel="noopener noreferrer">méthodologie publique et accessible à tous</a></strong>.<br />
                    En complément, SINESE met à disposition d’autres données extra-financières provenant de sources publiques.
                  </p>

                  <div className="sources-list">
                    {/* Source principale - La Société Nouvelle */}
                    <div className="source-item d-flex align-items-center p-4 mb-4 bg-white rounded shadow-sm border-start" style={{ borderLeftColor: '#fa595f', borderLeftWidth: '4px' }}>
                      <div className="source-logo me-4">
                        <img src="/logo-La-Societe-Nouvelle.svg" alt="La Société Nouvelle" style={{ height: '50px' }} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold h5 mb-1">La Société Nouvelle</div>
                        <div className="text-muted mb-2">Empreinte Sociétale des Entreprises</div>
                        <small className="text-muted">
                          <i className="bi bi-check-circle text-success me-1"></i>
                          Méthodologie publique et Open Source
                        </small>
                      </div>
                    </div>

                    {/* Sources partenaires en ligne */}
                    <div className="row g-3">
                      <div className="col-4">
                        <div className="source-item d-flex flex-column align-items-center p-3 bg-white rounded text-center h-100">
                          <img src="/images/indicateurs/logo-impact-score.png" alt="Impact Score" style={{ height: '36px' }} className="mb-2" />
                          <div className="fw-semibold small">Impact Score</div>
                          <small className="text-muted">Impact environnemental</small>
                        </div>
                      </div>

                      <div className="col-4">
                        <div className="source-item d-flex flex-column align-items-center p-3 bg-white rounded text-center h-100">
                          <img src="/images/indicateurs/logo-index-egapro.png" alt="Index Égalité Pro" style={{ height: '36px' }} className="mb-2" />
                          <div className="fw-semibold small">Index Égalité Pro</div>
                          <small className="text-muted">Égalité salariale</small>
                        </div>
                      </div>

                      <div className="col-4">
                        <div className="source-item d-flex flex-column align-items-center p-3 bg-white rounded text-center h-100">
                          <img src="/images/indicateurs/logo-bilans-ges.png" alt="Bilans GES" style={{ height: '36px' }} className="mb-2" />
                          <div className="fw-semibold small">Bilans GES</div>
                          <small className="text-muted">Données carbone</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="community-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Un système collaboratif et ouvert</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: "720px" }}>
              SINESE est basé sur une démarche collaborative :
              chaque entreprise récupère l’empreinte sociétale de ses fournisseurs
              pour estimer ses impacts indirects, et met à disposition de ses clients
              sa propre empreinte.

            </p>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center">
                  <div className="display-5 mb-3">📤</div>
                  <Card.Title className="fw-semibold">Publiez vos données</Card.Title>
                  <Card.Text>
                    Partagez l’empreinte de votre entreprise pour enrichir
                    le système et favoriser la transparence.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center">
                  <div className="display-5 mb-3">🗄️</div>
                  <Card.Title className="fw-semibold">Une base ouverte et gratuite</Card.Title>
                  <Card.Text>
                    Accédez librement aux données extra-financières via
                    notre <strong>API publique</strong>, simple d’utilisation
                    et conçue pour s'intégrer à vos outils.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="text-center">
                  <div className="display-5 mb-3">📚</div>
                  <Card.Title className="fw-semibold">Appropriez-vous la méthode</Card.Title>
                  <Card.Text>
                    La méthodologie est publique et libre d’exploitation :
                    utilisez nos indicateurs ou intégrez-les dans vos pratiques.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Container>
      </section>

    </div>
  );
} 