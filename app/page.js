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
  PlayCircle,
  ChevronRight,
  Loader2
} from "lucide-react";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef();
  const abortControllerRef = useRef();
  const cacheRef = useRef(new Map());

  const fetchSuggestions = async (q) => {
    // Vérifier le cache d'abord
    const cacheKey = q.toLowerCase();
    if (cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      // Vérifier si le cache n'est pas trop ancien (5 minutes)
      if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        setSuggestions(cachedData.data);
        setLoading(false);
        return;
      } else {
        cacheRef.current.delete(cacheKey);
      }
    }

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      let stringQuery = q
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

      // Ajouter des paramètres pour limiter les résultats et optimiser la requête
      const res = await fetch(`/api/legalunit/${stringQuery}?limit=10&empreintePubliee=false`, {
        signal: abortControllerRef.current.signal,
        timeout: 5000 // 5 secondes de timeout
      });

      if (!res.ok) {
        // Si 502, c'est probablement l'API externe qui est down
        if (res.status === 502) {
          console.warn('API externe indisponible temporairement');
          setSuggestions([]);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const results = data.legalUnits || [];

      // Mettre en cache le résultat
      cacheRef.current.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      // Nettoyer le cache si trop d'entrées (max 50)
      if (cacheRef.current.size > 50) {
        const oldestKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(oldestKey);
      }

      setSuggestions(results);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Requête annulée, ne rien faire
        return;
      }

      // Log plus détaillé pour le debug
      console.error('Erreur lors de la recherche des suggestions:', {
        query: q,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      // Afficher un état vide au lieu d'une erreur pour l'UX
      setSuggestions([]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Annuler le timeout précédent
    clearTimeout(timeoutRef.current);

    if (value.length > 2) {
      setShowSuggestions(true);

      // Debounce plus agressif pour les suggestions (600ms)
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 600);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      // Annuler toute requête en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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
              Consultez l'<span className="highlight">Empreinte Sociétale</span>  des entreprises françaises
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
                  {loading ? (
                    <Loader2 className="search-icon search-loading" size={20} />
                  ) : (
                    <Search className="search-icon" size={20} />
                  )}
                  <input
                    type="text"
                    placeholder="Recherchez une entreprise par son nom ou son numéro SIREN..."
                    value={query}
                    onChange={handleChange}
                    onFocus={() => query.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-secondary" 
                    onClick={handleSearch}
                  >
                    Rechercher
                  </button>
                </div>

                {/* Suggestions de recherche */}
                {(showSuggestions && (loading || suggestions.length > 0)) && (
                  <div className="search-suggestions">
                    {loading ? (
                      <div className="suggestions-loading">
                        <div className="d-flex align-items-center justify-content-center py-3">
                          <Loader2 className="spin me-2 text-primary" size={18} />
                          <span className="text-muted">Recherche en cours...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="suggestions-list">
                          {suggestions.slice(0, 5).map((company, index) => (
                            <div 
                              key={index}
                              className="suggestion-item"
                              onClick={() => handleSelect(company.siren)}
                            >
                              <div className="suggestion-content">
                                <div className="company-name">{company.denomination}</div>
                                <div className="company-details">
                                  <small className="text-muted">
                                    SIREN: {company.siren}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {suggestions.length > 5 && (
                          <div className="suggestions-footer">
                            <button 
                              className="btn btn-link btn-sm p-0 text-primary fw-semibold"
                              onClick={handleSearch}
                            >
                              Voir tous les résultats ({suggestions.length})
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

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

      <section className="overview">
        <Container fluid className="px-0">
          {/* Section système collaboratif - Pleine largeur */}
          <div className="collaborative-system-section ">
            <Container>
              <div className="text-center mb-5">
                <h2 className="mb-4"><span className="highlight">Un système collaboratif</span> <br />de comptabilité extra-financière</h2>
              </div>

              <Row className="g-4 justify-content-center">
                <Col lg={4} md={6}>
                  <div className="mission-item text-center">
                    <div className="mission-icon mb-3 mx-auto">
                      <Users className="text-primary" size={32} />
                    </div>
                    <h5 className="mb-3">Approche collaborative</h5>
                    <p className="text-muted">Chaque entreprise récupère l'empreinte de ses fournisseurs et partage la sienne avec ses clients.</p>
                  </div>
                </Col>

                <Col lg={4} md={6}>
                  <div className="mission-item text-center">
                    <div className="mission-icon mb-3 mx-auto">
                      <Calculator className="text-secondary" size={32} />
                    </div>
                    <h5 className="mb-3">Mesure et transparence</h5>
                    <p className="text-muted">Permettre aux entreprises de mesurer et rendre compte de leurs externalités sociales et environnementales.</p>
                  </div>
                </Col>

                <Col lg={4} md={6}>
                  <div className="mission-item text-center">
                    <div className="mission-icon mb-3 mx-auto">
                      <Share2 className="text-tertiary" size={32} />
                    </div>
                    <h5 className="mb-3">Données accessibles</h5>
                    <p className="text-muted">Généraliser l'accès aux données extra-financières pour améliorer la traçabilité des impacts économiques.</p>
                  </div>
                </Col>
              </Row>

              <div className="text-center mt-5">
                <div className="d-flex flex-wrap gap-3 justify-content-center">
         
                  <a href="https://lasocietenouvelle.org/projet-sinese" className="btn btn-primary btn-lg" target="_blank" rel="noopener">
                    <Info size={18} className="me-2" />En savoir plus
                  </a>
                </div>
              </div>
            </Container>
          </div>
        </Container>
      </section>

      {/* Section CTA modernisée en 2 blocs */}
      <section className="cta-section">
        <Container fluid className="px-0">
          <Row className="g-0">
            {/* Bloc API - Gauche */}
            <Col lg={6} className="cta-api-block">
              <div className="cta-block-content h-100 d-flex flex-column justify-content-center">
                <div className="cta-icon">
                  <Code2 size={48} />
                </div>

                <h3 className="cta-title text-white">API Publique SINESE</h3>

                <p className="cta-description">
                  Accédez en temps réel aux données d’empreinte sociétale et intégrez-les facilement dans vos outils.
                </p>

                <div className="cta-features mb-4">
                  <div className="feature-item">
                    <CheckCircle size={16} className="feature-icon" />
                    <span>Accès gratuit</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={16} className="feature-icon" />
                    <span>Documentation complète</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={16} className="feature-icon" />
                    <span>Réponse JSON standardisée</span>
                  </div>
                </div>

                <div className="cta-actions">
                  <a href="/api" className="btn btn-primary ">
                    <Code2 size={18} className="me-2" />
                    Documentation API
                  </a>

                </div>
              </div>
            </Col>

            {/* Bloc Données - Droite */}
            <Col lg={6} className="cta-data-block">
              <div className="cta-block-content h-100 d-flex flex-column justify-content-center">
                <div className="cta-icon">
                  <Share2 size={48} />
                </div>

                <h3 className="cta-title">Données Ouvertes</h3>

                <p className="cta-description">
                  Accédez à l'ensemble des fichiers stocks des empreintes sociétales des entreprises, mis à jour chaque mois.
                </p>

                <div className="cta-features mb-4">
                  <div className="feature-item">
                    <CheckCircle size={16} className="feature-icon text-success" />
                    <span>Mise à jour mensuelle</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={16} className="feature-icon text-success" />
                    <span>Formats multiples</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={16} className="feature-icon text-success" />
                    <span>Téléchargement libre</span>
                  </div>
                </div>

                <div className="cta-actions">
                  <a href="/datasets" className="btn btn-secondary ">
                    <Share2 size={18} className="me-2" />
                    Télécharger les données
                  </a>
                  <a href="/recherche" className="btn btn-outline-primary  ms-3">
                    <Search size={18} className="me-2" />
                    Explorer les données
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Section Sources des données */}
      <section className="data-sources-section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="mb-3">Sources des données</h2>
            <p className="lead mb-0 opacity-90">
              L'<strong>Empreinte Sociétale des Entreprises</strong> est calculée par La Société Nouvelle
              à partir de sa <strong><a href="/" className="text-decoration-underline" target="_blank" rel="noopener noreferrer">méthodologie publique et accessible à tous</a></strong>.<br />
              En complément, SINESE met à disposition d'autres données extra-financières provenant de sources publiques.
            </p>
          </div>

          {/* Source principale */}
          <div className="main-source text-center mb-5">
            <div className="d-inline-flex align-items-center p-4 bg-white rounded-3 shadow-sm">
              <img src="/logo-La-Societe-Nouvelle.svg" alt="La Société Nouvelle" style={{ height: '50px' }} className="me-3" />
              <div>
                <div className="fw-bold h5 mb-1">La Société Nouvelle</div>
                <small className="text-muted">Empreinte Sociétale des Entreprises</small>
              </div>
            </div>
          </div>

          {/* Sources partenaires */}
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <div className="source-partner text-center">
              <img src="/images/indicateurs/logo-impact-score.png" alt="Impact Score" style={{ height: '60px' }} className="mb-2" />
              <div className="fw-bold small">Impact Score</div>
              <small className="text-muted">Impact environnemental</small>
            </div>
            <div className="source-partner text-center">
              <img src="/images/indicateurs/logo-index-egapro.png" alt="Index Égalité Pro" style={{ height: '60px' }} className="mb-2" />
              <div className="fw-bold small">Index Égalité Pro</div>
              <small className="text-muted">Égalité salariale</small>
            </div>
            <div className="source-partner text-center">
              <img src="/images/indicateurs/logo-bilans-ges.png" alt="Bilans GES" style={{ height: '60px' }} className="mb-2" />
              <div className="fw-bold small">Bilans GES</div>
              <small className="text-muted">Données carbone</small>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
} 