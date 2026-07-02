export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { Container, Alert } from "react-bootstrap";
import { getMacroMetadata, getMacroData } from "@/actions/macrodata";
import { isError, getErrorMessage } from "@/_libs/errors";
import { indicatorSections } from "./_config/indicators";
import IndicatorSection from "./_components/IndicatorSection";
import MacroFilterBar from "./_components/MacroFilterBar";

async function MacroContent({ industry, country, aggregate }) {
  const dataResult = await getMacroData(industry, country, aggregate);

  if (isError(dataResult)) {
    return (
      <Alert variant="danger" className="mt-3">
        {getErrorMessage(dataResult)}
      </Alert>
    );
  }

  return (
    <div className="indicators-content">
      {indicatorSections.map((section) => (
        <IndicatorSection
          key={section.id}
          title={section.title}
          description={section.description}
          indicators={section.indicators}
          data={dataResult}
          isLoading={false}
          sectionColor={section.color}
        />
      ))}
    </div>
  );
}

export default async function MacroeconomiesPage({ searchParams }) {
  const params = await searchParams;
  const { industry = 'TOTAL', country = 'FRA', aggregate = 'PRD' } = params || {};

  const metadataResult = await getMacroMetadata();

  if (isError(metadataResult)) {
    return (
      <div className="macroeconomies-page">
        <div className="macro-header bg-primary text-white py-4">
          <Container>
            <h2>Macroéconomie</h2>
            <p>Explorez l'empreinte des activités économiques par secteur et par pays</p>
          </Container>
        </div>
        <Container className="pb-4">
          <Alert variant="danger" className="mt-3">
            {getErrorMessage(metadataResult)}
          </Alert>
        </Container>
      </div>
    );
  }

  const suspenseKey = `${industry}-${country}-${aggregate}`;

  return (
    <div className="macroeconomies-page">
      <div className="macro-header bg-primary text-white py-4">
        <Container>
          <div className="d-flex align-items-center mb-3">
            <div className="page-icon me-3">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>
            <div>
              <h2 className="mb-1">Macroéconomie</h2>
              <p className="mb-0 opacity-8">
                Explorez l'empreinte des activités économiques par secteur et par pays
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <div className="main-content">
          <MacroFilterBar metadata={metadataResult} />

          <Suspense key={suspenseKey} fallback={
            <div className="loading-container">
              <div className="loading-icon" />
              <h5 className="loading-title">Chargement en cours...</h5>
            </div>
          }>
            <MacroContent industry={industry} country={country} aggregate={aggregate} />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
