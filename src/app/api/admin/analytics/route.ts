import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

type WorkRow = {
  id: string;
  slug: string;
  title: string;
  score: number | string | null;
  image_url: string | null;
  is_active: boolean;
  platforms:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

type ClickRow = {
  work_id: string;
  source: "detail" | "affiliate";
  created_at: string;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function shortPlatform(
  platform: { name: string; slug: string } | null
) {
  if (!platform) return "Unknown";
  if (platform.slug === "fc2-content-market") return "FC2";
  if (platform.slug === "pcolle") return "Pcolle";
  return platform.name;
}

async function supabase(path: string) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("Supabase server env is missing.");
  }

  const response = await fetch(
    `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`,
    {
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status}: ${body}`);
  }

  return body ? JSON.parse(body) : [];
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * 86400000);
    const since7 = new Date(now.getTime() - 7 * 86400000);

    const [works, clicks] = await Promise.all([
      supabase(
        "works?select=id,slug,title,score,image_url,is_active,platforms(name,slug)&is_indie=eq.true&order=created_at.desc&limit=1000"
      ) as Promise<WorkRow[]>,
      supabase(
        `click_events?select=work_id,source,created_at&created_at=gte.${encodeURIComponent(
          since30.toISOString()
        )}&order=created_at.asc&limit=20000`
      ) as Promise<ClickRow[]>,
    ]);

    const perWork = new Map<
      string,
      {
        detail7: number;
        affiliate7: number;
        detail30: number;
        affiliate30: number;
      }
    >();

    const daily = new Map<
      string,
      { detail: number; affiliate: number }
    >();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      daily.set(dateKey(d), { detail: 0, affiliate: 0 });
    }

    for (const click of clicks) {
      const item = perWork.get(click.work_id) ?? {
        detail7: 0,
        affiliate7: 0,
        detail30: 0,
        affiliate30: 0,
      };

      const created = new Date(click.created_at);

      if (click.source === "detail") {
        item.detail30 += 1;
        if (created >= since7) item.detail7 += 1;
      }

      if (click.source === "affiliate") {
        item.affiliate30 += 1;
        if (created >= since7) item.affiliate7 += 1;
      }

      perWork.set(click.work_id, item);

      const key = dateKey(created);
      const day = daily.get(key);

      if (day) {
        if (click.source === "detail") day.detail += 1;
        if (click.source === "affiliate") day.affiliate += 1;
      }
    }

    const workMetrics = works.map((work) => {
      const m = perWork.get(work.id) ?? {
        detail7: 0,
        affiliate7: 0,
        detail30: 0,
        affiliate30: 0,
      };

      const ctr7 =
        m.detail7 > 0
          ? (m.affiliate7 / m.detail7) * 100
          : 0;

      const ctr30 =
        m.detail30 > 0
          ? (m.affiliate30 / m.detail30) * 100
          : 0;

      const platform = shortPlatform(one(work.platforms));

      return {
        id: work.id,
        slug: work.slug,
        title: work.title,
        score: Number(work.score ?? 0),
        imageUrl: work.image_url,
        isActive: work.is_active,
        platform,
        detail7: m.detail7,
        affiliate7: m.affiliate7,
        detail30: m.detail30,
        affiliate30: m.affiliate30,
        ctr7: Math.round(ctr7 * 10) / 10,
        ctr30: Math.round(ctr30 * 10) / 10,
      };
    });

    workMetrics.sort((a, b) => {
      if (b.affiliate30 !== a.affiliate30) {
        return b.affiliate30 - a.affiliate30;
      }
      if (b.detail30 !== a.detail30) {
        return b.detail30 - a.detail30;
      }
      return b.score - a.score;
    });

    const totals = workMetrics.reduce(
      (acc, item) => {
        acc.detail7 += item.detail7;
        acc.affiliate7 += item.affiliate7;
        acc.detail30 += item.detail30;
        acc.affiliate30 += item.affiliate30;
        return acc;
      },
      {
        detail7: 0,
        affiliate7: 0,
        detail30: 0,
        affiliate30: 0,
      }
    );

    const platformMap = new Map<
      string,
      {
        works: number;
        detail30: number;
        affiliate30: number;
      }
    >();

    for (const item of workMetrics) {
      const p = platformMap.get(item.platform) ?? {
        works: 0,
        detail30: 0,
        affiliate30: 0,
      };

      p.works += 1;
      p.detail30 += item.detail30;
      p.affiliate30 += item.affiliate30;

      platformMap.set(item.platform, p);
    }

    const platforms = Array.from(platformMap.entries())
      .map(([platform, value]) => ({
        platform,
        works: value.works,
        detail30: value.detail30,
        affiliate30: value.affiliate30,
        ctr30:
          value.detail30 > 0
            ? Math.round(
                (value.affiliate30 / value.detail30) * 1000
              ) / 10
            : 0,
      }))
      .sort((a, b) => b.affiliate30 - a.affiliate30);

    const dailyRows = Array.from(daily.entries()).map(
      ([date, value]) => ({
        date,
        detail: value.detail,
        affiliate: value.affiliate,
      })
    );

    return NextResponse.json({
      generatedAt: now.toISOString(),
      totals: {
        ...totals,
        ctr7:
          totals.detail7 > 0
            ? Math.round(
                (totals.affiliate7 / totals.detail7) * 1000
              ) / 10
            : 0,
        ctr30:
          totals.detail30 > 0
            ? Math.round(
                (totals.affiliate30 / totals.detail30) * 1000
              ) / 10
            : 0,
      },
      platforms,
      daily: dailyRows,
      works: workMetrics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "アクセス解析の取得に失敗しました。",
      },
      { status: 500 }
    );
  }
}
