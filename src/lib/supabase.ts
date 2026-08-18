export type Work = {
  id: string;
  slug: string;
  title: string;
  creator: string;
  tag: string;
  score: number;
  price: string;
  note: string;
  affiliateUrl: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  platform: string;
  platformSlug: string;
  isIndie: boolean;
  sampleUrl: string | null;
};

type RawWork = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  affiliate_url: string | null;
  price: number | null;
  score: number | string | null;
  published_at: string | null;
  created_at: string;
  is_indie: boolean | null;
  sample_url: string | null;
  creators: { name: string } | { name: string }[] | null;
  platforms:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

type RawRanking = {
  rank: number;
  score: number | string | null;
  works: RawWork | RawWork[] | null;
};

type Creator = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Genre = {
  id: string;
  name: string;
  slug: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function assertEnv() {
  if (!url || !key) {
    throw new Error(
      "Supabase環境変数がありません。.env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY を設定してください。"
    );
  }
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  assertEnv();

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function yen(price: number | null): string {
  if (price == null) return "価格は販売ページで確認";
  return `¥${price.toLocaleString("ja-JP")}`;
}

function toWork(row: RawWork, overrideScore?: number | string | null): Work {
  const creator = one(row.creators)?.name ?? "Creator";
  const platform = one(row.platforms);
  const rawScore = overrideScore ?? row.score ?? 0;
  const score = typeof rawScore === "string" ? Number(rawScore) : rawScore;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    creator,
    tag: row.published_at ? "新着" : row.is_indie ? "個人撮影" : "作品",
    score: Number.isFinite(score) ? Math.round(score) : 0,
    price: yen(row.price),
    note: row.description ?? "作品情報を準備中です。",
    affiliateUrl: row.affiliate_url,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
    platform: platform?.name ?? "Unknown",
    platformSlug: platform?.slug ?? "unknown",
    isIndie: Boolean(row.is_indie),
    sampleUrl: row.sample_url,
  };
}

const WORK_SELECT =
  "id,slug,title,description,image_url,affiliate_url,price,score,published_at,created_at,is_indie,sample_url,creators(name),platforms(name,slug)";

export async function getLatestWorks(limit = 12): Promise<Work[]> {
  const rows = await supabaseFetch<RawWork[]>(
    `works?select=${encodeURIComponent(WORK_SELECT)}&is_active=eq.true&order=published_at.desc.nullslast,created_at.desc&limit=${limit}`
  );
  return rows.map((row) => toWork(row));
}

export async function getTopWorks(limit = 10): Promise<Work[]> {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const rankings = await supabaseFetch<RawRanking[]>(
      `daily_rankings?select=${encodeURIComponent(
        `rank,score,works(${WORK_SELECT})`
      )}&ranking_date=eq.${today}&order=rank.asc&limit=${limit}`
    );

    const mapped = rankings
      .map((r) => {
        const work = one(r.works);
        return work ? toWork(work, r.score) : null;
      })
      .filter((w): w is Work => Boolean(w));

    if (mapped.length > 0) return mapped;
  } catch {
    // 日次ランキング未作成時は works.score 順へフォールバック
  }

  const rows = await supabaseFetch<RawWork[]>(
    `works?select=${encodeURIComponent(WORK_SELECT)}&is_active=eq.true&order=score.desc.nullslast,created_at.desc&limit=${limit}`
  );
  return rows.map((row) => toWork(row));
}

export async function getIndieTopWorks(limit = 12): Promise<Work[]> {
  const rows = await supabaseFetch<RawWork[]>(
    `works?select=${encodeURIComponent(WORK_SELECT)}&is_active=eq.true&is_indie=eq.true&order=score.desc.nullslast,published_at.desc.nullslast,created_at.desc&limit=${limit}`
  );
  return rows.map((row) => toWork(row));
}


export async function getWorksByPeriod(days: number, limit = 60): Promise<Work[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const rows = await supabaseFetch<RawWork[]>(
    `works?select=${encodeURIComponent(WORK_SELECT)}&is_active=eq.true&published_at=gte.${encodeURIComponent(
      since
    )}&order=score.desc.nullslast,published_at.desc.nullslast&limit=${limit}`
  );

  return rows.map((row) => toWork(row));
}

export async function getWorksByMaxPrice(
  maxPrice: number,
  limit = 60
): Promise<Work[]> {
  const rows = await supabaseFetch<RawWork[]>(
    `works?select=${encodeURIComponent(WORK_SELECT)}&is_active=eq.true&price=not.is.null&price=lte.${maxPrice}&order=score.desc.nullslast,published_at.desc.nullslast&limit=${limit}`
  );

  return rows.map((row) => toWork(row));
}

export async function getSampleWorks(limit = 60): Promise<Work[]> {
  const rows = await supabaseFetch<RawWork[]>(
    `works?select=${encodeURIComponent(WORK_SELECT)}&is_active=eq.true&sample_url=not.is.null&order=score.desc.nullslast,published_at.desc.nullslast&limit=${limit}`
  );

  return rows.map((row) => toWork(row));
}

export async function getWorkSlugs(
  limit = 5000
): Promise<{ slug: string; published_at: string | null; created_at: string }[]> {
  return supabaseFetch(
    `works?select=slug,published_at,created_at&is_active=eq.true&order=created_at.desc&limit=${limit}`
  );
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const rows = await supabaseFetch<RawWork[]>(
    `works?select=${encodeURIComponent(WORK_SELECT)}&is_active=eq.true&slug=eq.${encodeURIComponent(
      slug
    )}&limit=1`
  );
  return rows[0] ? toWork(rows[0]) : null;
}

export async function getCreators(): Promise<Creator[]> {
  return supabaseFetch<Creator[]>(
    "creators?select=id,name,slug,description&is_active=eq.true&order=name.asc"
  );
}

export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  const rows = await supabaseFetch<Creator[]>(
    `creators?select=id,name,slug,description&is_active=eq.true&slug=eq.${encodeURIComponent(
      slug
    )}&limit=1`
  );
  return rows[0] ?? null;
}

export async function getGenres(): Promise<Genre[]> {
  return supabaseFetch<Genre[]>(
    "genres?select=id,name,slug&order=name.asc"
  );
}
