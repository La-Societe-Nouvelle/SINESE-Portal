"use client";

import { useState } from "react";
import { Button } from "react-bootstrap";
import { FileSpreadsheet, Archive, Download, ChevronDown, Loader2 } from "lucide-react";
import { getDatasetDownloadUrl } from "@/actions/datasets";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return null;
  const go = bytes / (1024 * 1024 * 1024);
  return `${go.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Go`;
}

export default function FileRow({ title, format, name, size, fileKey, lastUpdate, contentType, fallbackSize }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("metadonnees");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const sizeLabel = formatBytes(size) || fallbackSize;
  const updatedLabel = lastUpdate
    ? new Date(lastUpdate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : "-";

  const handleDownload = async () => {
    const key = fileKey || `sinese/open-data/${name}`;
    setDownloading(true);
    setDownloadError(null);
    try {
      const result = await getDatasetDownloadUrl(key);
      if (result.error) {
        console.error("Erreur téléchargement dataset:", result.error);
        setDownloadError("Téléchargement indisponible pour ce fichier.");
        return;
      }
      const a = document.createElement("a");
      a.href = result.url;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="file-row">
      <div className="file-row__header">
        <button type="button" className="file-row__summary" onClick={() => setExpanded(!expanded)}>
          <span className="file-row__icon">
            {format === "PARQUET" ? <Archive size={18} /> : <FileSpreadsheet size={18} />}
          </span>
          <span className="file-row__title">{title} - {updatedLabel} ({format})</span>
        </button>
        <div className="file-row__actions">
          <Button
            variant="outline-primary"
            size="sm"
            className="file-row__toggle"
            disabled={downloading}
            onClick={handleDownload}
          >
            {downloading ? <Loader2 size={14} className="me-1 spin" /> : <Download size={14} className="me-1" />}
            Télécharger
          </Button>
          <button
            type="button"
            className="file-row__expand"
            aria-label={expanded ? "Masquer les métadonnées" : "Voir les métadonnées"}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown size={16} className={`file-row__chevron ${expanded ? "is-open" : ""}`} />
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="file-row__error text-danger small mt-1">{downloadError}</div>
      )}

      {expanded && (
        <>
          <div className="dataset-tabs">
            <button
              type="button"
              className={`dataset-tabs__item ${activeTab === "metadonnees" ? "is-active" : ""}`}
              onClick={() => setActiveTab("metadonnees")}
            >
              Métadonnées
            </button>
            <button
              type="button"
              className={`dataset-tabs__item ${activeTab === "telechargements" ? "is-active" : ""}`}
              onClick={() => setActiveTab("telechargements")}
            >
              Téléchargements
            </button>
          </div>

          {activeTab === "metadonnees" ? (
            <div className="file-row__grid">
              <div>
                <dt>Mis à jour le</dt>
                <dd>{updatedLabel}</dd>
              </div>
              <div>
                <dt>Taille</dt>
                <dd>{sizeLabel}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{format}</dd>
              </div>
              <div>
                <dt>Type MIME</dt>
                <dd>{contentType || "-"}</dd>
              </div>
            </div>
          ) : (
            <div className="file-row__download-link" onClick={handleDownload} role="button" tabIndex={0}>
              <Download size={14} className="me-1" />
              {downloading ? "Génération du lien..." : `Format ${format} - ${sizeLabel}`}
            </div>
          )}
        </>
      )}
    </div>
  );
}
