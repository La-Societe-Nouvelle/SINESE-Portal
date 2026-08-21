"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, ExternalLink, FileText, FileCode } from "lucide-react";
import { REPORT_FORMAT_LABELS } from "@/_libs/report-format";
import { REPORT_TYPES } from "@/_libs/report-types";
import { reportFiltersToSearchParams, parseReportFiltersFromParams } from "../_utils/reportParams";

const FORMAT_ICONS = { pdf: FileText, xbrl: FileCode, autre: FileText };

const SORTABLE_COLUMNS = [
  { key: "denomination", label: "Entreprise" },
  { key: "secteur", label: "Secteur" },
  { key: "type", label: "Type" },
  { key: "year", label: "Année" },
];

const REPORT_TYPE_LABELS = Object.fromEntries(REPORT_TYPES.map((t) => [t.value, t.label]));

export default function ReportsTable({ reports, sort, dir, selectedIds, onToggle, onToggleAll }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseReportFiltersFromParams(searchParams);

  const handleSort = (columnKey) => {
    const nextDir = sort === columnKey && dir === "asc" ? "desc" : "asc";
    const params = reportFiltersToSearchParams(filters, columnKey, nextDir, searchParams);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleOvhDownload = async (report) => {
    try {
      const res = await fetch(`/api/portail/download/${report.id}`);
      if (!res.ok) throw new Error("Échec du téléchargement");
      const { url } = await res.json();

      const a = document.createElement("a");
      a.href = url;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erreur téléchargement OVH:", err);
    }
  };

  const selectableReports = reports.filter((r) => r.storageType === "ovh");
  const allSelected = selectableReports.length > 0 && selectableReports.every((r) => selectedIds.has(r.id));

  const sortIcon = (columnKey) => {
    if (sort !== columnKey) return <ChevronsUpDown size={13} className="rapports-sort-icon rapports-sort-icon-idle" aria-hidden="true" />;
    return dir === "asc"
      ? <ChevronUp size={13} className="rapports-sort-icon" aria-hidden="true" />
      : <ChevronDown size={13} className="rapports-sort-icon" aria-hidden="true" />;
  };

  return (
    <div className="rapports-table-card">
      <table className="table table-hover align-middle mb-0 rapports-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <input type="checkbox" checked={allSelected} onChange={(e) => onToggleAll(e.target.checked)} aria-label="Tout sélectionner" />
            </th>
            {SORTABLE_COLUMNS.map((col) => (
              <th key={col.key} role="button" onClick={() => handleSort(col.key)} className="user-select-none">
                <span className="d-inline-flex align-items-center gap-1">{col.label} {sortIcon(col.key)}</span>
              </th>
            ))}
            <th>Format</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const Icon = FORMAT_ICONS[r.format] || FileText;
            return (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(r.id)}
                    onChange={() => onToggle(r.id)}
                    disabled={r.storageType !== "ovh"}
                    title={r.storageType !== "ovh" ? "Lien externe — non inclus dans l'export ZIP" : undefined}
                    aria-label={`Sélectionner ${r.denomination}`}
                  />
                </td>
                <td><a href={`/entreprise/${r.siren}`} className="rapports-table-company-link">{r.denomination}</a></td>
                <td>{r.activitePrincipaleLibelle || "—"}</td>
                <td>{REPORT_TYPE_LABELS[r.type] || r.type}</td>
                <td>{r.year}</td>
                <td>
                  <span className={`rapports-format-badge rapports-format-badge-${r.format}`}>
                    <Icon size={14} className="me-1" aria-hidden="true" />
                    {REPORT_FORMAT_LABELS[r.format]}
                  </span>
                </td>
                <td>
                  {r.storageType === "ovh" ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                      onClick={() => handleOvhDownload(r)}
                    >
                      <Download size={14} aria-hidden="true" />
                      Télécharger
                    </button>
                  ) : (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-100 btn btn-sm btn-light d-inline-flex align-items-center gap-1"
                      title="Lien externe"
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                      Consulter
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
