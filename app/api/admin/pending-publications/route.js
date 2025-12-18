import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  try {
    // Fetch all pending publications with associated legal unit and user information
    const { rows } = await pool.query(
      `SELECT
        p.id,
        p.year,
        p.status,
        p.created_at,
        p.updated_at,
        lu.id as legal_unit_id,
        lu.denomination,
        lu.siren,
        u.id as user_id,
        u.email as user_email
      FROM publications.publications p
      JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
      JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
      JOIN publications.users u ON u.id = ulu.user_id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC`
    );

    return NextResponse.json({ publications: rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending publications:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending publications" },
      { status: 500 }
    );
  }
}
