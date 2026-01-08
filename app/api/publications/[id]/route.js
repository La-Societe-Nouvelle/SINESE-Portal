import pool from "@/config/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

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
