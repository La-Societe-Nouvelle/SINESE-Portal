"use client";

import { useState } from "react";
import { Alert } from "react-bootstrap";

export default function ExportBar({ selectedIds, onClear }) {
  const [loading, setLoading] = useState(null); // 'zip' | null
  const [warning, setWarning] = useState(null);

  if (selectedIds.size <= 1) return null;

  const idsParam = Array.from(selectedIds).join(",");

  const exportZip = async () => {
    setLoading("zip");
    setWarning(null);
    try {
      const res = await fetch(`/api/rapports/export-zip?ids=${idsParam}`);
      if (!res.ok) throw new Error("export failed");
      const excludedHeader = res.headers.get("X-Excluded-Reports");
      if (excludedHeader) {
        setWarning(`${excludedHeader.split(",").length} rapport(s) exclu(s) du zip (lien externe non téléchargeable).`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rapports.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setWarning("Échec de l'export ZIP.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {warning && (
        <Alert variant="warning" dismissible onClose={() => setWarning(null)} className="mt-3 mb-0 small">
          {warning}
        </Alert>
      )}
      <div className="mt-3 position-sticky bottom-0 bg-white border-top shadow-sm p-3 d-flex align-items-center border-light justify-content-between gap-3">
        <div>
          <span className="small"> {selectedIds.size} rapport(s) sélectionné(s)</span>
          <button className="btn btn-link btn-sm" onClick={onClear}>Effacer la sélection</button>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={exportZip} disabled={loading !== null}>
          {loading === "zip" ? "Export en cours…" : "Télécharger les fichiers (ZIP)"}
        </button>
      </div>
    </>
  );
}
