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
    // Get total publications count by status
    const statsRes = await pool.query(
      `SELECT
        status,
        COUNT(*) as count
      FROM publications.publications
      GROUP BY status`
    );

    // Get recent publications (last 50)
    const recentRes = await pool.query(
      `SELECT * FROM (
        SELECT DISTINCT ON (p.id)
          p.id,
          p.year,
          p.status,
          p.created_at,
          p.updated_at,
          lu.denomination,
          lu.siren,
          u.email as user_email
        FROM publications.publications p
        JOIN publications.legal_units lu ON lu.id = p.legal_unit_id
        JOIN publications.user_legal_unit ulu ON ulu.legal_unit_id = lu.id
        JOIN publications.users u ON u.id = ulu.user_id
        ORDER BY p.id, u.id
      ) AS unique_pubs
      ORDER BY created_at DESC
      LIMIT 50`
    );
    // Get publications count by month (last 12 months)
    const timelineRes = await pool.query(
      `SELECT
        DATE_TRUNC('month', created_at) as month,
        status,
        COUNT(*) as count
      FROM publications.publications
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at), status
      ORDER BY month DESC`
    );

    // Get total users count
    const usersRes = await pool.query(
      `SELECT COUNT(DISTINCT u.id) as total_users
      FROM publications.users u
      JOIN publications.user_legal_unit ulu ON ulu.user_id = u.id`
    );

    // Get total legal units count
    const legalUnitsRes = await pool.query(
      `SELECT COUNT(*) as total_legal_units
      FROM publications.legal_units`
    );

    const stats = {
      byStatus: statsRes.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, { draft: 0, pending: 0, published: 0 }),
      recentPublications: recentRes.rows,
      timeline: timelineRes.rows,
      totalUsers: parseInt(usersRes.rows[0]?.total_users || 0),
      totalLegalUnits: parseInt(legalUnitsRes.rows[0]?.total_legal_units || 0),
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching publications stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch publications statistics" },
      { status: 500 }
    );
  }
}
