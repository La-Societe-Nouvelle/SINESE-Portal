"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Form, InputGroup, Button, Card, Spinner, Row, Col, Pagination, Dropdown, Badge, Offcanvas } from "react-bootstrap";
import CustomSelect from "@/_components/forms/CustomSelect";
import NafSelector from "@/_components/forms/NafSelector";
import DepartementSelector from "@/_components/forms/DepartementSelector";
import indicsData from "@/_libs/indics.json";

export default function RecherchePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("s") || "";
  
  // Search and results state
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    secteur: "",
    codesNaf: [], // Nouveau filtre pour les codes NAF multiples
    departements: [], // Remplace region par departements (multi-sélection)
    effectif: "",
    formeJuridique: "",
    sortBy: "pertinence",
    // Filtres bonus
    economieSocialeSolidaire: false,
    societeMission: false,
    activitePrincipaleArtisanale: false,
    activitePrincipaleExtractive: false,
    activitePrincipaleFormationRecherche: false,
    // Filtre données publiées (multi-sélection)
    donneesPubliees: []
  });



  const effectifOptions = [
    { value: "0-9", label: "0-9 salariés" },
    { value: "10-49", label: "10-49 salariés" },
    { value: "50-249", label: "50-249 salariés" },
    { value: "250-499", label: "250-499 salariés" },
    { value: "500+", label: "500+ salariés" }
  ];

  // Générer les options d'indicateurs à partir du fichier JSON
  const indicateursOptions = Object.entries(indicsData)
    .filter(([code, indic]) => indic.inEmpreinteSocietale === true)
    .map(([code, indic]) => ({
      value: code,
      label: indic.libelle
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // UI state
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  // Remettre à la première page à chaque nouvelle recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Fetch results when query or filters change
  useEffect(() => {
    if (query.length > 2) {
      setLoading(true);
      
      // Build query parameters including filters
      const params = new URLSearchParams();
      params.append('q', query);
      
      // Add regular filters if they have values
      if (filters.secteur) params.append('secteur', filters.secteur);
      if (filters.codesNaf.length > 0) {
        filters.codesNaf.forEach(code => {
          params.append('codesNaf[]', code);
        });
      }
      if (filters.departements.length > 0) {
        filters.departements.forEach(dept => {
          params.append('departements[]', dept);
        });
      }
      if (filters.effectif) params.append('effectif', filters.effectif);
      if (filters.formeJuridique) params.append('formeJuridique', filters.formeJuridique);
      if (filters.donneesPubliees.length > 0) {
        // Envoyer les indicateurs comme paramètres multiples ou comme chaîne séparée par des virgules
        filters.donneesPubliees.forEach(indicator => {
          params.append('donneesPubliees[]', indicator);
        });
        // Alternative: params.append('donneesPubliees', filters.donneesPubliees.join(','));
      }
      
      // Add bonus filters if they are true
      if (filters.economieSocialeSolidaire) params.append('ess', 'true');
      if (filters.societeMission) params.append('societeMission', 'true');
      if (filters.activitePrincipaleArtisanale) params.append('artisanale', 'true');
      if (filters.activitePrincipaleExtractive) params.append('extractive', 'true');
      if (filters.activitePrincipaleFormationRecherche) params.append('formationRecherche', 'true');
      
      fetch(`/api/legalunit?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.legalUnits || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Erreur lors de la recherche:', error);
          setResults([]);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [query, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // fetch is already triggered by useEffect
  };

  // Pagination logic
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentResults = results.slice(indexOfFirst, indexOfLast);

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      // Affiche seulement les pages proches de la page courante, la première et la dernière
      if (number === 1 || number === totalPages || (number >= currentPage - 2 && number <= currentPage + 2)) {
        items.push(
          <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
            {number}
          </Pagination.Item>
        );
      } else if ((number === currentPage - 3 && number > 1) || (number === currentPage + 3 && number < totalPages)) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${number}`} disabled />);
      }
    }
    return (
      <Pagination>
        <Pagination.Prev onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} />
        {items}
        <Pagination.Next
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <div className="search-page">
      {/* Header with search bar */}
      <div className="search-header bg-white border-bottom py-3">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                <h1 className="h4 mb-0 me-4">Recherche d'entreprises</h1>
                <Form onSubmit={handleSearch} className="flex-grow-1">
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Recherchez par nom, SIREN, secteur..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                    />
                    <Button variant="primary" type="submit">
                      <i className="bi bi-search"></i>
                    </Button>
                  </InputGroup>
                </Form>
              </div>
            </div>
            <div className="col-md-4 text-md-end mt-2 mt-md-0">
              {results.length > 0 && (
                <span className="text-muted">
                  {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 bg-light border-end p-0">
            <div className="filters-sidebar">
              <div className="p-3 border-bottom">
                <h6 className="fw-bold mb-0">Filtres</h6>
              </div>
              
              <div className="p-3">
                {/* Active filters */}
                {(Object.values(filters).some(f => f && f !== "pertinence") || query) && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="fw-semibold text-muted">FILTRES ACTIFS</small>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-danger p-0"
                        onClick={() => setFilters({
                          secteur: "", codesNaf: [], departements: [], effectif: "", formeJuridique: "", sortBy: "pertinence",
                          economieSocialeSolidaire: false, societeMission: false, 
                          activitePrincipaleArtisanale: false, activitePrincipaleExtractive: false,
                          activitePrincipaleFormationRecherche: false, donneesPubliees: []
                        })}
                      >
                        Tout effacer
                      </Button>
                    </div>
                    {query && (
                      <Badge bg="primary" className="me-1 mb-1">
                        "{query}"
                      </Badge>
                    )}
                    {filters.secteur && (
                      <Badge bg="secondary" className="me-1 mb-1">
                        {filters.secteur}
                      </Badge>
                    )}
                    {filters.codesNaf.length > 0 && (
                      <Badge bg="primary" className="me-1 mb-1">
                        {filters.codesNaf.length} code{filters.codesNaf.length > 1 ? 's' : ''} NAF
                      </Badge>
                    )}
                    {filters.departements.length > 0 && (
                      <Badge bg="info" className="me-1 mb-1">
                        {filters.departements.length} département{filters.departements.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {filters.effectif && (
                      <Badge bg="secondary" className="me-1 mb-1">
                        {filters.effectif} salariés
                      </Badge>
                    )}
                    {filters.formeJuridique && (
                      <Badge bg="secondary" className="me-1 mb-1">
                        {filters.formeJuridique}
                      </Badge>
                    )}
                    {filters.economieSocialeSolidaire && (
                      <Badge bg="success" className="me-1 mb-1">
                        ESS
                      </Badge>
                    )}
                    {filters.societeMission && (
                      <Badge bg="success" className="me-1 mb-1">
                        Société à mission
                      </Badge>
                    )}
                    {filters.activitePrincipaleArtisanale && (
                      <Badge bg="info" className="me-1 mb-1">
                        Artisanale
                      </Badge>
                    )}
                    {filters.activitePrincipaleExtractive && (
                      <Badge bg="info" className="me-1 mb-1">
                        Extractive
                      </Badge>
                    )}
                    {filters.activitePrincipaleFormationRecherche && (
                      <Badge bg="info" className="me-1 mb-1">
                        Formation/Recherche
                      </Badge>
                    )}
                    {filters.donneesPubliees.length > 0 && 
                      filters.donneesPubliees.map(code => (
                        <Badge key={code} bg="warning" className="me-1 mb-1">
                          Données {code}
                        </Badge>
                      ))
                    }
                  </div>
                )}

                {/* Secteurs d'activité NAF */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Secteurs d'activité (NAF)</label>
                  <NafSelector
                    selectedCodes={filters.codesNaf}
                    onChange={(selectedCodes) => setFilters({...filters, codesNaf: selectedCodes})}
                    placeholder="Sélectionnez des secteurs d'activité..."
                  />
                  {filters.codesNaf.length > 0 && (
                    <small className="text-primary d-block mt-1">
                      <i className="bi bi-info-circle me-1"></i>
                      {filters.codesNaf.length} code{filters.codesNaf.length > 1 ? 's' : ''} NAF sélectionné{filters.codesNaf.length > 1 ? 's' : ''}
                    </small>
                  )}
                </div>


                {/* Départements Filter */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Départements</label>
                  <DepartementSelector
                    selectedDepartements={filters.departements}
                    onChange={(selectedDepartements) => setFilters({...filters, departements: selectedDepartements})}
                    placeholder="Sélectionnez des départements..."
                    instanceId="select-departements"
                  />
                  {filters.departements.length > 0 && (
                    <small className="text-info d-block mt-1">
                      <i className="bi bi-info-circle me-1"></i>
                      {filters.departements.length} département{filters.departements.length > 1 ? 's' : ''} sélectionné{filters.departements.length > 1 ? 's' : ''}
                    </small>
                  )}
                </div>

                {/* Effectif Filter */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Effectif</label>
                  <CustomSelect
                    instanceId="select-effectif"
                    size="small"
                    options={effectifOptions}
                    value={effectifOptions.find(option => option.value === filters.effectif) || null}
                    onChange={(selectedOption) => setFilters({...filters, effectif: selectedOption ? selectedOption.value : ""})}
                    placeholder="Tous les effectifs"
                    isClearable={true}
                  />
                </div>



                <div className="mb-4">
                  <label className="form-label fw-semibold">Données publiées</label>
                  <CustomSelect
                    instanceId="select-donnees-publiees"
                    isMulti={true}
                    size="small"
                    variant="warning"
                    options={indicateursOptions}
                    value={indicateursOptions.filter(option => filters.donneesPubliees.includes(option.value))}
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                      setFilters({...filters, donneesPubliees: selectedValues});
                    }}
                    placeholder="Sélectionnez des indicateurs..."
                    isClearable={true}
                  />
                  {filters.donneesPubliees.length > 0 && (
                    <small className="text-success d-block mt-1">
                      <i className="bi bi-check-circle me-1"></i>
                      {filters.donneesPubliees.length} indicateur{filters.donneesPubliees.length > 1 ? 's' : ''} sélectionné{filters.donneesPubliees.length > 1 ? 's' : ''}
                    </small>
                  )}
                </div>

                {/* Divider */}
                <hr className="my-4" />

                {/* Filtres Bonus */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">Autres critères</label>

                  
                  <div className="bonus-filters">
                    {/* ESS */}
                    <Form.Check 
                      type="checkbox"
                      id="filter-ess"
                      label="Économie Sociale et Solidaire (ESS)"
                      checked={filters.economieSocialeSolidaire}
                      onChange={(e) => setFilters({...filters, economieSocialeSolidaire: e.target.checked})}
                      className="mb-2"
                    />

                    {/* Société à mission */}
                    <Form.Check 
                      type="checkbox"
                      id="filter-mission"
                      label="Société à mission"
                      checked={filters.societeMission}
                      onChange={(e) => setFilters({...filters, societeMission: e.target.checked})}
                      className="mb-2"
                    />

                    {/* Activité artisanale */}
                    <Form.Check 
                      type="checkbox"
                      id="filter-artisanale"
                      label="Activité principale artisanale"
                      checked={filters.activitePrincipaleArtisanale}
                      onChange={(e) => setFilters({...filters, activitePrincipaleArtisanale: e.target.checked})}
                      className="mb-2"
                    />

                    {/* Activité extractive */}
                    <Form.Check 
                      type="checkbox"
                      id="filter-extractive"
                      label="Activité principale extractive"
                      checked={filters.activitePrincipaleExtractive}
                      onChange={(e) => setFilters({...filters, activitePrincipaleExtractive: e.target.checked})}
                      className="mb-2"
                    />

                    {/* Formation/Recherche */}
                    <Form.Check 
                      type="checkbox"
                      id="filter-formation"
                      label="Formation et recherche"
                      checked={filters.activitePrincipaleFormationRecherche}
                      onChange={(e) => setFilters({...filters, activitePrincipaleFormationRecherche: e.target.checked})}
                      className="mb-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Results */}
          <div className="col-lg-9 ">
            <div className="results-area p-4">
              
              {/* Controls Bar */}
              {(results.length > 0 || query.length > 2) && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    {loading ? (
                      <div className="d-flex align-items-center">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <span>Recherche en cours...</span>
                      </div>
                    ) : (
                      <h5 className="mb-0">
                        {results.length} résultat{results.length > 1 ? 's' : ''}
                      </h5>
                    )}
                  </div>
                  
                  <div className="d-flex align-items-center gap-3">
                    {/* Sort dropdown */}
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-sort-down me-1"></i>
                        {filters.sortBy}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setFilters({...filters, sortBy: "pertinence"})}>
                          Pertinence
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilters({...filters, sortBy: "nom"})}>
                          Nom (A-Z)
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilters({...filters, sortBy: "effectif"})}>
                          Effectif
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                    {/* View mode toggle */}
                    <div className="btn-group" role="group">
                      <Button 
                        variant={viewMode === "list" ? "primary" : "outline-secondary"} 
                        size="sm"
                        onClick={() => setViewMode("list")}
                        title="Vue liste"
                      >
                        <i className="bi bi-list"></i>
                      </Button>
                      <Button 
                        variant={viewMode === "grid" ? "primary" : "outline-secondary"} 
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        title="Vue grille"
                      >
                        <i className="bi bi-grid"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* No Results */}
              {!loading && results.length === 0 && query.length > 2 && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-search text-muted" style={{fontSize: '3rem'}}></i>
                  </div>
                  <h4>Aucun résultat trouvé</h4>
                  <p className="text-muted mb-4">
                    Essayez de modifier vos critères de recherche ou utilisez des termes plus généraux.
                  </p>
                  <Button variant="outline-primary" onClick={() => setQuery("")}>
                    Nouvelle recherche
                  </Button>
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <>
                  <div className="results-list">
                    {currentResults.map((company) => (
                      <Card key={company.siren} className="company-card mb-3 border-0 shadow-sm">
                        <Card.Body className="p-4">
                          <Row className="align-items-center">
                            <Col md={8}>
                              <div className="company-info">
                                <h5 className="mb-2 fw-bold">
                                  <a href={`/entreprise/${company.siren}`} className="text-decoration-none">
                                    {company.denomination}
                                  </a>
                                </h5>
                                <p className="text-muted mb-2">{company.activitePrincipaleLibelle}</p>
                                
                                <div className="company-meta">
                                  <Row className="g-3">
                                    <Col sm={6} lg={3}>
                                      <small className="text-muted d-block">Forme juridique</small>
                                      <span className="fw-medium">{company.categorieJuridiqueLibelle}</span>
                                    </Col>
                                    <Col sm={6} lg={3}>
                                      <small className="text-muted d-block">Localisation</small>
                                      <span className="fw-medium">{company.communeSiege}</span>
                                    </Col>
                                    <Col sm={6} lg={3}>
                                      <small className="text-muted d-block">Effectif</small>
                                      <span className="fw-medium">{company.trancheEffectifs || "N.C."}</span>
                                    </Col>
                                    <Col sm={6} lg={3}>
                                      <small className="text-muted d-block">SIREN</small>
                                      <span className="fw-medium font-monospace">{company.siren}</span>
                                    </Col>
                                  </Row>
                                </div>
                              </div>
                            </Col>
                            <Col md={4} className="text-md-end mt-3 mt-md-0">
                              <div className="d-flex flex-column align-items-md-end">
                                {/* Indicateur de données publiées */}
                                {company.donneesPubliees && company.donneesPubliees.length > 0 && (
                                  <div className="mb-2">
                                    <small className="text-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      {company.donneesPubliees.length} indicateur{company.donneesPubliees.length > 1 ? 's' : ''} publié{company.donneesPubliees.length > 1 ? 's' : ''}
                                    </small>
                                  </div>
                                )}
                                <Button 
                                  href={`/entreprise/${company.siren}`}
                                  variant="primary"
                                  className="btn-action"
                                >
                                  Voir l'empreinte
                                  <i className="bi bi-arrow-right ms-2"></i>
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      {renderPagination()}
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {!loading && results.length === 0 && query.length <= 2 && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-building text-primary" style={{fontSize: '3rem'}}></i>
                  </div>
                  <h4>Recherchez des entreprises</h4>
                  <p className="text-muted">
                    Saisissez au moins 3 caractères pour commencer votre recherche.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
