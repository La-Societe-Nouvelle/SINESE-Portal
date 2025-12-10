"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Container, Card, Table, Badge, Spinner, Alert, Button, Row, Col, Modal } from "react-bootstrap";
import { ClipboardList, Building2, Calendar, User, ExternalLink, RefreshCw, FileText, Users, TrendingUp, Eye, Download, BarChart3 } from "lucide-react";
import Link from "next/link";
import indicators from "../../../_lib/indicators.json";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [publications, setPublications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/publications/connexion");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/publications/espace");
      return;
    }

    if (status === "authenticated") {
      fetchPendingPublications();
    }
  }, [status, session, router]);

  const fetchPendingPublications = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch pending publications
      const pendingRes = await fetch("/api/admin/pending-publications");
      if (!pendingRes.ok) {
        const errorData = await pendingRes.json();
        throw new Error(errorData.error || "Erreur lors du chargement");
      }
      const pendingData = await pendingRes.json();
      setPublications(pendingData.publications);

      // Fetch statistics
      const statsRes = await fetch("/api/admin/publications-stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return <Badge bg="secondary">Brouillon</Badge>;
      case "pending":
        return <Badge bg="warning" text="dark">En attente</Badge>;
      case "published":
        return <Badge bg="success">Publiée</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  const openPublicationDetails = async (publicationId) => {
    setLoadingDetails(true);
    setShowDetailsModal(true);

    try {
      const res = await fetch(`/api/admin/publications/${publicationId}`);
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des détails");
      }
      const data = await res.json();
      setSelectedPublication(data.publication);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPublication(null);
  };

  if (status === "loading" || loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Chargement du dashboard...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <ClipboardList size={28} className="me-2" style={{ display: 'inline' }} />
            Dashboard Admin
          </h1>
          <p className="text-muted mb-0">Gestion des demandes de publication</p>
        </div>
        <Button variant="outline-primary" onClick={fetchPendingPublications} disabled={loading}>
          <RefreshCw size={16} className="me-2" style={{ display: 'inline' }} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Erreur:</strong> {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center h-100">
                <Card.Body>
                  <FileText size={32} className="text-primary mb-2" />
                  <h3 className="text-primary mb-0">
                    {stats.byStatus.draft + stats.byStatus.pending + stats.byStatus.published}
                  </h3>
                  <small className="text-muted">Total Publications</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100">
                <Card.Body>
                  <TrendingUp size={32} className="text-success mb-2" />
                  <h3 className="text-success mb-0">{stats.byStatus.published}</h3>
                  <small className="text-muted">Publiées</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100">
                <Card.Body>
                  <Building2 size={32} className="text-info mb-2" />
                  <h3 className="text-info mb-0">{stats.totalLegalUnits}</h3>
                  <small className="text-muted">Entreprises</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100">
                <Card.Body>
                  <Users size={32} className="text-warning mb-2" />
                  <h3 className="text-warning mb-0">{stats.totalUsers}</h3>
                  <small className="text-muted">Utilisateurs</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Publications */}
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Publications récentes</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {stats.recentPublications.length === 0 ? (
                <div className="text-center py-4">
                  <FileText size={48} className="text-muted mb-3" />
                  <p className="text-muted">Aucune publication</p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "8%" }}>Année</th>
                      <th style={{ width: "25%" }}>Entreprise</th>
                      <th style={{ width: "12%" }}>SIREN</th>
                      <th style={{ width: "10%" }}>Statut</th>
                      <th style={{ width: "20%" }}>Utilisateur</th>
                      <th style={{ width: "15%" }}>Date</th>
                      <th style={{ width: "10%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPublications.map((pub) => (
                      <tr key={pub.id}>
                        <td>
                          <strong>{pub.year}</strong>
                        </td>
                        <td>
                          <span className="small">{pub.denomination}</span>
                        </td>
                        <td>
                          <code className="small">{pub.siren}</code>
                        </td>
                        <td>{getStatusBadge(pub.status)}</td>
                        <td>
                          <span className="small text-muted">{pub.user_email}</span>
                        </td>
                        <td>
                          <span className="small text-muted">{formatDate(pub.created_at)}</span>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openPublicationDetails(pub.id)}
                          >
                            <Eye size={14} style={{ display: 'inline' }} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Pending Publications */}
      <Card>
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Publications en attente de validation</h5>
            <Badge bg="primary" pill>
              {publications.length}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {publications.length === 0 ? (
            <div className="text-center py-5">
              <ClipboardList size={48} className="text-muted mb-3" />
              <p className="text-muted">Aucune publication en attente de validation</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>Année</th>
                  <th style={{ width: "25%" }}>Entreprise</th>
                  <th style={{ width: "15%" }}>SIREN</th>
                  <th style={{ width: "20%" }}>Utilisateur</th>
                  <th style={{ width: "15%" }}>Date de soumission</th>
                  <th style={{ width: "15%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publications.map((pub) => (
                  <tr key={pub.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <Calendar size={16} className="me-2 text-muted" />
                        <strong>{pub.year}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Building2 size={16} className="me-2 text-muted" />
                        <span>{pub.denomination}</span>
                      </div>
                    </td>
                    <td>
                      <code className="small">{pub.siren}</code>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <User size={16} className="me-2 text-muted" />
                        <span className="small">{pub.user_email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="small text-muted">{formatDate(pub.created_at)}</span>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openPublicationDetails(pub.id)}
                      >
                        <Eye size={14} className="me-1" style={{ display: 'inline' }} />
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Publication Details Modal */}
      <Modal show={showDetailsModal} onHide={closeDetailsModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FileText size={20} className="text-primary" />
            <span>Détails de la publication</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Chargement des détails...</p>
            </div>
          ) : selectedPublication ? (
            <div>
              {/* Basic Info */}
              <Card className="mb-3">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">Informations générales</h6>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-2">
                    <Col md={4}>
                      <strong>Entreprise :</strong>
                    </Col>
                    <Col md={8}>
                      {selectedPublication.denomination}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={4}>
                      <strong>SIREN :</strong>
                    </Col>
                    <Col md={8}>
                      <code>{selectedPublication.siren}</code>
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={4}>
                      <strong>Année :</strong>
                    </Col>
                    <Col md={8}>
                      {selectedPublication.year}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={4}>
                      <strong>Période :</strong>
                    </Col>
                    <Col md={8}>
                      {selectedPublication.period_start && selectedPublication.period_end
                        ? `Du ${new Date(selectedPublication.period_start).toLocaleDateString("fr-FR")} au ${new Date(selectedPublication.period_end).toLocaleDateString("fr-FR")}`
                        : "Non renseignée"}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={4}>
                      <strong>Statut :</strong>
                    </Col>
                    <Col md={8}>
                      {getStatusBadge(selectedPublication.status)}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={4}>
                      <strong>Utilisateur :</strong>
                    </Col>
                    <Col md={8}>
                      {selectedPublication.user_email || "Non associé"}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={4}>
                      <strong>Date de création :</strong>
                    </Col>
                    <Col md={8}>
                      {formatDate(selectedPublication.created_at)}
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <strong>Dernière modification :</strong>
                    </Col>
                    <Col md={8}>
                      {formatDate(selectedPublication.updated_at)}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Documents */}
              {selectedPublication.documents && selectedPublication.documents.length > 0 && (
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Documents joints</h6>
                  </Card.Header>
                  <Card.Body>
                    {selectedPublication.documents.map((doc, index) => (
                      <div key={index} className="d-flex align-items-center justify-content-between mb-2">
                        <div>
                          <FileText size={16} className="me-2 text-muted" style={{ display: 'inline' }} />
                          <span>{doc.name || `Document ${index + 1}`}</span>
                          <small className="text-muted ms-2">({doc.type || "PDF"})</small>
                        </div>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <Download size={14} className="me-1" style={{ display: 'inline' }} />
                            Télécharger
                          </a>
                        )}
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              )}

              {/* Indicators - Empreinte sociétale */}
              {selectedPublication.data && Object.keys(selectedPublication.data).length > 0 && (
                <>
                  <Card className="mb-3">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0 d-flex align-items-center">
                        <BarChart3 size={18} className="me-2" />
                        Empreinte sociétale
                      </h6>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <Table className="mb-0 table-sm">
                        <thead>
                          <tr>
                            <th style={{ width: "40%" }}>Indicateur</th>
                            <th style={{ width: "20%" }}>Valeur</th>
                            <th style={{ width: "15%" }}>Incertitude</th>
                            <th style={{ width: "25%" }}>Commentaire</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(indicators).map(([key, meta]) => {
                            const indicator = selectedPublication.data?.[key];
                            if (!indicator || indicator.value === undefined || indicator.value === "") return null;
                            if (meta.category === "Indicateurs supplémentaires") return null;
                            return (
                              <tr key={key}>
                                <td className="small">{meta.libelle}</td>
                                <td className="fw-bold small">{indicator.value}</td>
                                <td className="small">{indicator.uncertainty ?? <span className="text-muted">-</span>}</td>
                                <td className="small text-muted">{indicator.comment || "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>

                  {/* Indicators - Supplémentaires */}
                  {Object.entries(indicators).some(
                    ([key, meta]) =>
                      meta.category === "Indicateurs supplémentaires" &&
                      selectedPublication.data?.[key] &&
                      selectedPublication.data[key].value !== undefined &&
                      selectedPublication.data[key].value !== ""
                  ) && (
                    <Card>
                      <Card.Header className="bg-light">
                        <h6 className="mb-0 d-flex align-items-center">
                          <TrendingUp size={18} className="me-2" />
                          Indicateurs supplémentaires
                        </h6>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <Table className="mb-0 table-sm">
                          <thead>
                            <tr>
                              <th style={{ width: "45%" }}>Indicateur</th>
                              <th style={{ width: "25%" }}>Valeur</th>
                              <th style={{ width: "30%" }}>Commentaire</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(indicators).map(([key, meta]) => {
                              if (meta.category !== "Indicateurs supplémentaires") return null;
                              const indicator = selectedPublication.data?.[key];
                              if (!indicator || indicator.value === undefined || indicator.value === "") return null;
                              return (
                                <tr key={key}>
                                  <td className="small">{meta.libelle}</td>
                                  <td className="fw-bold small">{indicator.value}</td>
                                  <td className="small text-muted">{indicator.comment || "-"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  )}
                </>
              )}
            </div>
          ) : (
            <Alert variant="warning">Aucune donnée disponible</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDetailsModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
