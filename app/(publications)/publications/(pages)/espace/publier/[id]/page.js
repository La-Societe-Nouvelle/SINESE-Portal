import { getPublicationById } from "@/services/server/publicationService";
import Link from "next/link";
import PublicationForm from "@/(publications)/publications/_components/forms/PublicationForm";
import PublicationsPageHeader from "@/(publications)/publications/_components/PublicationsPageHeader";

export default async function EditPublicationPage({ params }) {
  const { id } = await params;

  const publication = await getPublicationById(id);

  if (!publication || publication.status !== "draft") {
    return (
      <div>
        <PublicationsPageHeader
          title="Modifier une publication"
          description="Modifiez votre publication en brouillon."
        />
        <div className="container">
          <div className="alert alert-warning">
            <p>Publication introuvable ou non modifiable.</p>
            <Link href="/publications/espace/gestion" className="btn btn-secondary mt-2">
              Retour à mes publications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PublicationsPageHeader
        title="Modifier une publication"
        description="Modifiez votre publication en brouillon."
      />
      <div className="container">
        <PublicationForm initialData={publication} mode="edit" />
      </div>
    </div>
  );
}
