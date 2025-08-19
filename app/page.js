"use client";

import { useRef, useState } from "react";
import { Container, Row, Col, Form, InputGroup, Button, ListGroup, Spinner } from "react-bootstrap";

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
      <section className="hero py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8} className="text-center">
              <h1 className="hero-title mb-4">
                Toute l'information sur <br />
                <span className="highlight">l'Empreinte Sociétale</span>
                <br />des entreprises
              </h1>
              
              <p className="hero-subtitle mb-5 text-muted">
                <strong>Transparence, durabilité, impact :</strong>
                <br />Accédez librement aux données extra-financières des entreprises françaises
              </p>

              <Form className="search-form position-relative mb-4" onSubmit={handleSearch}>
                <InputGroup size="lg" className="search-input-group">
                  <InputGroup.Text className="search-icon bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Recherchez une entreprise par son nom ou son numéro SIREN..."
                    value={query}
                    onChange={handleChange}
                    className="border-start-0"
                    autoFocus
                    onFocus={() => query.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  <Button variant="secondary" type="submit">
                    Rechercher
                  </Button>
                </InputGroup>

                {showSuggestions && (
                  <div className="suggestions-wrapper position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                    <ListGroup className="shadow-sm">
                      {loading && (
                        <ListGroup.Item className="text-center py-3">
                          <Spinner animation="border" size="sm" className="me-2" />
                          Recherche en cours...
                        </ListGroup.Item>
                      )}
                      {!loading && suggestions.length === 0 && (
                        <ListGroup.Item className="text-muted py-3">
                          <i className="bi bi-info-circle me-2"></i>
                          Aucun résultat trouvé
                        </ListGroup.Item>
                      )}
                      {suggestions.map((s) => (
                        <ListGroup.Item
                          key={s.siren}
                          action
                          onMouseDown={() => handleSelect(s.siren)}
                          className="d-flex justify-content-between align-items-start py-3"
                        >
                          <div className="flex-grow-1">
                            <div className="fw-semibold text-dark">{s.denomination}</div>
                            <small className="text-muted">{s.activitePrincipaleLibelle}</small>
                          </div>
                          <i className="bi bi-arrow-right text-secondary"></i>
                        </ListGroup.Item>
                      ))}
                      {suggestions.length > 0 && (
                        <ListGroup.Item
                          action
                          className="text-center py-3 fw-semibold text-secondary border-top"
                          onMouseDown={() => (window.location.href = `/recherche?s=${encodeURIComponent(query)}`)}
                        >
                          <i className="bi bi-list-ul me-2"></i>
                          Voir tous les résultats ({suggestions.length}+)
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </div>
                )}
              </Form>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="quick-actions py-4 bg-light">
        <Container>
          <Row className="g-3 justify-content-center">
            <Col sm={6} lg={3} className="text-center">
              <div className="action-item p-3 h-100">
                <i className="bi bi-buildings fs-4 text-primary mb-2 d-block"></i>
                <small>Explorez par <strong>secteur</strong></small>
              </div>
            </Col>
            <Col sm={6} lg={3} className="text-center">
              <div className="action-item p-3 h-100">
                <i className="bi bi-geo-alt fs-4 text-primary mb-2 d-block"></i>
                <small>Filtrez par <strong>région</strong></small>
              </div>
            </Col>
            <Col sm={6} lg={3} className="text-center">
              <div className="action-item p-3 h-100">
                <i className="bi bi-graph-up fs-4 text-primary mb-2 d-block"></i>
                <small>Analysez l'<strong>impact</strong></small>
              </div>
            </Col>
            <Col sm={6} lg={3} className="text-center">
              <div className="action-item p-3 h-100 bg-white border">
                <a href="/recherche" className="text-decoration-none">
                  <i className="bi bi-sliders fs-4 text-secondary mb-2 d-block"></i>
                  <small className="text-secondary">
                    <strong>Recherche avancée</strong>
                  </small>
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}