import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;

type Body = {
  platform?: unknown;
  externalId?: unknown;
  title?: unknown;
  creator?: unknown;
  imageUrl?: unknown;
  affiliateUrl?: unknown;
  sampleUrl?: unknown;
  price?: unknown;
  sourceRank?: unknown;
  sourceRankType?: unknown;
  genreIds?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableNumber(value: unknown) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function ids(value: unknown) {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v.length > 0)
    : [];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function initialScore(
  sourceRank: number | null,
  rankType: string,
  sampleUrl: string
) {
  const weights: Record<string, number> = {
    realtime: 16,
    daily: 14,
    weekly: 12,
    "2weeks": 10,
    monthly: 8,
    new: 6,
    manual: 4,
  };

  let score = 34;
  if (sampleUrl) score += 5;

  if (sourceRank && sourceRank > 0) {
    const weight = weights[rankType] ?? 4;
    score += Math.max(0, weight - Math.log2(sourceRank) * 2.2);
  } else {
    score += 4;
  }

  return Math.min(98, Math.round(score));
}

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

async function getPlatform(platform: string) {
  const slug =
    platform === "Pcolle" ? "pcolle" : "fc2-content-market";

  const rows = await sb(
    `platforms?select=id,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );

  if (!rows?.[0]) throw new Error(`${platform} platform not found.`);
  return rows[0];
}

async function getCreatorId(name: string) {
  if (!name) return null;

  const slug =
    slugify(`creator-${name}`) || `creator-${Date.now()}`;

  const rows = await sb("creators?on_conflict=slug", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([{ name, slug, is_active: true }]),
  });

  return rows?.[0]?.id ?? null;
}

async function replaceGenres(workId: string, genreIds: string[]) {
  await sb(`work_genres?work_id=eq.${encodeURIComponent(workId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });

  if (!genreIds.length) return;

  await sb("work_genres", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(
      genreIds.map((genreId) => ({
        work_id: workId,
        genre_id: genreId,
      }))
    ),
  });
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const [works, links] = await Promise.all([
      sb(
        "works?select=id,slug,external_id,title,image_url,affiliate_url,score,price,is_active,is_indie,sample_url,source_rank,source_rank_type,published_at,created_at,platforms(name,slug),creators(name)&order=created_at.desc&limit=300"
      ),
      sb("work_genres?select=work_id,genre_id"),
    ]);

    const byWork = new Map<string, string[]>();

    for (const link of links) {
      const current = byWork.get(link.work_id) ?? [];
      current.push(link.genre_id);
      byWork.set(link.work_id, current);
    }

    return NextResponse.json({
      works: works.map((work: any) => ({
        ...work,
        genre_ids: byWork.get(work.id) ?? [],
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "取得失敗" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body: Body = await request.json();

  const platform = text(body.platform);
  const externalId = text(body.externalId);
  const title = text(body.title);
  const creator = text(body.creator);
  const imageUrl = text(body.imageUrl);
  const affiliateUrl = text(body.affiliateUrl);
  const sampleUrl = text(body.sampleUrl);
  const sourceRank = nullableNumber(body.sourceRank);
  const sourceRankType = text(body.sourceRankType) || "manual";
  const price = nullableNumber(body.price);
  const genreIds = ids(body.genreIds);

  if (!["Pcolle", "FC2"].includes(platform)) {
    return NextResponse.json({ error: "販売元が不正です。" }, { status: 400 });
  }

  if (!externalId || !title || !imageUrl || !affiliateUrl) {
    return NextResponse.json(
      { error: "商品ID・タイトル・画像URL・アフィリエイトURLは必須です。" },
      { status: 400 }
    );
  }

  try {
    const platformRow = await getPlatform(platform);
    const creatorId = await getCreatorId(creator);
    const prefix = platform === "Pcolle" ? "pcolle" : "fc2";
    const slug = slugify(`${prefix}-${externalId}`);

    const rows = await sb("works?on_conflict=slug", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          platform_id: platformRow.id,
          creator_id: creatorId,
          external_id: externalId,
          title,
          slug,
          description: null,
          image_url: imageUrl,
          affiliate_url: affiliateUrl,
          price,
          score: initialScore(sourceRank, sourceRankType, sampleUrl),
          published_at: null,
          is_active: true,
          is_indie: true,
          source_rank: sourceRank,
          source_rank_type: sourceRankType,
          sample_url: sampleUrl || null,
          imported_manually: true,
        },
      ]),
    });

    const work = rows?.[0];

    if (work?.id) {
      await replaceGenres(work.id, genreIds);
    }

    return NextResponse.json({
      ok: true,
      id: work?.id ?? null,
      slug,
      title,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "登録失敗" },
      { status: 500 }
    );
  }
}
