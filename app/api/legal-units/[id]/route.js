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
    // Verify that the legal unit belongs to the user
    const checkRes = await pool.query(
      `SELECT lu.id, lu.denomination
       FROM publications.legal_units lu
       JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
       WHERE lu.id = $1 AND ulu.user_id = $2`,
      [id, userId]
    );

    if (checkRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Legal unit not found or access denied" },
        { status: 404 }
      );
    }

    // Check publications for this legal unit
    const publicationsRes = await pool.query(
      `SELECT id, status FROM publications.publications WHERE legal_unit_id = $1`,
      [id]
    );

    const publications = publicationsRes.rows;

    // Check if there are any non-draft publications
    const hasNonDraftPublications = publications.some(
      (pub) => pub.status === "pending" || pub.status === "published"
    );

    if (hasNonDraftPublications) {
      return NextResponse.json(
        {
          error:
            "Cannot delete legal unit with pending or published publications. Only legal units with no publications or only draft publications can be deleted.",
        },
        { status: 403 }
      );
    }

    // Delete all draft publications first
    const draftPublications = publications.filter(
      (pub) => pub.status === "draft"
    );

    if (draftPublications.length > 0) {
      await pool.query(
        `DELETE FROM publications.publications WHERE legal_unit_id = $1 AND status = 'draft'`,
        [id]
      );
    }

    // Delete user_legal_unit association
    await pool.query(
      `DELETE FROM publications.user_legal_unit WHERE legal_unit_id = $1 AND user_id = $2`,
      [id, userId]
    );

    // Delete the legal unit
    await pool.query(
      `DELETE FROM publications.legal_units WHERE id = $1`,
      [id]
    );

    return NextResponse.json(
      {
        message: "Legal unit deleted successfully",
        deletedDrafts: draftPublications.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting legal unit:", error);
    return NextResponse.json(
      { error: "Failed to delete legal unit" },
      { status: 500 }
    );
  }
}
