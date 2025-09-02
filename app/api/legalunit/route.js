export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) {
    return Response.json({ legalUnits: [] }, { status: 400 });
  }
  const apiRes = await fetch(`${process.env.API_BASE_URL}/legalUnit/${encodeURIComponent(q)}`);
  if (!apiRes.ok) {
    return Response.json({ legalUnits: [] }, { status: 502 });
  }
  const data = await apiRes.json();
  return Response.json(data);
}
