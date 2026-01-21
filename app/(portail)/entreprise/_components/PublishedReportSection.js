"use client";

import { Card } from "react-bootstrap";
import { FileText, Download, FileCheck, FileCode, FileSpreadsheet } from "lucide-react";
import './_published-report-section.scss';

/**
 * Section pour afficher les documents publiés (rapport SINESE)
 */
export default function PublishedReportSection({ publishedReport }) {
  if (!publishedReport?.hasPublishedDocuments) {
    return null;
  }

  const { documents } = publishedReport;

  const getFileTypeColor = (mimeType) => {
    if (!mimeType) return 'secondary';
    const mime = mimeType.toLowerCase();
    if (mime.includes('pdf')) return 'danger';
    if (mime.includes('xbrl') || mime.includes('xml')) return 'success';
    if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('sheet')) return 'primary';
    if (mime.includes('word') || mime.includes('document')) return 'warning';
    return 'secondary';
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return FileText;
    const mime = mimeType.toLowerCase();
    if (mime.includes('pdf')) return FileText;
    if (mime.includes('xbrl') || mime.includes('xml')) return FileCode;
    if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('sheet')) return FileSpreadsheet;
    return FileText;
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      'csrd': 'CSRD',
      'vsme': 'VSME',
      'rse': 'RSE',
      'esg': 'ESG',
      'durabilité': 'Durabilité',
      'sustainability': 'Durabilité'
    };
    return typeMap[type?.toLowerCase()] || type || 'Rapport';
  };

  const getTypeBadgeColor = (type) => {
    const colorMap = {
      'csrd': 'danger',
      'vsme': 'warning',
      'rse': 'success',
      'esg': 'info',
      'durabilité': 'secondary',
      'sustainability': 'secondary'
    };
    return colorMap[type?.toLowerCase()] || 'secondary';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="mb-4 shadow-sm border-0 published-report-section">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center">
          <FileCheck size={20} className="me-2" />
          <h5 className="mb-0">Rapports publiés</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <div className="d-flex flex-column gap-4">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="d-flex flex-column flex-sm-row align-items-start p-4 border rounded published-report-section__item"
            >
              {/* Colonne 1: Icône + Infos */}
              <div className="d-flex align-items-flex-start flex-grow-1 w-100 w-sm-auto mb-3 mb-sm-0 me-sm-4">
                <div
                  className={`rounded d-flex align-items-center justify-content-center me-3 flex-shrink-0 published-report-section__icon bg-${getFileTypeColor(doc.contentType)}-subtle`}
                >
                  {(() => {
                    const IconComponent = getFileIcon(doc.contentType);
                    return <IconComponent size={22} className={`text-${getFileTypeColor(doc.contentType)}`} />;
                  })()}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-semibold text-dark mb-2 published-report-section__filename">
                    {doc.fileName || doc.name || "Fichier"}
                  </div>
                  <div className="d-flex gap-2 flex-wrap align-items-center mb-2">
                    <span className={`badge bg-${getTypeBadgeColor(doc.type)} text-white`}>
                      {getTypeLabel(doc.type)}
                    </span>
                    <span className="badge bg-light text-dark border border-secondary-subtle">{doc.year}</span>
                  </div>
                  {doc.fileSize && (
                    <small className="text-muted d-block">
                      {formatFileSize(doc.fileSize)}
                    </small>
                  )}
                </div>
              </div>

              {/* Colonne 2: Bouton télécharger */}
              <div className="d-flex align-items-center w-sm-auto ms-sm-auto">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 w-100 w-sm-auto justify-content-center justify-content-sm-start"
                  title={`Télécharger ${doc.fileName || 'le rapport'}`}
                >
                  <Download size={16} />
                  <span>Télécharger</span>
                </a>
              </div>
            </div>

          ))}
          
        </div>
      </Card.Body>
    </Card>
  );
}
