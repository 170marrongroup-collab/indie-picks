export type FreeSampleWork = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  sampleUrl: string;
  affiliateUrl: string | null;
  score: number;
  creator: string;
  platform: string;
  platformSlug: string;
};

type RawFreeSampleWork = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  sample_url: string | null;
  affiliate_url: string | null;
  score: number | string | null;
  creators: { name: string } | { name: string }[] | null;
  platforms:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function shortPlatform(name: string, slug: string) {
  if (slug === "fc2-content-market") return "FC2";
  if (slug === "pcolle") return "Pcolle";
  return name;
}

export async function getFreeSampleWorks(
  limit = 12
): Promise<FreeSampleWork[]> {
  if (!url || !key) {
    throw new Error("Supabase public env is missing.");
  }

  const select =
    "id,slug,title,image_url,sample_url,affiliate_url,score,creators(name),platforms(name,slug)";

  const path =
    `works?select=${encodeURIComponent(select)}` +
    `&is_active=eq.true` +
    `&is_indie=eq.true` +
    `&sample_url=not.is.null` +
    `&order=score.desc.nullslast,created_at.desc` +
    `&limit=${limit}`;

  const response = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/${path}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Free sample ranking failed (${response.status}): ${body}`
    );
  }

  const rows =
    (await response.json()) as RawFreeSampleWork[];

  return rows
    .filter(
      (
        row
      ): row is RawFreeSampleWork & {
        sample_url: string;
      } => Boolean(row.sample_url)
    )
    .map((row) => {
      const platform = one(row.platforms);
      const platformName =
        platform?.name ?? "Unknown";
      const platformSlug =
        platform?.slug ?? "unknown";
      const rawScore =
        typeof row.score === "string"
          ? Number(row.score)
          : row.score ?? 0;

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        imageUrl: row.image_url,
        sampleUrl: row.sample_url,
        affiliateUrl: row.affiliate_url,
        score: Number.isFinite(rawScore)
          ? Math.round(rawScore)
          : 0,
        creator:
          one(row.creators)?.name ??
          "販売者未設定",
        platform: shortPlatform(
          platformName,
          platformSlug
        ),
        platformSlug,
      };
    });
}
