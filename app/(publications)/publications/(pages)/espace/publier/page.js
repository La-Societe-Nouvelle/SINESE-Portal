import PublicationForm from "@/(publications)/publications/_components/forms/PublicationForm";
import PublicationsPageHeader from "@/(publications)/publications/_components/PublicationsPageHeader";
import { getLegalUnitById } from "@/services/server/legalUnitService";

async function PublicationFormWrapper({ searchParams }) {
  const params = await searchParams;
  const selectedLegalunitId = params?.legalunit;

  let initialData = {};
  let isLegalUnitPreselected = false;

  // If a legal unit ID is provided, fetch and pre-select it
  if (selectedLegalunitId) {
    const legalUnit = await getLegalUnitById(selectedLegalunitId);
    if (legalUnit) {
      initialData.legalUnit = legalUnit;
      isLegalUnitPreselected = true;
    }
  }

  return <PublicationForm mode="create" initialData={initialData} isLegalUnitPreselected={isLegalUnitPreselected} />;
}

export default async function PublicationPage({ searchParams }) {
  return (
    <div>
      <PublicationsPageHeader
        title="Publier des indicateurs"
        description="Commencez une nouvelle déclaration pour une entreprise."
      />
      <div className="container">
        <PublicationFormWrapper searchParams={searchParams} />
      </div>
    </div>
  );
}
