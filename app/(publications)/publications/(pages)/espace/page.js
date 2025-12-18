import { authOptions } from "@/api/auth/[...nextauth]/route";
import { getCompaniesCount, getDraftPublicationsCount, getLastPublication } from "@/services/userDashboardService";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PublicationsPageHeader from "@/(publications)/publications/_components/PublicationsPageHeader";

export default async function EspacePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/connexion");
  }

  const userId = session.user.id;
  const [lastPub, companiesCount, draftCount] = await Promise.all([
    getLastPublication(userId),
    getCompaniesCount(userId),
    getDraftPublicationsCount(userId),
  ]);

  return (
    <div className="espace-page">
      <PublicationsPageHeader
        title="Bienvenue sur votre espace"
        description="Depuis cet espace, vous pouvez effectuer une demande de publication sur le portail SINESE, gérer vos entreprises et accéder à vos documents."
      />
      <div className="container">
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card mb-3 p-3 shadow-sm">
              <div className="card-body">
                <h3 className="h4 card-title">
                  <i className="bi bi-file-earmark-text-fill small text-primary"></i>
                  Dernière publication
                </h3>
                <p className="card-text">
                  {lastPub ? (
                    <>
                      Entreprise: {lastPub.company_name} | Année: {lastPub.year}
                    </>
                  ) : (
                    <>Aucune publication</>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-3 p-3 shadow-sm ">
              <div className="card-body">
                <h3 className="h4 card-title">
                  <i className="bi bi-building-fill small text-primary"></i>
                  Entreprises suivies</h3>
                <p className="card-text">
                  {companiesCount} unité{companiesCount > 1 ? "s" : ""} légale{companiesCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-3 p-3 shadow-sm">
              <div className="card-body">
                <h3 className="h4 card-title">
                  <i className="bi bi-pencil-square small text-primary"></i>
                  Publications à compléter</h3>
                <p className="card-text">
                  {draftCount} brouillon{draftCount > 1 ? "s" : ""} en attente
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4 p-3 shadow-sm">
              <div className="row">
                <div className="col-10">
                  <div className="card-body">
                    <h4 className="card-title">Publier des indicateurs</h4>
                    <p className="card-text">Commencez une nouvelle déclaration pour une entreprise.</p>
                    <a href="/publications/espace/publier" className="btn btn-secondary">
                      Accéder au formulaire
                    </a>
                  </div>
                </div>
                <div className="col-2 d-flex align-items-center justify-content-center">
                  <img src="/illustrations/form.svg" alt="" className="img-fluid" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4 p-3 shadow-sm">
              <div className="row">
                <div className="col-10">
                  <div className="card-body">
                    <h4 className="card-title">Gestion</h4>
                    <p className="card-text">Gérez vos publications et entreprises en un seul endroit.</p>
                    <a href="/publications/espace/gestion" className="btn btn-primary">
                      Accéder à la gestion
                    </a>
                  </div>
                </div>
                <div className="col-2 d-flex align-items-center justify-content-center">
                  <img src="/illustrations/documents.svg" alt="" className="img-fluid" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4 p-3 shadow-sm">
              <div className="row">
                <div className="col-10">
                  <div className="card-body">
                    <h4  className="card-title">
                      Mesurer mon empreinte ?
                    </h4>
                    <p className="card-text">Accédez à notre solution libre.</p>
                    <a href="https://lasocietenouvelle.org/ressources/application-mesure-impact" target="_blank" className="btn btn-primary">
                      <i className="bi bi-box-arrow-up-right me-1"/>Accéder à Metriz
                    </a>
                  </div>
                </div>
                <div className="col-2 d-flex align-items-center justify-content-center">
                  <img src="/illustrations/documents.svg" alt="" className="img-fluid" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
