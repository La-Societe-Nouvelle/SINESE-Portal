"use client";

import { useParams } from "next/navigation";
import { Container } from "react-bootstrap";

import ErrorAlert from "@/_components/Error";

// Composants modulaires
import PageHeader from "../_components/PageHeader";
import FootprintSection from "../_components/FootprintSection";
import LoadingState from "../_components/LoadingState";
import DefaultDataExplanation from "../_components/DefaultDataExplanation";
import PublishDataCTA from "../_components/PublishDataCTA";
import PublishedReportSection from "../_components/PublishedReportSection";

// Hooks personnalisés
import { useCompanyData } from "../_hooks/useCompanyData";

export default function EntreprisePage() {
  const { siren } = useParams();

  const {
    legalUnit,
    footprint,
    additionnalData,
    divisionFootprint,
    historicalDivisionFootprint,
    publishedReport,
    loading,
    error,
    hasDefaultData,
    isDataReady
  } = useCompanyData(siren);

  return (
    <div className="open-data-portal">
      {legalUnit && (
        <PageHeader
          legalUnit={legalUnit}
        />
      )}

      <Container>
        {/* État de chargement */}
        {loading && <LoadingState siren={siren} />}

        {/* État d'erreur */}
        {error && !loading && <ErrorAlert code={error.code} />}

        {/* Contenu principal */}
        {isDataReady && (
          <>
            {/* Explication des données par défaut */}
            <DefaultDataExplanation hasDefaultData={hasDefaultData} />

            {/* Publication SINESE si disponible */}
            <PublishedReportSection publishedReport={publishedReport} />

            {/* Contenu de l'empreinte avec nouvelle UI */}
            <FootprintSection
              footprint={footprint}
              divisionFootprint={divisionFootprint}
              historicalDivisionFootprint={historicalDivisionFootprint}
              additionnalData={additionnalData}
            />

            {/* CTA pour publier les données */}
            <PublishDataCTA  />
          </>
        )}
      </Container>

    </div>
  );
}
