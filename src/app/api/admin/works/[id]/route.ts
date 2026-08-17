import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function sb(path: string, init?: RequestInit) {
  if (!SUPABASE_URL || !SECRET) throw new Error("Supabase env missing.");

  const response = await fetch(
    `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`,
    {
      ...init,
      headers: {
        apikey: SECRET,
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    }
  );

  const body = await response.text();
  if (!response.ok) throw new Error(`${response.status}: ${body}`);
  return body ? JSON.parse(body) : [];
}

function text(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function nullableNumber(v: unknown) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function creatorIdFor(name: string) {
  if (!name) return null;

  const slug =
    `creator-${name}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || `creator-${Date.now()}`;

  const rows = await sb("creators?on_conflict=slug", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([{ name, slug, is_active: true }]),
  });

  return rows?.[0]?.id ?? null;
}

async function replaceGenres(workId: string, ids: string[]) {
  await sb(`work_genres?work_id=eq.${encodeURIComponent(workId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });

  if (!ids.length) return;

  await sb("work_genres", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(
      ids.map((genreId) => ({
        work_id: workId,
        genre_id: genreId,
      }))
    ),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const body: Record<string, unknown> = await request.json();

  try {
    const payload: Record<string, unknown> = {};

    if ("title" in body) payload.title = text(body.title);
    if ("creator" in body) {
      payload.creator_id = await creatorIdFor(text(body.creator));
    }
    if ("imageUrl" in body) payload.image_url = text(body.imageUrl) || null;
    if ("affiliateUrl" in body) {
      payload.affiliate_url = text(body.affiliateUrl) || null;
    }
    if ("sampleUrl" in body) payload.sample_url = text(body.sampleUrl) || null;
    if ("price" in body) payload.price = nullableNumber(body.price);
    if ("sourceRank" in body) payload.source_rank = nullableNumber(body.sourceRank);
    if ("sourceRankType" in body) {
      payload.source_rank_type = text(body.sourceRankType) || "manual";
    }
    if ("isActive" in body) payload.is_active = Boolean(body.isActive);
    if ("score" in body) payload.score = nullableNumber(body.score);

    const rows = await sb(`works?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    if ("genreIds" in body) {
      const ids = Array.isArray(body.genreIds)
        ? body.genreIds.filter(
            (v): v is string => typeof v === "string" && v.length > 0
          )
        : [];

      await replaceGenres(id, ids);
    }

    return NextResponse.json({ ok: true, work: rows?.[0] ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失敗" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  try {
    await sb(`click_events?work_id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });

    await sb(`daily_rankings?work_id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });

    await sb(`work_genres?work_id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });

    await sb(`works?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "削除失敗" },
      { status: 500 }
    );
  }
}
