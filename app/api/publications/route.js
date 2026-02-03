import pool from "@/config/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request) {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const legalUnit = JSON.parse(formData.get("legalUnit"));
    const declarationData = JSON.parse(formData.get("declarationData"));
    const documents = formData.get("documents") ? JSON.parse(formData.get("documents")) : [];
    const year = formData.get("year");
    const periodStart = formData.get("periodStart") || null;
    const periodEnd = formData.get("periodEnd") || null;
    if (!year) {
      return NextResponse.json({ error: "L'année est requise." }, { status: 400 });
    }
    const status = formData.get("status");
    const legalUnitId = legalUnit.id;
    if (!legalUnitId) {
      return NextResponse.json({ error: "Aucune unité légale sélectionnée." }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO publications.publications (legal_unit_id, year, data, status, period_start, period_end)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (legal_unit_id, year)
        DO UPDATE SET
          data = publications.data || EXCLUDED.data,
          status = EXCLUDED.status,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = NOW()
        RETURNING id, created_at`,
      [legalUnitId, year, JSON.stringify(declarationData), status, periodStart, periodEnd]
    );

    return NextResponse.json({ success: true, publicationId: result.rows[0].id }, { status: 200 });
  } catch (e) {
    console.error("Error creating publication:", e);
    return NextResponse.json({ error: e.message || "Erreur lors de la création de la publication" }, { status: 500 });
  }
}
