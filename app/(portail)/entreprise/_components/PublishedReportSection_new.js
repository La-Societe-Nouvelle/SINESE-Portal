"use client";

import { Card } from "react-bootstrap";
import { FileText, Download, FileCheck, FileCode, FileSpreadsheet, HardDrive } from "lucide-react";

/**
 * Section pour afficher les rapports de durabilité publiés (CSRD/VSME/RSE)
 * UI améliorée avec badges type/année/stockage, taille fichier et meilleure lisibilité
 */
export default function PublishedReportSection({ publishedReport }) {
  if (!publishedReport?.hasPublishedDocuments) {
    return null;
  }

  const { documents } = publishedReport;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeColor = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'danger';
    if (ext === 'xbrl' || ext === 'xml') return 'success';
    if (ext === 'xlsx' || ext === 'xls') return 'primary';
    return 'secondary';
  };

  const getReportTypeLabel = (type) => {
    const typeMap = {
      'csrd': 'CSRD',
      'vsme': 'VSME',
      'durabilité': 'Durabilité',
      'sustainability': 'Durabilité',
      'esg': 'ESG'
    };
    return typeMap[type?.toLowerCase()] || type || 'Rapport';
  };

  const getStorageTypeLabel = (storage) => {
    const storageMap = {
      'ovh': 'OVH',
      's3': 'AWS S3',
      'azure': 'Azure',
      'gcp': 'Google Cloud',
      'local': 'Local',
      'internal': 'Interne',
      'url': 'URL'
    };
    return storageMap[storage?.toLowerCase()] || storage || 'Stockage';
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return FileText;
    if (ext === 'xbrl' || ext === 'xml') return FileCode;
    if (ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
    return FileText;
  };

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center">
          <FileCheck size={20} className="me-2" />
          <div>
            <h5 className="mb-0">Rapports publiés</h5>
            <small className="text-muted">{documents.length} rapport{documents.length > 1 ? 's' : ''}</small>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <div className="d-flex flex-column gap-3 px-2">
          {documents.map((doc, index) => {
            const displayName = doc.fileName || doc.name || doc.url || "Fichier";
            const IconComponent = getFileIcon(displayName);
            return (
              <div
                key={index}
                className="d-flex flex-column p-3 border rounded"
                style={{
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.backgroundColor = 'rgba(248, 249, 250, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                {/* Première ligne: icône + nom + badges */}
                <div className="d-flex align-items-flex-start gap-3">
                  <div
                    className="rounded d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: `var(--bs-${getFileTypeColor(displayName)}-subtle)`
                    }}
                  >
                    <IconComponent size={20} className={`text-${getFileTypeColor(displayName)}`} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-dark mb-2">{displayName}</div>
                    <div className="d-flex gap-2 flex-wrap">
                      <span className="badge bg-info text-dark">{getReportTypeLabel(doc.type)}</span>
                      <span className="badge bg-light text-dark border border-secondary-subtle">{doc.year}</span>
                      {doc.storageType && (
                        <span className="badge bg-secondary">{getStorageTypeLabel(doc.storageType)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deuxième ligne: date + taille + bouton télécharger */}
                <div className="d-flex align-items-center justify-content-between mt-3" style={{ marginLeft: '52px' }}>
                  <div className="d-flex gap-4 flex-grow-1">
                    <small className="text-muted">
                      {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </small>
                    {doc.fileSize && (
                      <small className="text-muted d-flex align-items-center gap-1">
                        <HardDrive size={14} />
                        {formatFileSize(doc.fileSize)}
                      </small>
                    )}
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                    style={{ whiteSpace: 'nowrap' }}
                    title={`Télécharger ${displayName}`}
                  >
                    <Download size={16} />
                    <span className="d-none d-sm-inline">Télécharger</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}
