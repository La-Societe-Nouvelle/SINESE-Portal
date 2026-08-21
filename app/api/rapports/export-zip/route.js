// Pinned to archiver@7 in package.json — v8 removed the factory-function
// default export (archiver('zip', opts)) that this file relies on.
import archiver from "archiver";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import pool from "@/config/db";
import { getS3Client } from "@/_libs/ovh-client";
import { isRateLimited } from "@/_libs/rate-limit";
import { extractS3Key } from "@/_libs/s3-key";

const MAX_IDS = 200;

export async function GET(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans une minute." }), { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids") || "";
  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);

  if (ids.length === 0) {
    return new Response(JSON.stringify({ error: "Aucun identifiant fourni." }), { status: 400 });
  }
  if (ids.length > MAX_IDS) {
    return new Response(JSON.stringify({ error: `Maximum ${MAX_IDS} rapports par export.` }), { status: 400 });
  }

  const result = await pool.query(
    `SELECT id, file_name, file_url, storage_type FROM footprints.reports WHERE id = ANY($1)`,
    [ids]
  );

  const bucketName = process.env.OVH_BUCKET_NAME || "metriz-files-storage";
  const s3 = getS3Client();
  const excluded = [];

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks = [];
  archive.on("data", (chunk) => chunks.push(chunk));
  archive.on("warning", (err) => console.error("archiver warning:", err));
  archive.on("error", (err) => console.error("archiver error:", err));

  // Multiple reports can share the same human-readable file_name (e.g. two
  // "Document d'Enregistrement Universel - 2024") — dedupe within the archive.
  const usedNames = new Set();
  const dedupeName = (name) => {
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
    const dotIndex = name.lastIndexOf(".");
    const base = dotIndex > 0 ? name.slice(0, dotIndex) : name;
    const ext = dotIndex > 0 ? name.slice(dotIndex) : "";
    let n = 2;
    let candidate = `${base} (${n})${ext}`;
    while (usedNames.has(candidate)) {
      n++;
      candidate = `${base} (${n})${ext}`;
    }
    usedNames.add(candidate);
    return candidate;
  };

  for (const report of result.rows) {
    if (report.storage_type !== "ovh" || !report.file_url) {
      excluded.push(report.id);
      continue;
    }
    const key = extractS3Key(report.file_url, bucketName);
    if (!key) {
      excluded.push(report.id);
      continue;
    }
    try {
      const object = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));
      const bodyBytes = await object.Body.transformToByteArray();
      const keyExt = key.split(".").pop()?.toLowerCase();
      let displayName = report.file_name || key.split("/").pop() || `${report.id}.bin`;
      // report.file_name is often a human-readable label without an extension
      // (e.g. "Document d'Enregistrement Universel - 2024") — the S3 key
      // holds the real one, so append it when the label doesn't already carry it.
      if (keyExt && !displayName.toLowerCase().endsWith(`.${keyExt}`)) {
        displayName = `${displayName}.${keyExt}`;
      }
      const safeName = dedupeName(displayName.replace(/[\r\n"\\]/g, "_"));
      archive.append(Buffer.from(bodyBytes), { name: safeName });
    } catch (err) {
      console.error(`Erreur récupération OVH pour le rapport ${report.id}:`, err);
      excluded.push(report.id);
    }
  }

  await archive.finalize();
  const zipBuffer = Buffer.concat(chunks);

  return new Response(zipBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="rapports.zip"`,
      ...(excluded.length > 0 ? { "X-Excluded-Reports": excluded.join(",") } : {}),
    },
  });
}
