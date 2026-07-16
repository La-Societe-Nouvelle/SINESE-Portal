import { FileText, FileCode } from "lucide-react";

const FORMAT_BY_EXTENSION = {
  pdf: "pdf",
  xbrl: "xbrl",
  xml: "xbrl",
};

const FORMAT_BY_MIME = {
  "application/pdf": "pdf",
  "application/xml": "xbrl",
  "text/xml": "xbrl",
};

// mime_type is the source of truth when present (set at upload time) — the
// file_name extension is only a fallback for older rows without it.
export function getReportFormat(filename, mimeType) {
  if (mimeType && FORMAT_BY_MIME[mimeType]) return FORMAT_BY_MIME[mimeType];
  const ext = filename?.split(".").pop()?.toLowerCase();
  return FORMAT_BY_EXTENSION[ext] || "autre";
}

export function getReportFormatColor(filename, mimeType) {
  const format = getReportFormat(filename, mimeType);
  if (format === "pdf") return "danger";
  if (format === "xbrl") return "success";
  return "secondary";
}

export function getReportFormatIcon(filename, mimeType) {
  const format = getReportFormat(filename, mimeType);
  if (format === "pdf") return FileText;
  if (format === "xbrl") return FileCode;
  return FileText;
}

export const REPORT_FORMAT_LABELS = {
  pdf: "PDF",
  xbrl: "XBRL",
  autre: "Autre",
};
