"use client";

import { Card } from "react-bootstrap";
import { FileText, Download, FileCheck, FileCode, FileSpreadsheet } from "lucide-react";

/**
 * Section pour afficher les documents publiés (rapport SINESE)
 */
export default function PublishedReportSection({ publishedReport }) {
  if (!publishedReport?.hasPublishedDocuments) {
    return null;
  }

  const { publication, documents } = publishedReport;

  const getFileTypeColor = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'danger';
    if (ext === 'xbrl' || ext === 'xml') return 'success';
    if (ext === 'xlsx' || ext === 'xls') return 'primary';
    return 'secondary';
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
          <h5 className="mb-0">Rapports publiés</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <div className="d-flex flex-column gap-3">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="d-flex align-items-center p-3 border rounded hover-shadow"
              style={{
                transition: 'all 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'var(--bs-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '';
              }}
            >
              {/* Icône et nom du document */}
              <div className="d-flex align-items-center flex-grow-1">
                <div
                  className="rounded d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: `var(--bs-${getFileTypeColor(doc.name)}-subtle)`,
                    flexShrink: 0
                  }}
                >
                  {(() => {
                    const IconComponent = getFileIcon(doc.name);
                    return <IconComponent size={20} className={`text-${getFileTypeColor(doc.name)}`} />;
                  })()}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">{doc.name}</div>
                  <small className="text-muted">
                    Publié le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </small>
                </div>
              </div>

              {/* Année */}
              <div className="d-flex align-items-center mx-4" style={{ minWidth: '60px' }}>
                <span className="text-dark">{publication.year}</span>
              </div>

              {/* Action - Icône de téléchargement */}
              <div className="d-flex align-items-center">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                  style={{
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  title="Télécharger"
                >
                  <Download size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
