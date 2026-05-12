import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });

  const { siren, year, reportType, reportUrl, storageType, fileName, fileSize, mimeType } = await req.json();

  if (!siren || !year || !reportType || !reportUrl) {
    return NextResponse.json({ error: "SIREN, année, type de rapport et URL sont requis." }, { status: 400 });
  }

  // footprints.reports n'accepte que 'ovh' ou 'local' pour storage_type
  const footprintStorageType = storageType === "ovh" ? "ovh" : "ovh";
  const fileOrigin = storageType === "external" ? "external" : null;

  try {
    await pool.query(
      `INSERT INTO footprints.reports
         (siren, type, year, file_origin, file_url, storage_type, file_name, file_size, mime_type, upload_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
       ON CONFLICT (siren, year, type) DO UPDATE SET
         file_origin = EXCLUDED.file_origin,
         file_url    = EXCLUDED.file_url,
         storage_type = EXCLUDED.storage_type,
         file_name   = EXCLUDED.file_name,
         file_size   = EXCLUDED.file_size,
         mime_type   = EXCLUDED.mime_type,
         upload_date = NOW(),
         updated_at  = NOW()`,
      [siren, reportType, year, fileOrigin, reportUrl, footprintStorageType, fileName || null, fileSize || null, mimeType || null]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error inserting into footprints.reports:", error);
    return NextResponse.json({ error: "Erreur lors de la publication" }, { status: 500 });
  }
}
