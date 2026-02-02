import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const res = await pool.query(
    `SELECT lu.siren, lu.denomination, lu.id
     FROM publications.legal_units lu
     JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
     WHERE ulu.user_id = $1`,
    [userId]
  );

  const legal_units = await Promise.all(
    res.rows.map(async (legalUnit) => {
      const pubRes = await pool.query(
        `SELECT legal_unit_id, year, status FROM publications.publications WHERE legal_unit_id = $1 ORDER BY year DESC`,
        [legalUnit.id]
      );
      return {
        ...legalUnit,
        publishedYears: pubRes.rows,
      };
    })
  );
  return NextResponse.json(legal_units, { status: 200 });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await req.json();

  const { siren, denomination } = body;
  if (!siren || !denomination) {
    return NextResponse.json({ error: "SIREN et dénomination sont requis." }, { status: 400 });
  }

  // 1. Vérifier l'existence via l'API SINESE (v2)
  const apiBaseUrl = process.env.API_BASE_URL || 'https://api.sinese.fr';
  const apiRes = await fetch(`${apiBaseUrl}/v2/legalunitfootprint/${siren}`);
  if (!apiRes.ok) {
    return NextResponse.json({ error: "Entreprise non trouvée dans le répertoire SINESE." }, { status: 404 });
  }
  const apiData = await apiRes.json();
  const legalUnitData = apiData.data?.legalUnit;

  // 2. Transaction
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const res = await client.query(
      "INSERT INTO publications.legal_units (siren, denomination, data) VALUES ($1, $2, $3) RETURNING id",
      [siren, denomination, legalUnitData]
    );
    const legalUnitId = res.rows[0].id;
    // Lier l'utilisateur à l'entreprise
    await client.query(
      "INSERT INTO publications.user_legal_unit (user_id, legal_unit_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, legalUnitId]
    );



    await client.query("COMMIT");
    return NextResponse.json({ id: legalUnitId, siren, denomination }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entreprise :", error);
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Erreur lors de l'ajout de l'entreprise." }, { status: 500 });
  } finally {
    client.release();
  }
}
