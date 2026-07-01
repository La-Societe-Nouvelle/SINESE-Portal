import { notFound } from "next/navigation";
import { Container } from "react-bootstrap";
import { getLegalUnitData, getLegalUnitHistory, getDivisionFootprint, getPublishedReports } from "@/actions/entreprise";

import PageHeader from "../_components/PageHeader";
import FootprintSection from "../_components/FootprintSection";
import PublishedReportSection from "../_components/PublishedReportSection";

export default async function EntreprisePage({ params }) {
  const { siren } = await params;

  const [companyData, publishedReport] = await Promise.all([
    getLegalUnitData(siren),
    getPublishedReports(siren),
  ]);

  if (!companyData) notFound();

  const { legalUnit, footprint, additionnalData } = companyData;

  const divisionCode = legalUnit.activitePrincipaleCode?.slice(0, 2);
  const [divisionFootprint, legalUnitHistory] = await Promise.all([
    divisionCode ? getDivisionFootprint(divisionCode) : Promise.resolve(null),
    getLegalUnitHistory(siren),
  ]);

  // Compléter avec les valeurs sectorielles par défaut pour les indicateurs ESE manquants
  const ESE_PANEL = ['ECO','ART','SOC','IDR','GEQ','KNW','GHG','NRG','WAT','MAT','WAS','HAZ'];
  const mergedFootprint = { ...footprint };
  for (const indic of ESE_PANEL) {
    if (!mergedFootprint[indic] && divisionFootprint?.[indic]) {
      mergedFootprint[indic] = { ...divisionFootprint[indic], flag: 'd' };
    }
  }

  const hasDefaultData = Object.values(mergedFootprint).some(f => f.flag === 'd');

  return (
    <div className="open-data-portal">
      <PageHeader legalUnit={legalUnit} />

      <Container>
        <PublishedReportSection publishedReport={publishedReport} />

        <FootprintSection
          hasDefaultData={hasDefaultData}
          footprint={mergedFootprint}
          divisionFootprint={divisionFootprint}
          historicalDivisionFootprint={null}
          additionnalData={additionnalData}
          legalUnitHistory={legalUnitHistory}
        />
      </Container>
    </div>
  );
}
