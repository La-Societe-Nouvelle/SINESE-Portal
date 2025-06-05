export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) {
    return Response.json({ legalUnits: [] }, { status: 400 });
  }
  console.log("Fetching legal units for query:", q);
  const apiRes = await fetch(`https://api.lasocietenouvelle.org/legalUnit/${encodeURIComponent(q)}`);
  if (!apiRes.ok) {
    return Response.json({ legalUnits: [] }, { status: 502 });
  }
  const data = await apiRes.json();
  return Response.json(data);
}
