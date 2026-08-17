import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

async function supabase(path: string, init?: RequestInit) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error("Supabase env missing.");

  const response = await fetch(
    `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`,
    {
      ...init,
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    }
  );

  const body = await response.text();
  if (!response.ok) throw new Error(`${response.status}: ${body}`);
  return body ? JSON.parse(body) : null;
}

function freshness(publishedAt: string | null) {
  if (!publishedAt) return 6;
  const days = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 86400000);
  if (days <= 1) return 20;
  if (days <= 3) return 18;
  if (days <= 7) return 15;
  if (days <= 14) return 11;
  if (days <= 30) return 8;
  return 4;
}

function sourceBonus(rank: number | null, type: string | null) {
  if (!rank || rank <= 0) return 4;

  const weights: Record<string, number> = {
    realtime: 18,
    daily: 16,
    weekly: 14,
    "2weeks": 12,
    monthly: 9,
    yearly: 6,
    new: 8,
    manual: 5,
  };

  const weight = weights[type ?? "manual"] ?? 5;
  return Math.max(0, weight - Math.log2(rank) * 2.2);
}

function engagement(detail: number, affiliate: number) {
  const detailScore = Math.min(14, Math.log1p(detail) * 4.2);
  const affiliateScore = Math.min(24, Math.log1p(affiliate) * 7.2);
  return detailScore + affiliateScore;
}

export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const works = await supabase(
      "works?select=id,title,published_at,source_rank,source_rank_type,sample_url&is_indie=eq.true&is_active=eq.true&limit=1000"
    );

    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const clicks = await supabase(
      `click_events?select=work_id,source,created_at&created_at=gte.${encodeURIComponent(since)}&limit=10000`
    );

    const map = new Map<string, { detail: number; affiliate: number }>();

    for (const click of clicks ?? []) {
      const current = map.get(click.work_id) ?? { detail: 0, affiliate: 0 };
      if (click.source === "detail") current.detail += 1;
      if (click.source === "affiliate") current.affiliate += 1;
      map.set(click.work_id, current);
    }

    const results = [];

    for (const work of works ?? []) {
      const c = map.get(work.id) ?? { detail: 0, affiliate: 0 };

      const score = Math.min(
        100,
        Math.round(
          28 +
          freshness(work.published_at) +
          sourceBonus(work.source_rank, work.source_rank_type) +
          (work.sample_url ? 5 : 0) +
          engagement(c.detail, c.affiliate)
        )
      );

      await supabase(`works?id=eq.${encodeURIComponent(work.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ score }),
      });

      results.push({
        id: work.id,
        title: work.title,
        score,
        detailClicks30d: c.detail,
        affiliateClicks30d: c.affiliate,
      });
    }

    results.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      ok: true,
      updated: results.length,
      periodDays: 30,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "スコア再計算に失敗しました。" },
      { status: 500 }
    );
  }
}
