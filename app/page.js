"use client";

import { useRef, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { 
  Search, 
  SlidersHorizontal, 
  Users, 
  Calculator, 
  Share2, 
  Info, 
  CheckCircle, 
  Code2, 
  PlayCircle 
} from "lucide-react";

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
              Consultez l'<span className="highlight">Empreinte Sociétale</span>
              de toutes les entreprises françaises
            </h1>

            <p className="hero__subtitle">
              <strong>Données ouvertes</strong> sur les impacts sociaux et environnementaux : explorez, comparez, et visualisez
            </p>

            {/* Mini stats visibles dans le hero */}
            <div className="hero__stats mb-4">
              <div className="row justify-content-center g-3">
                <div className="col-auto">
                  <div className="stat-pill">
                    <strong>5M+</strong> entreprises
                  </div>
                </div>
                <div className="col-auto">
                  <div className="stat-pill">
                    <strong>12</strong> indicateurs
                  </div>
                </div>
                <div className="col-auto">
                  <div className="stat-pill">
                    <strong>64</strong> secteurs
                  </div>
                </div>
              </div>
            </div>

            <div className="hero__search">
              <div className="search-box">
                <div className="search-input">
                  <Search className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Recherchez une entreprise par son nom ou son numéro SIREN..."
                    value={query}
                    onChange={handleChange}
                    onFocus={() => query.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  <button type="submit" className="btn btn-secondary" onClick={handleSearch}>
                    Rechercher
                  </button>
                </div>
                <div className="advanced-search">
                  <a href="/recherche">
                    <SlidersHorizontal size={16} />
                    <span>Recherche avancée</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overview shadow-sm">
        <Container fluid className="px-0">
          <Row className="g-0">
            {/* Côté gauche - fond blanc */}
            <Col lg={6} className="py-5">
              <Container>
                <div className="info px-4">
                          
                  <h2 className="mb-4">Un système <span className="text-primary">collaboratif</span> de <span className="text-secondary">comptabilité extra-financière</span></h2>
                  
                  <div className="mission-content mb-4">
                    <div className="mission-item mb-3">
                      <div className="mission-icon">
                        <Users className="text-primary" size={24} />
                      </div>
                      <div>
                        <h5 className="mb-2">Approche collaborative</h5>
                        <p className="text-muted mb-0">Chaque entreprise récupère l'empreinte de ses fournisseurs et partage la sienne avec ses clients.</p>
                      </div>
                    </div>
                    
                    <div className="mission-item mb-3">
                      <div className="mission-icon">
                        <Calculator className="text-secondary" size={24} />
                      </div>
                      <div>
                        <h5 className="mb-2">Mesure et transparence</h5>
                        <p className="text-muted mb-0">Permettre aux entreprises de mesurer et rendre compte de leurs externalités sociales et environnementales.</p>
                      </div>
                    </div>
                    
                    <div className="mission-item">
                      <div className="mission-icon">
                        <Share2 className="text-tertiary" size={24} />
                      </div>
                      <div>
                        <h5 className="mb-2">Données accessibles</h5>
                        <p className="text-muted mb-0">Généraliser l'accès aux données extra-financières pour améliorer la traçabilité des impacts économiques.</p>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-3 justify-content-center justify-lg-start">
                    <a href="/recherche" className="btn btn-primary shadow-sm">
                      <Search size={16} className="me-2" />Explorer les données
                    </a>
                    <a href="https://lasocietenouvelle.org/projet-sinese" className="btn btn-outline-primary" target="_blank" rel="noopener">
                      <Info size={16} className="me-2" />En savoir plus
                    </a>
                  </div>
                </div>
              </Container>
            </Col>

            <Col lg={6} className="py-5 bg-primary text-white" >
              <Container>
                <div className="data-sources px-4">
                  <h2 className="text-white">Sources des données</h2>
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
                          <CheckCircle size={14} className="text-success me-1" />
                          Méthodologie publique et Open Source
                        </small>
                      </div>
                    </div>

                    {/* Sources partenaires réorganisées */}
                    <div className="row g-3 justify-content-center">
                      <div className="col-lg-4 col-md-6">
                        <div className="source-item d-flex flex-column align-items-center p-3 bg-white rounded text-center h-100 shadow-sm">
                          <img src="/images/indicateurs/logo-impact-score.png" alt="Impact Score" style={{ height: '40px' }} className="mb-2" />
                          <div className="fw-semibold">Impact Score</div>
                          <small className="text-muted">Impact environnemental</small>
                        </div>
                      </div>

                      <div className="col-lg-4 col-md-6">
                        <div className="source-item d-flex flex-column align-items-center p-3 bg-white rounded text-center h-100 shadow-sm">
                          <img src="/images/indicateurs/logo-index-egapro.png" alt="Index Égalité Pro" style={{ height: '40px' }} className="mb-2" />
                          <div className="fw-semibold">Index Égalité Pro</div>
                          <small className="text-muted">Égalité salariale</small>
                        </div>
                      </div>

                      <div className="col-lg-4 col-md-6">
                        <div className="source-item d-flex flex-column align-items-center p-3 bg-white rounded text-center h-100 shadow-sm">
                          <img src="/images/indicateurs/logo-bilans-ges.png" alt="Bilans GES" style={{ height: '40px' }} className="mb-2" />
                          <div className="fw-semibold">Bilans GES</div>
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

      {/* Section de transition CTA */}
      <section className="cta-section py-5">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={10}>
              <h3 className="mb-4">Accédez aux données via notre API publique</h3>
              
              <div className="cta-content mb-4">
                <p className="mb-3">
                  <strong>L'API SINESE</strong> met à disposition l'ensemble des données d'empreinte sociétale des entreprises françaises. 
                  Intégrez ces informations dans vos applications, logiciels ou analyses.
                </p>
                <p className="text-muted mb-4">
                  <strong>Données ouvertes</strong> • <strong>Accès gratuit</strong> • <strong>Documentation complète</strong> 
                </p>
              </div>
              
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <a href="/api" className="btn btn-secondary">
                  <Code2 size={16} className="me-2" />Documentation API
                </a>
                <a href="/api/playground" className="btn btn-outline-primary">
                  <PlayCircle size={16} className="me-2" />Tester l'API
                </a>

              </div>
            </Col>
          </Row>
        </Container>
      </section>

    </div>
  );
} 