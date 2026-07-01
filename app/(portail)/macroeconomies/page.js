export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { getMacroMetadata, getMacroData } from "@/actions/macrodata";
import { indicatorSections } from "./_config/indicators";
import MacroSidebar from "./_components/MacroSidebar";
import IndicatorSection from "./_components/IndicatorSection";
import PageHeader from "@/_components/PageHeader";

async function MacroContent({ industry, country, aggregate }) {
  const data = await getMacroData(industry, country, aggregate);

  return (
    <div className="indicators-content">
      {indicatorSections.map((section) => (
        <IndicatorSection
          key={section.id}
          title={section.title}
          description={section.description}
          indicators={section.indicators}
          data={data}
          isLoading={false}
          sectionColor={section.color}
        />
      ))}
    </div>
  );
}

export default async function MacroeconomiesPage({ searchParams }) {
  const params    = await searchParams;
  const industry  = params.industry  || 'TOTAL';
  const country   = params.country   || 'FRA';
  const aggregate = params.aggregate || 'PRD';

  const metadata = await getMacroMetadata();
  const suspenseKey = `${industry}-${country}-${aggregate}`;

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
          <Col lg={3}>
            <MacroSidebar metadata={metadata} />
          </Col>

          <Col lg={9}>
            <div className="main-content">
              <Suspense key={suspenseKey} fallback={
                <div className="loading-container">
                  <div className="loading-icon" />
                  <h5 className="loading-title">Chargement en cours...</h5>
                </div>
              }>
                <MacroContent industry={industry} country={country} aggregate={aggregate} />
              </Suspense>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
