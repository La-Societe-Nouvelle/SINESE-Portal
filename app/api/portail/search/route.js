import { NextResponse } from "next/server";
import { searchLegalUnits } from "@/actions/search";
import { parseFiltersFromParams } from "@/(portail)/recherche/_utils/searchParams";

// Recherche filtrée du portail. Route handler GET plutôt que rendu RSC piloté
// par l'URL : les changements de filtres se font en fetch client annulable
// (AbortController), sans passer par la file de navigations de l'App Router.
export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const query = sp.get("s") || "";
  const parsedPage = parseInt(sp.get("p"), 10);
  const page = Number.isInteger(parsedPage) ? Math.max(1, parsedPage) : 1;
  const filters = parseFiltersFromParams(sp);

  try {
    const data = await searchLegalUnits(query, filters, page);
    return NextResponse.json(data);
  } catch (error) {
    // Timeout du pool ou statement_timeout (voir config/db.js).
    console.error("searchLegalUnits failed:", error.message);
    return NextResponse.json({ error: "search_failed" }, { status: 500 });
  }
}
