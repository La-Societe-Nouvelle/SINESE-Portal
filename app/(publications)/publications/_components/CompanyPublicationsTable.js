"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal, Button, Spinner } from "react-bootstrap";
import { ChevronDown, Edit2, FileText, Building2, Check, Plus, ExternalLink, AlertCircle, Trash2, Paperclip, Eye, RotateCcw, MessageSquare } from "lucide-react";
import AddLegalUnitModal from "./modals/AddLegalUnitModal";
import { REPORT_TYPES } from "./forms/ReportForm";
import indicators from "../_lib/indicators.json";

export default function CompanyPublicationsTable({ legalunits = [], publications = [] }) {
  const router = useRouter();
  const [expandedUnits, setExpandedUnits] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState(null);
  const [showDeleteUnitModal, setShowDeleteUnitModal] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [deletingUnitId, setDeletingUnitId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPublication, setViewPublication] = useState(null);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [pubToRevert, setPubToRevert] = useState(null);
  const [revertingId, setRevertingId] = useState(null);
  const [showRejectCommentModal, setShowRejectCommentModal] = useState(false);
  const [rejectCommentToView, setRejectCommentToView] = useState(null);

  // Grouper les publications par entreprise
  const publicationsByUnit = publications.reduce((acc, pub) => {
    const unitId = pub.legal_unit_id || 'unknown';
    if (!acc[unitId]) {
      acc[unitId] = [];
    }
    acc[unitId].push(pub);
    return acc;
  }, {});

  // Fusionner les données entreprises avec leurs publications
  const legalUnitsWithPublications = legalunits.map(unit => ({
    ...unit,
    publications: publicationsByUnit[unit.id] || [],
  }));

  const toggleExpand = (unitId) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const openDeleteModal = (publicationId, year) => {
    setPublicationToDelete({ id: publicationId, year });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!publicationToDelete) return;

    setDeletingId(publicationToDelete.id);
    setShowDeleteModal(false);

    try {
      const res = await fetch(`/api/publications/${publicationToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erreur lors de la suppression");
        return;
      }

      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      console.error("Error deleting publication:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
      setPublicationToDelete(null);
    }
  };

  const openDeleteUnitModal = (unit) => {
    setUnitToDelete(unit);
    setShowDeleteUnitModal(true);
  };

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;

    setDeletingUnitId(unitToDelete.id);
    setShowDeleteUnitModal(false);

    try {
      const res = await fetch(`/api/legal-units/${unitToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erreur lors de la suppression");
        return;
      }

      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      console.error("Error deleting legal unit:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingUnitId(null);
      setUnitToDelete(null);
    }
  };

  const openRevertModal = (pub) => {
    setPubToRevert(pub);
    setShowRevertModal(true);
  };

  const handleRevertToDraft = async () => {
    if (!pubToRevert) return;
    setRevertingId(pubToRevert.id);
    setShowRevertModal(false);
    try {
      const res = await fetch(`/api/publications/${pubToRevert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erreur lors de l'annulation");
        return;
      }
      router.refresh();
    } catch (error) {
      console.error("Error reverting publication:", error);
      alert("Erreur lors de l'annulation");
    } finally {
      setRevertingId(null);
      setPubToRevert(null);
    }
  };

  const openViewModal = (pub) => {
    setViewPublication(pub);
    setShowViewModal(true);
  };

  // Check if a legal unit can be deleted (no publications or only drafts)
  const canDeleteUnit = (unit) => {
    const unitPublications = unit.publications || [];
    if (unitPublications.length === 0) return true;
    return unitPublications.every((pub) => pub.status === "draft");
  };

  const handleAdd = async (legalunit) => {
    setLoading(true);
    try {
      const res = await fetch("/api/legal-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(legalunit),
      });

      if (res.ok) {
        router.refresh();
        // Wait a bit for the refresh to complete before hiding loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowAddModal(false);
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de l'ajout de l'entreprise");
      }
    } catch (error) {
      console.error("Error adding legal unit:", error);
      alert("Erreur lors de l'ajout de l'entreprise");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'draft') {
      return (
        <span className="status-badge status-draft">
          <span className="status-dot"></span>
          Brouillon
        </span>
      );
    }
    if(status === 'pending') {
      return (
        <span className="status-badge status-pending">
          <span className="status-dot"></span>
          En attente de validation
        </span>
      );
    }
    if(status === 'rejected') {
      return (
        <span className="status-badge status-rejected">
          <span className="status-dot"></span>
          Rejetée
        </span>
      );
    }
    return (
      <span className="status-badge status-published">
        <Check size={14} className="me-1" />
        Publié
      </span>
    );
  };

  const getReportBadge = (pub) => {
    // Affiche un badge uniquement si un rapport est joint
    if (!pub.report_count || parseInt(pub.report_count) === 0) {
      return null;
    }
    const reportLabel = REPORT_TYPES.find(t => t.value === pub.report_type)?.label || 'Rapport de durabilité';
    return (
      <span className="type-badge type-report small" title={reportLabel}>
        <Paperclip size={12} className="me-1" />
        {reportLabel}
      </span>
    );
  };

  if (!legalUnitsWithPublications || legalUnitsWithPublications.length === 0) {
    return (
      <>
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="mt-3 me-3"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Plus size={16} className="me-2" style={{ display: 'inline' }} />
                Ajouter une entreprise
              </>
            )}
          </Button>
        </div>
        <div className="empty-state">
          <Building2 size={48} className="mb-3 text-muted" />
          <h5 className="text-muted">Aucune entreprise trouvée</h5>
          <p className="text-muted small">Ajoutez votre première entreprise pour commencer.</p>
        </div>
        <AddLegalUnitModal show={showAddModal} onHide={() => setShowAddModal(false)} onAdd={handleAdd} />
      </>
    );
  }

  return (
    <div className="table-wrapper" style={{ position: 'relative' }}>
      {(loading || deletingId || deletingUnitId) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '8px',
          }}
        >
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 mb-0 text-muted">
              {loading && 'Ajout en cours...'}
              {deletingId && 'Suppression de la publication...'}
              {deletingUnitId && 'Suppression de l\'entreprise...'}
            </p>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="secondary"
          onClick={() => setShowAddModal(true)}
          className="mt-3 me-3"
          disabled={loading || deletingId || deletingUnitId}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Ajout en cours...
            </>
          ) : (
            <>
              <Plus size={16} className="me-2" style={{ display: 'inline' }} />
              Ajouter une entreprise
            </>
          )}
        </Button>
      </div>
      <table className="table table-responsive unified-table">
        <thead>
          <tr>
            <th style={{ width: '5%' }}></th>
            <th>
              <Building2 size={16} className="me-2" />
              Entreprise
            </th>

            <th style={{ width: '12%' }}>Publications</th>
            <th 
            className="text-center"
            style={{ width: '20%' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {legalUnitsWithPublications.map((unit) => (
            <React.Fragment key={unit.id}>
              <tr
                className="unit-row"
                onClick={() => toggleExpand(unit.id)}
                style={{ cursor: 'pointer' }}
              >
                <td className="expand-cell">
                  <ChevronDown
                    size={18}
                    className={`expand-icon ${expandedUnits[unit.id] ? 'expanded' : ''}`}
                  />
                </td>
                <td>
                  <div className="enterprise-info">
                    <Building2 size={18} className="enterprise-icon" />
                    <div>
                      <div className="enterprise-name">{unit.denomination}</div>
                      <div className="enterprise-siren text-muted small">SIREN: {unit.siren}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="publication-status-badges">
                    {unit.publicationStatus?.published > 0 && (
                      <span
                        className="status-badge status-published"
                        title={`${unit.publicationStatus.published} publication${unit.publicationStatus.published > 1 ? 's' : ''} publiée${unit.publicationStatus.published > 1 ? 's' : ''}`}
                      >
                        <Check size={14} />
                        <span>{unit.publicationStatus.published}</span>
                      </span>
                    )}
                    {unit.publicationStatus?.pending > 0 && (
                      <span
                        className="status-badge status-pending"
                        title={`${unit.publicationStatus.pending} demande${unit.publicationStatus.pending > 1 ? 's' : ''} en attente de validation`}
                      >
                        <AlertCircle size={14} />
                        <span>{unit.publicationStatus.pending}</span>
                      </span>
                    )}
                    {unit.publicationStatus?.draft > 0 && (
                      <span
                        className="status-badge status-draft"
                        title={`${unit.publicationStatus.draft} brouillon${unit.publicationStatus.draft > 1 ? 's' : ''}`}
                      >
                        <FileText size={14} />
                        <span>{unit.publicationStatus.draft}</span>
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link
                      href={`/publications/espace/publier?legalunit=${unit.id}`}
                      className="btn btn-primary"
                      title="Créer une nouvelle publication"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Plus size={16} />
                      <span>Publier</span>
                    </Link>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteUnitModal(unit);
                      }}
                      variant="light"
                      title={
                        !canDeleteUnit(unit)
                          ? "Impossible de supprimer une entreprise avec des publications publiées ou en attente"
                          : "Supprimer cette entreprise"
                      }
                      disabled={deletingUnitId === unit.id || !canDeleteUnit(unit)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  
                  </div>
                </td>
              </tr>

              {/* Publications listées sous l'entreprise */}
              {expandedUnits[unit.id] && (
                <>
                  {unit.publications.length > 0 ? (
                    unit.publications.map((pub) => (
                      <tr key={pub.id} className="publication-detail-row">
                        <td></td>
                        <td>
                          <div className="publication-detail-info">
                            <FileText size={16} className="publication-icon" />
                            <span className="publication-year">Année {pub.year}</span>
                            {getReportBadge(pub)}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {getStatusBadge(pub.status)}
                            {pub.status === 'rejected' && pub.rejection_comment && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setRejectCommentToView(pub.rejection_comment); setShowRejectCommentModal(true); }}
                                className="btn btn-link p-0 text-danger"
                                title="Voir le motif de rejet"
                                style={{ lineHeight: 1 }}
                              >
                                <MessageSquare size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="text-end">
                            {pub.status === 'draft' && (
                              <div className="d-flex gap-2 justify-content-end align-items-center">
                                <Link
                                  href={`/publications/espace/publier/${pub.id}`}
                                  className="small text-primary"
                                  title="Modifier cette publication"
                                >
                                  <Edit2 size={10} className="me-1" />
                                  <span>Modifier</span>
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(pub.id, pub.year);
                                  }}
                                  className="btn btn-link btn-sm text-danger p-0 small"
                                  title="Supprimer ce brouillon"
                                  disabled={deletingId === pub.id}
                                >
                                  <Trash2 size={10} className="me-1" />
                                  <span>{deletingId === pub.id ? "..." : "Supprimer"}</span>
                                </button>
                              </div>
                            )}
                            {pub.status === 'pending' && (
                              <div className="d-flex gap-2 justify-content-end align-items-center">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openViewModal(pub); }}
                                  className="btn btn-link btn-sm text-primary p-0 small"
                                  title="Consulter le contenu de la demande"
                                >
                                  <Eye size={10} className="me-1" />
                                  <span>Consulter</span>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openRevertModal(pub); }}
                                  className="btn btn-link btn-sm text-warning p-0 small"
                                  title="Annuler la demande et repasser en brouillon"
                                  disabled={revertingId === pub.id}
                                >
                                  <RotateCcw size={10} className="me-1" />
                                  <span>{revertingId === pub.id ? "..." : "Annuler"}</span>
                                </button>
                              </div>
                            )}
                            {pub.status === 'rejected' && (
                              <Link
                                href={`/publications/espace/publier/${pub.id}`}
                                className="small text-primary"
                                title="Modifier et resoumettre"
                              >
                                <Edit2 size={10} className="me-1" />
                                <span>Modifier</span>
                              </Link>
                            )}
                            {pub.status === 'published' && (
                              <Link
                                href={`/entreprise/${pub.siren}`}
                                className="small text-primary"
                                title="Voir la publication sur SINESE"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink size={10} className="me-2" />
                                <span>Voir</span>
                              </Link>
                            )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="no-publications-row">
                      <td></td>
                      <td colSpan="4">
                        <div className="text-muted small">
                          Aucune publication pour cette entreprise
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Delete Publication Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Trash2 size={20} className="text-danger" />
            <span>Supprimer le brouillon</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Êtes-vous sûr de vouloir supprimer le brouillon pour l'année{" "}
            <strong>{publicationToDelete?.year}</strong> ?
          </p>
          <p className="text-muted small mt-2 mb-0">
            Cette action est irréversible.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowDeleteModal(false)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            <Trash2 size={16} className="me-1" />
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Legal Unit Confirmation Modal */}
      <Modal
        show={showDeleteUnitModal}
        onHide={() => setShowDeleteUnitModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Trash2 size={20} className="text-danger" />
            <span>Supprimer l'entreprise</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Êtes-vous sûr de vouloir supprimer l'entreprise{" "}
            <strong>{unitToDelete?.denomination}</strong> (SIREN: {unitToDelete?.siren}) ?
          </p>
          {unitToDelete?.publications?.length > 0 && (
            <p className="text-warning small mb-2">
              <AlertCircle size={14} className="me-1" />
              {unitToDelete.publications.length} brouillon{unitToDelete.publications.length > 1 ? "s" : ""}{" "}
              sera{unitToDelete.publications.length > 1 ? "ont" : ""} également supprimé{unitToDelete.publications.length > 1 ? "s" : ""}.
            </p>
          )}
          <p className="text-muted small mt-2 mb-0">
            Cette action est irréversible.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => setShowDeleteUnitModal(false)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteUnit}
          >
            <Trash2 size={16} className="me-1" />
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Legal Unit Modal */}
      <AddLegalUnitModal show={showAddModal} onHide={() => setShowAddModal(false)} onAdd={handleAdd} />

      {/* Rejection Comment Modal */}
      <Modal show={showRejectCommentModal} onHide={() => setShowRejectCommentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <MessageSquare size={20} className="text-danger" />
            <span>Motif de rejet</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">{rejectCommentToView}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowRejectCommentModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Revert to Draft Confirmation Modal */}
      <Modal show={showRevertModal} onHide={() => setShowRevertModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <RotateCcw size={20} className="text-warning" />
            <span>Annuler la demande</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Êtes-vous sûr de vouloir annuler la demande pour l'année{" "}
            <strong>{pubToRevert?.year}</strong> ?
          </p>
          <p className="text-muted small mt-2 mb-0">
            La demande repassera en brouillon et vous pourrez la modifier avant de la resoumettre.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowRevertModal(false)}>
            Conserver
          </Button>
          <Button variant="warning" onClick={handleRevertToDraft}>
            <RotateCcw size={16} className="me-1" />
            Annuler la demande
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Pending Publication Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Eye size={20} />
            <span>Demande en attente — {viewPublication?.legalunit} ({viewPublication?.year})</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewPublication && (
            <>
              <div className="mb-3">
                <span className="text-muted small">SIREN : </span>
                <strong>{viewPublication.siren}</strong>
                {(viewPublication.period_start || viewPublication.period_end) && (
                  <span className="ms-3 text-muted small">
                    Période : {viewPublication.period_start ?? "—"} → {viewPublication.period_end ?? "—"}
                  </span>
                )}
              </div>

              {viewPublication.report_count > 0 && (
                <div className="mb-3">
                  <h6 className="text-muted small text-uppercase mb-1">Rapport joint</h6>
                  <span className="type-badge type-report small">
                    <Paperclip size={12} className="me-1" />
                    {REPORT_TYPES.find(t => t.value === viewPublication.report_type)?.label || viewPublication.report_type}
                  </span>
                </div>
              )}

              {viewPublication.data && Object.keys(viewPublication.data).length > 0 ? (
                <div>
                  <h6 className="text-muted small text-uppercase mb-2">Indicateurs déclarés</h6>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Indicateur</th>
                        <th className="text-end">Valeur</th>
                        <th className="text-end">Incertitude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(viewPublication.data).map(([code, indic]) => (
                        <tr key={code}>
                          <td>
                            <span className="fw-medium">{indicators[code]?.libelle ?? code}</span>
                            {indic.comment && (
                              <div className="text-muted small">{indic.comment}</div>
                            )}
                          </td>
                          <td className="text-end">
                            {indic.value}{indicators[code]?.unit ? ` ${indicators[code].unit}` : ""}
                          </td>
                          <td className="text-end">
                            {indic.uncertainty ? `± ${indic.uncertainty}%` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted small">Aucun indicateur renseigné.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowViewModal(false)}>
            Fermer
          </Button>
          <Button variant="warning" onClick={() => { setShowViewModal(false); openRevertModal(viewPublication); }}>
            <RotateCcw size={16} className="me-1" />
            Annuler la demande
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
