import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../auth/[...nextauth]/route";

/**
 * Endpoint d'approbation d'une publication
 * 
 * Gère l'approbation complète d'une publication :
 * 1. Met à jour le statut dans publications.publications
 * 2. Copie le rapport dans footprints.reports (si existe)
 * 3. Copie/met à jour les indicateurs dans footprints.uniteslegales (si existent)
 */
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }

  const { id } = await params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ═══════════════════════════════════════════════════════════════
    // 1. Récupérer la publication et vérifier son statut
    // ═══════════════════════════════════════════════════════════════
    const pubResult = await client.query(
      `SELECT p.id, p.legal_unit_id, p.year, p.data, p.status,
              lu.siren, lu.denomination
       FROM publications.publications p
       JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
       WHERE p.id = $1`,
      [id]
    );

    if (pubResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Publication introuvable" }, { status: 404 });
    }

    const publication = pubResult.rows[0];

    if (publication.status === "published") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cette publication est déjà approuvée" }, { status: 400 });
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. Mettre à jour le statut de la publication
    // ═══════════════════════════════════════════════════════════════
    await client.query(
      `UPDATE publications.publications
       SET status = 'published', 
           updated_at = NOW(), 
           publication_date = NOW()
       WHERE id = $1`,
      [id]
    );

    // ═══════════════════════════════════════════════════════════════
    // 3. Copier le rapport dans footprints.reports (si existe)
    // ═══════════════════════════════════════════════════════════════
    const reportResult = await client.query(
      `SELECT siren, type, year, mime_type, file_origin, file_url, 
              storage_type, file_name, file_size, upload_date
       FROM publications.reports
       WHERE publication_id = $1
       ORDER BY upload_date DESC
       LIMIT 1`,
      [id]
    );

    if (reportResult.rows.length > 0) {
      const report = reportResult.rows[0];
      
      // Map storage_type: footprints enum accepts 'ovh' or 'local' only
      const footprintStorageType = report.storage_type === "external" ? "ovh" : report.storage_type;

      // UPSERT dans footprints.reports (contrainte unique: siren, year, type)
      await client.query(
        `INSERT INTO footprints.reports
          (siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         ON CONFLICT (siren, year, type)
         DO UPDATE SET
           mime_type = EXCLUDED.mime_type,
           file_origin = EXCLUDED.file_origin,
           file_url = EXCLUDED.file_url,
           storage_type = EXCLUDED.storage_type,
           file_name = EXCLUDED.file_name,
           file_size = EXCLUDED.file_size,
           upload_date = EXCLUDED.upload_date,
           updated_at = NOW()`,
        [
          report.siren,
          report.type,
          report.year,
          report.mime_type,
          report.file_origin,
          report.file_url,
          footprintStorageType,
          report.file_name,
          report.file_size,
          report.upload_date,
        ]
      );
    }

    // Temporairement désactivé  
    // // ═══════════════════════════════════════════════════════════════
    // // 4. Copier les indicateurs dans footprints.uniteslegales
    // // ═══════════════════════════════════════════════════════════════
    // if (publication.data && typeof publication.data === 'object') {
    //   const indicateurs = Object.entries(publication.data);
      
    //   for (const [indicCode, indicData] of indicateurs) {
    //     // Ne traiter que les indicateurs avec une valeur
    //     if (!indicData || indicData.value === undefined || indicData.value === null || indicData.value === '') {
    //       continue;
    //     }


    //     // UPSERT dans footprints.uniteslegales (clé primaire: siren, year, indic)
    //     await client.query(
    //       `INSERT INTO footprints.uniteslegales
    //         (siren, indic, year, value, flag, info, uncertainty, lastupdate, origin, lastupload)
    //        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, NOW())
    //        ON CONFLICT (siren, year, indic)
    //        DO UPDATE SET
    //          value = EXCLUDED.value,
    //          flag = EXCLUDED.flag,
    //          info = EXCLUDED.info,
    //          uncertainty = EXCLUDED.uncertainty,
    //          lastupdate = NOW(),
    //          origin = EXCLUDED.origin,
    //          lastupload = NOW()`,
    //       [
    //         publication.siren,
    //         indicCode.toUpperCase(),
    //         publication.year.toString(), // year est varchar dans footprints
    //         parseFloat(indicData.value),
    //         'p', // flag = 'p' pour published
    //         indicData.comment || null,
    //         indicData.uncertainty !== undefined ? parseInt(indicData.uncertainty) : null,
    //         'publication', // origin
    //       ]
    //     );
    //   }
    // }
   await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Publication approuvée avec succès",
      publication: {
        id: publication.id,
        siren: publication.siren,
        denomination: publication.denomination,
        year: publication.year,
        status: "published",
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: "Erreur lors de l'approbation de la publication", details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
