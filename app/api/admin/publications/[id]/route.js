import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Fetch publication details
    const { rows } = await pool.query(
      `SELECT
        p.id,
        p.year,
        p.status,
        p.created_at,
        p.updated_at,
        p.period_start,
        p.period_end,
        p.data,
        p.documents,
        lu.id as legal_unit_id,
        lu.denomination,
        lu.siren,
        (SELECT u.email FROM publications.users u
         JOIN publications.user_legal_unit ulu2 ON ulu2.user_id = u.id
         WHERE ulu2.legal_unit_id = lu.id
         LIMIT 1) as user_email
      FROM publications.publications p
      JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
      WHERE p.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    }

    return NextResponse.json({ publication: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching publication details:", error);
    return NextResponse.json(
      { error: "Failed to fetch publication details" },
      { status: 500 }
    );
  }
}
