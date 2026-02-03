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
        p.publication_date,
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

    const reportRes = await pool.query(
      `SELECT id, siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date
       FROM publications.reports
       WHERE publication_id = $1
       ORDER BY upload_date DESC
       LIMIT 1`,
      [id]
    );

    const report = reportRes.rows[0] || null;

    return NextResponse.json({ publication: { ...rows[0], report } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching publication details:", error);
    return NextResponse.json(
      { error: "Failed to fetch publication details" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  let status;
  try {
    ({ status } = await request.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!status || !["published", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Allowed: published, rejected" },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const pubRes = await client.query(
      `UPDATE publications.publications
       SET status = $1::varchar, 
           updated_at = NOW(), 
           publication_date = CASE WHEN $1::varchar = 'published' THEN NOW() ELSE publication_date END
       WHERE id = $2
       RETURNING id`,
      [status, id]
    );

    if (pubRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    }

    if (status === "published") {
      const reportRes = await client.query(
        `SELECT id, siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date
         FROM publications.reports
         WHERE publication_id = $1
         ORDER BY upload_date DESC
         LIMIT 1`,
        [id]
      );

      if (reportRes.rows.length > 0) {
        const report = reportRes.rows[0];
        
        // Map storage_type: footprints enum accepts 'ovh' or 'local' only
        const footprintStorageType = report.storage_type === "external" ? "ovh" : report.storage_type;

        // Check if report already exists in footprints
        const existingFootprint = await client.query(
          `SELECT id FROM footprints.reports
           WHERE siren = $1 AND year = $2 AND type = $3
           LIMIT 1`,
          [report.siren, report.year, report.type]
        );

        if (existingFootprint.rows.length > 0) {
          // Update existing report
          await client.query(
            `UPDATE footprints.reports
             SET mime_type = $1, file_origin = $2, file_url = $3, storage_type = $4, 
                 file_name = $5, file_size = $6, upload_date = $7, updated_at = NOW()
             WHERE id = $8`,
            [
              report.mime_type,
              report.file_origin,
              report.file_url,
              footprintStorageType,
              report.file_name,
              report.file_size,
              report.upload_date,
              existingFootprint.rows[0].id,
            ]
          );
        } else {
          // Insert new report
          await client.query(
            `INSERT INTO footprints.reports
              (siren, type, year, mime_type, file_origin, file_url, storage_type, file_name, file_size, upload_date, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
            [
              report.siren,
              report.type,
              report.year,
              report.mime_type,
              report.file_origin,
              report.file_url,
              footprintStorageType,
              report.file_name,
              report.file_size,
              report.upload_date,
            ]
          );
        }
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, publication: { id, status } }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating publication status:", error);
    return NextResponse.json(
      { error: "Failed to update publication status" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
