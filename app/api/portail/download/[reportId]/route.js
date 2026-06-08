import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import pool from "@/config/db";

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

function getS3Client() {
  return new S3Client({
    region: process.env.OS_REGION_NAME || "gra",
    endpoint: process.env.OS_AUTH_URL || "https://s3.gra.cloud.ovh.net",
    credentials: {
      accessKeyId: process.env.OS_USERNAME,
      secretAccessKey: process.env.OS_PASSWORD,
    },
    forcePathStyle: true,
    disableBodySigning: true,
  });
}

/**
 * Extrait la object key S3 depuis une URL complète OVH.
 * Ex: https://bucket.s3.gra.cloud.ovh.net/path/to/file.pdf → path/to/file.pdf
 */
function extractS3Key(fileUrl, bucketName) {
  try {
    const url = new URL(fileUrl);
    // Format path-style: endpoint/bucket/key
    if (url.pathname.startsWith(`/${bucketName}/`)) {
      return url.pathname.slice(`/${bucketName}/`.length);
    }
    // Format virtual-hosted: bucket.endpoint/key
    return url.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

/**
 * Génère une URL pré-signée S3 valable 60 secondes et redirige vers elle.
 * Fonctionne pour les fichiers privés comme publics.
 */
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
  } catch {
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
    const client = getS3Client();
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const s3Response = await client.send(command);

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
    const rawType = report.mime_type || s3Response.ContentType || "";
    const contentType = ALLOWED_TYPES.has(rawType) ? rawType : "application/octet-stream";

    const safeFileName = (report.file_name || "rapport").replace(/[\r\n"\\]/g, "_");
    const encodedFileName = encodeURIComponent(safeFileName);

    return new NextResponse(s3Response.Body.transformToWebStream(), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Impossible de récupérer le fichier OVH" }, { status: 502 });
  }
}
