import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siren = searchParams.get("siren");
  if (!siren) return NextResponse.json({ error: "SIREN requis" }, { status: 400 });

  const userId = session.user.id;

  try {
    const result = await pool.query(
      `SELECT ulu.user_id
       FROM publications.legal_units lu
       JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
       WHERE lu.siren = $1`,
      [siren]
    );

    const attachedUserIds = result.rows.map((r) => r.user_id);
    return NextResponse.json({
      attachedToCurrentUser: attachedUserIds.includes(userId),
      attachedToOtherUser: attachedUserIds.some((id) => id !== userId),
    });
  } catch (error) {
    console.error("Error checking legal unit attachment:", error);
    return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
  }
}
