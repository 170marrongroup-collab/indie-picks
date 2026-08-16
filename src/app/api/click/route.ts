import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    return NextResponse.json({ error: "Server environment is not configured." }, { status: 500 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const data = body as { workId?: unknown; source?: unknown };
  const workId = typeof data.workId === "string" ? data.workId : "";
  const source = typeof data.source === "string" ? data.source : "";

  if (!UUID_RE.test(workId)) return NextResponse.json({ error: "Invalid workId." }, { status: 400 });
  if (source !== "detail" && source !== "affiliate") return NextResponse.json({ error: "Invalid source." }, { status: 400 });

  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/click_events`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      work_id: workId,
      source,
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("click_events insert failed:", response.status, text);
    return NextResponse.json({ error: "Could not record click." }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
