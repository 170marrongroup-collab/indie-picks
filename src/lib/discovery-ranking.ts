import "server-only";

export type DiscoveryWork = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  creator: string;
  platform: string;
  score: number;
  sampleUrl: string | null;
  detail7: number;
  affiliate7: number;
  detail30: number;
  affiliate30: number;
  ctr7: number;
  ctr30: number;
  risingScore: number;
  attentionScore: number;
};

export type DiscoveryShelves = {
  rising: DiscoveryWork[];
  highCtr: DiscoveryWork[];
  attention: DiscoveryWork[];
};

type RawWork = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  score: number | string | null;
  sample_url: string | null;
  created_at: string;
  published_at: string | null;
  creators: { name: string } | { name: string }[] | null;
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function shortPlatform(
  platform: { name: string; slug: string } | null
) {
  if (!platform) return "Unknown";
  if (platform.slug === "fc2-content-market") return "FC2";
  if (platform.slug === "pcolle") return "Pcolle";
  return platform.name;
}

async function supabase<T>(path: string): Promise<T> {
  if (!url || !secret) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY is missing."
    );
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/${path}`,
    {
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Discovery ranking failed (${response.status}): ${body}`
    );
  }

  return (body ? JSON.parse(body) : []) as T;
}

function daysAgo(iso: string) {
  return Math.max(
    0,
    (Date.now() - new Date(iso).getTime()) / 86400000
  );
}

function freshnessBonus(
  publishedAt: string | null,
  createdAt: string
) {
  const age = daysAgo(publishedAt ?? createdAt);

  if (age <= 1) return 18;
  if (age <= 3) return 15;
  if (age <= 7) return 11;
  if (age <= 14) return 7;
  if (age <= 30) return 4;
  return 0;
}

function ctr(affiliate: number, detail: number) {
  if (detail <= 0) return 0;
  return affiliate / detail;
}

function uniqueById(
  works: DiscoveryWork[],
  limit: number
) {
  const seen = new Set<string>();
  const result: DiscoveryWork[] = [];

  for (const work of works) {
    if (seen.has(work.id)) continue;
    seen.add(work.id);
    result.push(work);
    if (result.length >= limit) break;
  }

  return result;
}

export async function getDiscoveryShelves(
  limit = 8
): Promise<DiscoveryShelves> {
  const now = new Date();
  const since30 = new Date(
    now.getTime() - 30 * 86400000
  );
  const since7 = new Date(
    now.getTime() - 7 * 86400000
  );

  const [works, clicks] = await Promise.all([
    supabase<RawWork[]>(
      "works?select=id,slug,title,image_url,score,sample_url,created_at,published_at,creators(name),platforms(name,slug)&is_active=eq.true&is_indie=eq.true&order=score.desc.nullslast,created_at.desc&limit=300"
    ),
    supabase<ClickRow[]>(
      `click_events?select=work_id,source,created_at&created_at=gte.${encodeURIComponent(
        since30.toISOString()
      )}&limit=20000`
    ),
  ]);

  const clickMap = new Map<
    string,
    {
      detail7: number;
      affiliate7: number;
      detail30: number;
      affiliate30: number;
    }
  >();

  for (const click of clicks) {
    const current = clickMap.get(click.work_id) ?? {
      detail7: 0,
      affiliate7: 0,
      detail30: 0,
      affiliate30: 0,
    };

    const created = new Date(click.created_at);

    if (click.source === "detail") {
      current.detail30 += 1;
      if (created >= since7) {
        current.detail7 += 1;
      }
    }

    if (click.source === "affiliate") {
      current.affiliate30 += 1;
      if (created >= since7) {
        current.affiliate7 += 1;
      }
    }

    clickMap.set(click.work_id, current);
  }

  const enriched: DiscoveryWork[] = works.map(
    (work) => {
      const clicksForWork =
        clickMap.get(work.id) ?? {
          detail7: 0,
          affiliate7: 0,
          detail30: 0,
          affiliate30: 0,
        };

      const rawScore =
        typeof work.score === "string"
          ? Number(work.score)
          : work.score ?? 0;

      const indieScore = Number.isFinite(rawScore)
        ? Number(rawScore)
        : 0;

      const ctr7Value = ctr(
        clicksForWork.affiliate7,
        clicksForWork.detail7
      );

      const ctr30Value = ctr(
        clicksForWork.affiliate30,
        clicksForWork.detail30
      );

      // 急上昇:
      // 直近7日の販売ページ遷移を最も強く、
      // 詳細クリック・新着度・H-IT SCOREを補助にする。
      const risingScore =
        Math.log1p(clicksForWork.affiliate7) * 30 +
        Math.log1p(clicksForWork.detail7) * 12 +
        ctr7Value * 20 +
        freshnessBonus(
          work.published_at,
          work.created_at
        ) +
        indieScore * 0.22;

      // 注目:
      // 30日実績を安定指標として利用。
      const attentionScore =
        indieScore * 0.45 +
        Math.log1p(clicksForWork.affiliate30) * 24 +
        Math.log1p(clicksForWork.detail30) * 8 +
        ctr30Value * 18 +
        (work.sample_url ? 4 : 0);

      const platform = one(work.platforms);

      return {
        id: work.id,
        slug: work.slug,
        title: work.title,
        imageUrl: work.image_url,
        creator:
          one(work.creators)?.name ??
          "販売者未設定",
        platform: shortPlatform(platform),
        score: Math.round(indieScore),
        sampleUrl: work.sample_url,
        detail7: clicksForWork.detail7,
        affiliate7: clicksForWork.affiliate7,
        detail30: clicksForWork.detail30,
        affiliate30: clicksForWork.affiliate30,
        ctr7:
          Math.round(ctr7Value * 1000) / 10,
        ctr30:
          Math.round(ctr30Value * 1000) / 10,
        risingScore,
        attentionScore,
      };
    }
  );

  const byScore = [...enriched].sort(
    (a, b) => b.score - a.score
  );

  const risingCandidates = [...enriched].sort(
    (a, b) => {
      const aHasRecent =
        a.detail7 + a.affiliate7 > 0 ? 1 : 0;
      const bHasRecent =
        b.detail7 + b.affiliate7 > 0 ? 1 : 0;

      if (bHasRecent !== aHasRecent) {
        return bHasRecent - aHasRecent;
      }

      return b.risingScore - a.risingScore;
    }
  );

  // 高CTRは母数が少なすぎる作品を上位にしない。
  // 詳細5クリック以上を優先し、足りない場合は30日実績、
  // それでも足りなければH-IT SCOREで補完。
  const highCtrStrong = enriched
    .filter((work) => work.detail7 >= 5)
    .sort((a, b) => {
      if (b.ctr7 !== a.ctr7) {
        return b.ctr7 - a.ctr7;
      }
      return b.affiliate7 - a.affiliate7;
    });

  const highCtrMedium = enriched
    .filter(
      (work) =>
        work.detail7 < 5 &&
        work.detail30 >= 5
    )
    .sort((a, b) => {
      if (b.ctr30 !== a.ctr30) {
        return b.ctr30 - a.ctr30;
      }
      return b.affiliate30 - a.affiliate30;
    });

  const attention = [...enriched].sort(
    (a, b) =>
      b.attentionScore - a.attentionScore
  );

  return {
    rising: uniqueById(
      [...risingCandidates, ...byScore],
      limit
    ),
    highCtr: uniqueById(
      [
        ...highCtrStrong,
        ...highCtrMedium,
        ...attention,
        ...byScore,
      ],
      limit
    ),
    attention: uniqueById(
      [...attention, ...byScore],
      limit
    ),
  };
}
