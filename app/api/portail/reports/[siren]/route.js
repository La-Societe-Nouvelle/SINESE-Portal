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

    // Récupérer la dernière publication avec des documents publiés pour le SIREN donné
    const { rows } = await pool.query(
      `SELECT p.id, p.year, p.documents, p.period_start, p.period_end, p.updated_at,
              lu.denomination, lu.siren
       FROM publications.publications p
       JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
       WHERE lu.siren = $1 AND p.status = 'published' AND p.documents IS NOT NULL
       ORDER BY p.year DESC
       LIMIT 1`,
      [siren]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { hasPublishedDocuments: false },
        { status: 200 }
      );
    }

    const publication = rows[0];

    // Filtrer les documents (on peut vouloir seulement les rapports par exemple)
    const documents = Array.isArray(publication.documents) ? publication.documents : [];

    return NextResponse.json({
      hasPublishedDocuments: documents.length > 0,
      publication: {
        id: publication.id,
        year: publication.year,
        periodStart: publication.period_start,
        periodEnd: publication.period_end,
        updatedAt: publication.updated_at,
        legalUnit: {
          denomination: publication.denomination,
          siren: publication.siren
        }
      },
      documents: documents
    });
  } catch (error) {
    console.error("Erreur récupération rapports publiés:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rapports" },
      { status: 500 }
    );
  }
}
