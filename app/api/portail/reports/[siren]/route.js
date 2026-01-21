import { NextResponse } from "next/server";
import pool from "@/config/db";

/**
 * API pour récupérer les rapports publiés pour un SIREN donné
 */
export async function GET(_req, { params }) {
  try {
    const { siren } = await params;

    if (!siren) {
      return NextResponse.json(
        { error: "SIREN manquant" },
        { status: 400 }
      );
    }

    // Rapports depuis footprints.reports uniquement
    const footprintsResult = await pool.query(
      `SELECT id, siren, type, year,
              mime_type, file_origin, file_url AS url, storage_type, file_name,
              file_size, upload_date,
              created_at, updated_at
         FROM footprints.reports
        WHERE siren = $1
        ORDER BY year DESC`,
      [siren]
    );

    const reports = footprintsResult.rows.map(report => ({
      id: report.id,
      siren: report.siren,
      type: report.type,
      year: report.year,
      url: report.url,
      fileOrigin: report.file_origin,
      fileName: report.file_name,
      fileSize: report.file_size,
      contentType: report.mime_type,
      uploadedAt: report.upload_date,
      storageType: report.storage_type,
      createdAt: report.created_at,
      updatedAt: report.updated_at
    }));

    return NextResponse.json({
      hasPublishedDocuments: reports.length > 0,
      documents: reports
    });
  } catch (error) {
    console.error("Erreur récupération rapports publiés:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rapports" },
      { status: 500 }
    );
  }
}
