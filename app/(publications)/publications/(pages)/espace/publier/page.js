import PublicationForm from "@/(publications)/publications/_components/forms/PublicationForm";
import PublicationsPageHeader from "@/(publications)/publications/_components/PublicationsPageHeader";
import { getLegalUnitById } from "@/services/server/legalUnitService";

async function PublicationFormWrapper({ searchParams }) {
  const params = await searchParams;
  const selectedLegalunitId = params?.legalunit;

  let initialData = {};
  let isLegalUnitPreselected = false;

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
        title="Publier sur SINESE"
        description="Publiez des indicateurs et/ou un rapport de durabilité pour une entreprise."
      />
      <div className="container">
        <PublicationFormWrapper searchParams={searchParams} />
      </div>
    </div>
  );
}
