'use server'

import { cookies } from "next/headers";
import pool from "@/config/db";

// Best-effort : une erreur ici ne doit jamais casser une recherche ou une
// page entreprise. Le cookie visitor_id est posé par proxy.js.
async function logView(source, siren, params) {
  try {
    const cookieStore = await cookies();
    const visitorId = cookieStore.get("visitor_id")?.value;
    if (!visitorId) return;

    await pool.query(
      `INSERT INTO stats.sinese_views (source, siren, visitor_id, date, params)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
      [source, siren, visitorId, params ? JSON.stringify(params) : null]
    );
  } catch (error) {
    console.error("logView failed:", error.message);
  }
}

export async function logSearchView(query, filters) {
  await logView("search", null, { query, ...filters });
}

export async function logCompanyView(siren) {
  await logView("company_view", siren, null);
}
