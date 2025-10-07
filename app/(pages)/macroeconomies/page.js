"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import PageHeader from "../../_components/PageHeader";
import MacroSidebar from "./_components/MacroSidebar";
import IndicatorSection from "./_components/IndicatorSection";
import { indicatorSections } from "./_config/indicators";

export default function MacroeconomiesPage() {
  // États
  const [metadata, setMetadata] = useState({});
  const [data, setData] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);
  
  // Configuration
  const dataset = "macro_fpt";
  const [selectedValues, setSelectedValues] = useState({
    industry: "TOTAL",
    country: "FRA",
    aggregate: "PRD"
  });

  // Récupération des métadonnées
  const fetchMetadata = async () => {
    try {
      setIsLoadingMetadata(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/macrodata/metadata/macro_fpt`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const results = await response.json();
      setMetadata(results.metadata || {});
    } catch (error) {
      console.error('Erreur lors du chargement des métadonnées:', error);
      setError('Impossible de charger les métadonnées. Veuillez réessayer.');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Récupération des données
  const fetchData = async () => {
    if (!selectedValues.industry || !selectedValues.country || !selectedValues.aggregate) {
      return;
    }

    try {
      setIsLoadingData(true);
      setError(null);
      
      const params = new URLSearchParams(selectedValues);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/macrodata/${dataset}?${params}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const results = await response.json();
      setData(results.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les données. Veuillez vérifier votre connexion et réessayer.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Effets
  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (Object.keys(metadata).length > 0) {
      fetchData();
    }
  }, [selectedValues, metadata]);

  // Gestionnaires d'événements
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setSelectedValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setSelectedValues({
      industry: 'TOTAL',
      country: 'FRA',
      aggregate: 'PRD'
    });
  };

  return (
    <div className="open-data-portal">
      <PageHeader 
        title="Macroéconomie" 
        subtitle="Panorama de l'empreinte des activités économiques françaises"
        path="macroeconomies"
        variant="compact"
        icon={
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        }
      />
      
      <Container fluid className="pb-4">
        <Row>
          {/* Sidebar avec filtres */}
          <Col lg={3}>
            <MacroSidebar
              metadata={metadata}
              selectedValues={selectedValues}
              onSelectChange={handleSelectChange}
              onReset={handleReset}
              isLoading={isLoadingMetadata || isLoadingData}
            />
          </Col>

          {/* Contenu principal */}
          <Col lg={9}>
            <div className="main-content">
              
    
              {/* Messages d'erreur */}
              {error && (
                <Alert variant="danger" className="mb-4">
                  <div className="d-flex align-items-start">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="me-2 mt-1 flex-shrink-0">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <div>
                      <strong>Erreur de chargement</strong>
                      <div>{error}</div>
                    </div>
                  </div>
                </Alert>
              )}

              {/* État de chargement global */}
              {isLoadingMetadata && (
                <div className="loading-container">
                  <div className="loading-icon">
                    <Spinner animation="border" style={{ width: '2rem', height: '2rem' }} />
                  </div>
                  <h5 className="loading-title">Chargement en cours...</h5>
                </div>
              )}

              {/* Sections d'indicateurs */}
              {!isLoadingMetadata && data && (
                <div className="indicators-content">
                  {indicatorSections.map((section) => (
                    <IndicatorSection
                      key={section.id}
                      title={section.title}
                      description={section.description}
                      indicators={section.indicators}
                      data={data}
                      isLoading={isLoadingData}
                      sectionColor={section.color}
                    />
                  ))}
                </div>
              )}

              {/* État vide */}
              {!isLoadingMetadata && !isLoadingData && data && data.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <h4 className="empty-title">Aucune donnée disponible</h4>
                  <p className="empty-description">
                    Aucune donnée n'a été trouvée pour les critères sélectionnés. 
                    Essayez de modifier les filtres.
                  </p>
                  <div className="empty-help">
                    Si le problème persiste, notre équipe est disponible pour vous aider.
                  </div>
                </div>
              )}

              {/* Footer informatif */}
              {!isLoadingMetadata && (
                <div className="info-footer-container">
                  <div className="info-card">
                    <Row>
                      <Col md={6} className="mb-3 mb-md-0">
                        <div className="info-item">
                          <div className="info-icon primary">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                            </svg>
                          </div>
                          <div className="info-content">
                            <h6>À propos des données</h6>
                            <p>
                              Nous menons des travaux statistiques pour estimer l'empreinte sociétale 
                              des branches économiques françaises, anticiper leurs évolutions et formuler 
                              des trajectoires cibles compatibles avec les objectifs nationaux.
                            </p>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <div className="info-icon secondary">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <div className="info-content">
                            <h6>Méthodologie</h6>
                            <p>
                              L'empreinte sociétale mesure 12 dimensions selon une méthodologie
                              transparente et standardisée, accessible dans notre documentation.
                            </p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}