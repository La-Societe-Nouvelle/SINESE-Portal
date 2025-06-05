"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Form, InputGroup, Button, Card, Spinner, Row, Col, Pagination } from "react-bootstrap";

export default function RecherchePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("s") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

  // Remettre à la première page à chaque nouvelle recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Fetch results when query changes
  useEffect(() => {
    if (query.length > 2) {
      setLoading(true);
      fetch(`/api/legalunit?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.legalUnits || []);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [query]);

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
    <div className="container py-5">
      <h1 className="mb-4 text-center">Recherche avancée</h1>
      <Form className="mb-4" onSubmit={handleSearch}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Nom, SIREN, secteur, région..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="lg"
            aria-label="Recherche avancée"
            autoFocus
          />
          <Button variant="secondary" type="submit">
            <i className="bi bi-search"></i> Rechercher
          </Button>
        </InputGroup>
      </Form>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" /> Chargement des résultats...
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div>
            <h3 className="h5 mb-0">Résultats trouvés</h3>
            <p className="small">
              {results.length} entreprise{results.length > 1 ? "s" : ""} correspondent à votre recherche.
            </p>
          </div>
          {renderPagination()}
        </div>
      )}

      {!loading && results.length === 0 && query.length > 2 && (
        <div className="text-center text-muted my-4">Aucun résultat trouvé.</div>
      )}

      {!loading && results.length > 0 && (
        <>
          <Row xs={1} className="g-4">
            {currentResults.map((s) => (
              <Col key={s.siren}>
                <div className="result-card p-3 mb-2 bg-white rounded position-relative">
                  <h4 className="h6">{s.denomination}</h4>
                  {console.log(s)}
                  <div className="row mb-2">
                    <div className="col-md-3 col-6">
                      <div className="small text-muted">Forme Juridique</div>
                      <div>{s.categorieJuridiqueLibelle}</div>
                      {s.dateCreation && <div className="text-muted small">Depuis le {s.dateCreation}</div>}
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="small text-muted">Activité</div>
                      <div>{s.activitePrincipaleLibelle}</div>
                      {s.codeNaf && <div className="text-muted small">Code NAF : {s.codeNaf}</div>}
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="small text-muted">Lieu</div>
                      <div>{s.communeSiege}</div>
                      {s.codePostal && <div className="text-muted small">Code postal : {s.codePostalSiege}</div>}
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="small text-muted">Effectif</div>
                      <div>{s.trancheEffectifs || "N.C."}</div>
                      {s.capital && <div className="text-muted small">Capital : {s.capital} €</div>}
                    </div>
                  </div>
                  <a
                    href={`/entreprise/${s.siren}`}
                    className="btn btn-primary position-absolute end-0 top-50 translate-middle-y me-3"
        
                    title="Voir l'empreinte"
                  >
                    Empreinte Sociétale <i className="bi bi-arrow-right text-white"></i>
                  </a>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
}
