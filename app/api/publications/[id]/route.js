import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  try {
    const result = await pool.query(
      `SELECT p.id, p.legal_unit_id, p.year, p.status, p.data,
              p.period_start, p.period_end, p.created_at, p.updated_at,
              lu.denomination, lu.siren,
              r.type AS report_type, r.file_name, r.file_url, r.storage_type
       FROM publications.publications p
       JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
       JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
       LEFT JOIN publications.reports r ON r.publication_id = p.id
       WHERE p.id = $1 AND ulu.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Publication not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching publication:", error);
    return NextResponse.json({ error: "Failed to fetch publication" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;
  const { status } = await req.json();

  // Only allow reverting pending → draft
  if (status !== "draft") {
    return NextResponse.json({ error: "Only reverting to draft is allowed" }, { status: 403 });
  }

  try {
    const result = await pool.query(
      `UPDATE publications.publications p
       SET status = $1, updated_at = NOW()
       FROM publications.legal_units lu
       JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
       WHERE p.legal_unit_id = lu.id AND p.id = $2 AND ulu.user_id = $3 AND p.status = 'pending'
       RETURNING p.id`,
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Publication not found, access denied, or not in pending status" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating publication status:", error);
    return NextResponse.json({ error: "Failed to update publication" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  try {
    // Verify that the publication belongs to the user and is a draft
    const checkRes = await pool.query(
      `SELECT p.id, p.status
       FROM publications.publications p
       JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
       JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
       WHERE p.id = $1 AND ulu.user_id = $2`,
      [id, userId]
    );

    if (checkRes.rows.length === 0) {
      console.error(`[API 404] DELETE ${req.url} - Publication not found or access denied. Params: ${JSON.stringify(params)}`);
      return NextResponse.json(
        { error: "Publication not found or access denied" },
        { status: 404 }
      );
    }

    const publication = checkRes.rows[0];

    // Only allow deletion of draft publications
    if (publication.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft publications can be deleted" },
        { status: 403 }
      );
    }

    // Delete the publication
    await pool.query("DELETE FROM publications.publications WHERE id = $1", [id]);

    return NextResponse.json(
      { message: "Publication deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting publication:", error);
    return NextResponse.json(
      { error: "Failed to delete publication" },
      { status: 500 }
    );
  }
}
