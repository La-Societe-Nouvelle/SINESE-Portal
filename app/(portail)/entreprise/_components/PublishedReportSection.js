"use client";

import { Card } from "react-bootstrap";
import { FileText, Download, FileCheck, FileCode, FileSpreadsheet } from "lucide-react";
import { REPORT_TYPES } from "@/(publications)/publications/_components/forms/ReportForm";

/**
 * Section pour afficher les rapports de durabilité publiés (CSRD/VSME/RSE)
 * UI améliorée avec badges type/année/stockage, taille fichier et meilleure lisibilité
 */
export default function PublishedReportSection({ publishedReport }) {
  if (!publishedReport?.hasPublishedDocuments) {
    return null;
  }

  const { documents } = publishedReport;



  const getFileTypeColor = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'danger';
    if (ext === 'xbrl' || ext === 'xml') return 'success';
    if (ext === 'xlsx' || ext === 'xls') return 'primary';
    return 'secondary';
  };

  const getReportTypeLabel = (type) => {
    if (!type) return 'Rapport';
    const normalized = String(type).trim().toLowerCase();
    const match = REPORT_TYPES.find((t) => t.value?.toLowerCase() === normalized);
    return match?.label || type;
  };

  const stripExtension = (value) => {
    if (!value || typeof value !== "string") return value;
    const lastDot = value.lastIndexOf(".");
    if (lastDot <= 0) return value;
    return value.slice(0, lastDot);
  };

  const capitalizeFirst = (value) => {
    if (!value || typeof value !== "string") return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getDisplayName = (doc) => {
    let name = null;
    if (doc?.fileName) name = doc.fileName;
    else if (doc?.name) name = doc.name;
    else if (doc?.url) {
      try {
        const parsed = new URL(doc.url);
        const parts = parsed.pathname?.split('/').filter(Boolean) || [];
        const last = parts[parts.length - 1];
        if (last) name = decodeURIComponent(last);
        else return `Lien externe (${parsed.hostname})`;
      } catch {
        return "Lien externe";
      }
    }

    if (!name) return "Lien externe";
    return capitalizeFirst(stripExtension(name));
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
      <Card.Header className=" border-bottom">
        <div className="d-flex align-items-center">
          <FileCheck size={20} className="me-2" />
          <div>
            <h5 className="mb-0">Rapports publiés</h5>
            <small className="text-muted">{documents.length} rapport{documents.length > 1 ? 's' : ''}</small>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <div className="d-flex flex-column px-2">
          {documents.map((doc, index) => {
            const displayName = getDisplayName(doc);
            const iconSource = doc.fileName || doc.name || doc.url || displayName;
            const IconComponent = getFileIcon(iconSource);
            return (
              <div
                key={index}
                className={`d-flex align-items-center justify-content-between py-2 ${index < documents.length - 1 ? 'border-bottom' : ''}`}
                style={{
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(248, 249, 250, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Ligne unique: icône + nom + badges */}
                <div className="d-flex align-items-center gap-3 flex-grow-1">
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
                    <div className="fw-semibold text-dark">{displayName}</div>
                    <div className="d-flex gap-2 flex-wrap mt-1">
                      <span className="badge bg-info text-dark">{getReportTypeLabel(doc.type)}</span>
                      <span className="badge bg-light text-dark border border-secondary-subtle">{doc.year}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2 ms-3"
                  style={{ whiteSpace: 'nowrap' }}
                  title={`Télécharger ${displayName}`}
                >
                  <Download size={16} />
                  <span className="d-none d-sm-inline">Télécharger</span>
                </a>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}
