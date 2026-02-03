import pool from "@/config/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * API pour soumettre un rapport de durabilité (RSE/CSRD/ESG/VSME/etc.)
 * Le rapport est rattaché à une publication existante via publication_id
 * Le statut est géré par la publication parente
 * À la validation admin, le rapport est copié dans footprints.reports
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const publicationId = formData.get("publicationId");
    const type = formData.get("type");
    const fileUrl = formData.get("fileUrl");
    const fileName = formData.get("fileName");
    const fileSize = formData.get("fileSize");
    const mimeType = formData.get("mimeType");
    const storageType = formData.get("storageType"); // "ovh" or "external"

    if (!publicationId) {
      return NextResponse.json(
        { error: "L'identifiant de publication est requis." },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Le type de rapport est requis." },
        { status: 400 }
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Un fichier ou un lien vers le rapport est requis." },
        { status: 400 }
      );
    }

    // Vérifier que la publication existe et appartient à l'utilisateur
    const pubCheck = await pool.query(
      `SELECT p.id, p.year, lu.siren
       FROM publications.publications p
       JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
       JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
       WHERE p.id = $1 AND ulu.user_id = $2`,
      [publicationId, session.user.id]
    );

    if (pubCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Publication non trouvée ou accès refusé." },
        { status: 404 }
      );
    }

    const { siren, year } = pubCheck.rows[0];

    // storage_type_enum accepte: {ovh, local, external}
    // file_origin: 'ovh' ou 'external' (pour l'affichage)
    const isExternal = storageType === "external";
    const fileOrigin = isExternal ? "external" : "ovh";
    const dbStorageType = isExternal ? "external" : "ovh";

    // Vérifier si un rapport existe déjà pour cette publication
    const existingReport = await pool.query(
      `SELECT id FROM publications.reports WHERE publication_id = $1`,
      [publicationId]
    );

    let result;
    if (existingReport.rows.length > 0) {
      // Mettre à jour le rapport existant
      result = await pool.query(
        `UPDATE publications.reports
         SET type = $1, mime_type = $2, file_origin = $3, file_url = $4,
             storage_type = $5, file_name = $6, file_size = $7, updated_at = NOW()
         WHERE publication_id = $8
         RETURNING id, created_at`,
        [
          type,
          mimeType || null,
          fileOrigin,
          fileUrl,
          dbStorageType,
          fileName || null,
          fileSize ? parseInt(fileSize) : null,
          publicationId,
        ]
      );
    } else {
      // Créer un nouveau rapport
      result = await pool.query(
        `INSERT INTO publications.reports
          (publication_id, siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING id, created_at`,
        [
          publicationId,
          siren,
          type,
          year,
          mimeType || null,
          fileOrigin,
          fileUrl,
          dbStorageType,
          fileName || null,
          fileSize ? parseInt(fileSize) : null,
        ]
      );
    }

    return NextResponse.json(
      { success: true, reportId: result.rows[0].id },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error creating report:", e);

    // Message d'erreur user-friendly
    let userMessage = "Erreur lors de la soumission du rapport. Veuillez réessayer.";
    if (e.code === "22P02") {
      userMessage = "Erreur de format de données. Veuillez vérifier les informations saisies.";
    } else if (e.code === "23505") {
      userMessage = "Un rapport pour cette publication existe déjà.";
    } else if (e.code === "23503") {
      userMessage = "Publication non trouvée. Veuillez d'abord créer une publication.";
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
