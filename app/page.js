"use client";

import { useRef, useState } from "react";
import { Form, InputGroup, Button, ListGroup, Spinner } from "react-bootstrap";

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
    <div className="home-hero d-flex flex-column align-items-center justify-content-center">
      <h1 className="home-title mb-3 text-center">
        Toute l'information sur <br />
        <span className="main-titles me-2">
          <strong>l'Empreinte Sociétale </strong>
        </span>
        des entreprises
      </h1>
      <div className="home-tagline mb-4 text-center ">
        <span>
          <b>Transparence, durabilité, impact  : </b>
          Accédez librement aux données extra-financières des entreprises françaises
        </span>
      </div>
      {console.log(suggestions)}

      <Form className="home-search  position-relative" onSubmit={handleSearch}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Recherchez une entreprise par son nom ou son numéro SIREN"
            value={query}
            onChange={handleChange}
            size="lg"
            aria-label="Recherche"
            autoFocus
            onFocus={() => query.length > 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <Button variant="secondary" type="submit">
            <i className="bi bi-search"></i> Rechercher
          </Button>
        </InputGroup>
        {showSuggestions && (
          <div className="suggestions-list-wrapper position-absolute w-100 shadow" style={{ zIndex: 10 }}>
            <ListGroup className="suggestions-list">
              {loading && (
                <ListGroup.Item className="text-center">
                  <Spinner animation="border" size="sm" /> Recherche...
                </ListGroup.Item>
              )}
              {!loading && suggestions.length === 0 && (
                <ListGroup.Item className="text-muted">Aucun résultat</ListGroup.Item>
              )}
              {suggestions.map((s) => (
                <ListGroup.Item
                  key={s.siren}
                  action
                  onMouseDown={() => handleSelect(s.siren)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span className="text-truncate denomination">{s.denomination}</span>
                  <span className="text-muted small text-truncate activite">{s.activitePrincipaleLibelle}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
            {suggestions.length > 0 && (
              <div
                className="suggestions-footer"
                onMouseDown={() => (window.location.href = `/recherche?s=${encodeURIComponent(query)}`)}
                style={{ cursor: "pointer" }}
              >
                Voir tous les résultats
              </div>
            )}
          </div>
        )}
      </Form>

      <div className="mt-4 border-top pt-3 d-flex justify-content-between gap-3">
        <p className="small mb-0 text-muted">
          Explorez les données par <b>secteur</b>, <b>région</b> ou <b>impact</b>.
        </p>
        <a href="/recherche" className="small fw-bold d-flex align-items-center">
          Recherche avancée <i className="bi bi-chevron-right"></i>
        </a>
      </div>
    </div>
  );
}
