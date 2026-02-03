import { authOptions } from "@/api/auth/[...nextauth]/route";
import { getCompaniesCount, getDraftPublicationsCount, getLastPublication } from "@/services/userDashboardService";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PublicationsPageHeader from "@/(publications)/publications/_components/PublicationsPageHeader";
import { FileText, Building2, PenLine, FilePlus, ClipboardList, Calculator, ExternalLink } from "lucide-react";

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
        description="Depuis cet espace, vous pouvez effectuer une demande de publication au sein du répertoire SINESE, gérer vos unités légales et suivre vos demandes en cours."
      />
      <div className="container">
        {/* Cartes statistiques */}
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card mb-3 shadow-sm border-0">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                  <FileText size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="h6 text-muted mb-1">Dernière publication</h3>
                  <p className="mb-0 fw-semibold">
                    {lastPub ? (
                      <>{lastPub.company_name} ({lastPub.year})</>
                    ) : (
                      <span className="text-muted">Aucune publication</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-3 shadow-sm border-0">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                  <Building2 size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="h6 text-muted mb-1">Unités légales</h3>
                  <p className="mb-0 fw-semibold">
                    {companiesCount} unité{companiesCount > 1 ? "s" : ""} légale{companiesCount > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card mb-3 shadow-sm border-0">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                  <PenLine size={24} className="text-warning" />
                </div>
                <div>
                  <h3 className="h6 text-muted mb-1">À compléter</h3>
                  <p className="mb-0 fw-semibold">
                    {draftCount} brouillon{draftCount > 1 ? "s" : ""} en attente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes actions */}
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-body d-flex align-items-center gap-4 p-4">
                <div className="rounded bg-secondary bg-opacity-10 p-3">
                  <FilePlus size={32} className="text-secondary" />
                </div>
                <div className="flex-grow-1">
                  <h4 className="card-title h5 mb-2">Nouvelle publication</h4>
                  <p className="card-text text-muted small mb-3">
                    Démarrez une nouvelle demande de publication en remplissant le formulaire dédié.
                  </p>
                  <a href="/publications/espace/publier" className="btn btn-secondary btn-sm">
                    Accéder au formulaire
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-body d-flex align-items-center gap-4 p-4">
                <div className="rounded bg-primary bg-opacity-10 p-3">
                  <ClipboardList size={32} className="text-primary" />
                </div>
                <div className="flex-grow-1">
                  <h4 className="card-title h5 mb-2">Suivi des publications</h4>
                  <p className="card-text text-muted small mb-3">
                    Gérez le suivi de vos demandes de publication.
                  </p>
                  <a href="/publications/espace/gestion" className="btn btn-primary btn-sm">
                    Accéder au suivi
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-body d-flex align-items-center gap-4 p-4">
                <div className="rounded bg-info p-3">
                  <Calculator size={32} className="text-primary" />
                </div>
                <div className="flex-grow-1">
                  <h4 className="card-title h5 mb-2">Mesurer mon empreinte</h4>
                  <p className="card-text text-muted small mb-3">
                    Accédez à notre solution libre de mesure d'impact.
                  </p>
                  <a
                    href="https://lasocietenouvelle.org/ressources/application-mesure-impact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <ExternalLink size={14} className="me-1" />
                    Accéder à Metriz
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
