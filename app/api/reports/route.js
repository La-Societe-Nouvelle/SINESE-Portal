import pool from "@/config/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * API pour soumettre un rapport de durabilité (RSE/CSRD/ESG/VSME/etc.)
 * Stocke dans publications.reports avec status='pending' pour validation admin
 * À la validation, le rapport est copié dans footprints.reports
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const siren = formData.get("siren");
    const type = formData.get("type");
    const year = formData.get("year");
    const fileUrl = formData.get("fileUrl");
    const fileName = formData.get("fileName");
    const fileSize = formData.get("fileSize");
    const mimeType = formData.get("mimeType");
    const storageType = formData.get("storageType"); // "ovh" or "external"

    if (!siren || !type || !year) {
      return NextResponse.json(
        { error: "SIREN, type de rapport et année sont requis." },
        { status: 400 }
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Un fichier ou un lien vers le rapport est requis." },
        { status: 400 }
      );
    }

    const fileOrigin = storageType === "external" ? "external" : "ovh";

    const result = await pool.query(
      `INSERT INTO publications.reports
        (siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date, status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11)
       RETURNING id, created_at`,
      [
        siren,
        type,
        parseInt(year),
        mimeType || null,
        fileOrigin,
        fileUrl,
        storageType || "ovh",
        fileName || null,
        fileSize ? parseInt(fileSize) : null,
        "pending",
        session.user.id,
      ]
    );

    return NextResponse.json(
      { success: true, reportId: result.rows[0].id },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error creating report:", e);
    return NextResponse.json(
      { error: e.message || "Erreur lors de la soumission du rapport" },
      { status: 500 }
    );
  }
}
