import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import pool from "@/config/db";
import { getS3Client } from "@/_libs/ovh-client";

const rateLimitMap = new Map();
const LIMIT = 20;
const WINDOW_MS = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > LIMIT;
}

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/xml",
  "text/xml",
  "application/octet-stream",
]);

function extractS3Key(fileUrl, bucketName) {
  try {
    const url = new URL(fileUrl);
    if (url.pathname.startsWith(`/${bucketName}/`)) {
      return url.pathname.slice(`/${bucketName}/`.length);
    }
    return url.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

export async function GET(req, { params }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });
  }

  const { reportId } = await params;
  if (!reportId) {
    return NextResponse.json({ error: "reportId manquant" }, { status: 400 });
  }

  let report;
  try {
    const result = await pool.query(
      `SELECT file_url, file_name, mime_type, storage_type
         FROM footprints.reports
        WHERE id = $1`,
      [reportId]
    );
    report = result.rows[0];
  } catch (err) {
    console.error("Erreur DB téléchargement rapport:", err);
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }

  if (!report) {
    return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 });
  }

  if (report.storage_type !== "ovh") {
    return NextResponse.json({ error: "Ce rapport n'est pas stocké sur OVH" }, { status: 400 });
  }

  if (!report.file_url) {
    return NextResponse.json({ error: "URL du fichier manquante" }, { status: 404 });
  }

  const bucketName = process.env.OVH_BUCKET_NAME || "metriz-files-storage";
  const key = extractS3Key(report.file_url, bucketName);

  if (!key) {
    return NextResponse.json({ error: "Impossible d'extraire la clé S3 depuis l'URL" }, { status: 500 });
  }

  try {
    const rawName = key.split("/").pop() || "rapport";
    const safeFileName = rawName.replace(/[\r\n"\\]/g, "_");
    const encodedFileName = encodeURIComponent(safeFileName);
    const contentType = ALLOWED_TYPES.has(report.mime_type) ? report.mime_type : "application/octet-stream";

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
      ResponseContentType: contentType,
    });

    const signedUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 60 });

    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    console.error("Erreur génération URL pré-signée OVH:", err);
    return NextResponse.json({ error: "Impossible de générer le lien de téléchargement" }, { status: 502 });
  }
}
