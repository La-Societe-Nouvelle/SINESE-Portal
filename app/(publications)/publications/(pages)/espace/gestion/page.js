import CompanyPublicationsTable from "@/(publications)/publications/_components/CompanyPublicationsTable";
import PublicationsPageHeader from "@/(publications)/publications/_components/PublicationsPageHeader";
import { getPublications } from "@/services/server/publicationService";
import { getLegalUnits } from "@/services/server/legalUnitService";
import { getPublicationStatusByLegalUnit } from "@/services/server/publicationService";

export default async function GestionPage() {
  // Récupérer les publications
  const publications = await getPublications();

  // Récupérer les unités légales avec statuts
  const legalunits = await getLegalUnits();
  const legalunitsWithStatus = await Promise.all(
    legalunits.map(async (unit) => {
      const publicationStatus = await getPublicationStatusByLegalUnit(unit.id);
      return {
        ...unit,
        publicationStatus,
      };
    })
  );
  return (
    <div>
      <PublicationsPageHeader
        title="Publications"
        description="Gérez les demandes de publication de vos entreprises."
      />
      <div className="container">
        <CompanyPublicationsTable
          legalunits={legalunitsWithStatus}
          publications={publications}
        />
      </div>
    </div>
  );
}
