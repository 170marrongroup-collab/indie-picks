export type PublicGenre = {
  id: string;
  name: string;
  slug: string;
  pcolleCategoryId: number | null;
  workCount: number;
  isFeatured: boolean;
  featuredDescription: string | null;
};

export type GenreWork = {
  id: string;
  slug: string;
  title: string;
  creator: string;
  imageUrl: string | null;
  sampleUrl: string | null;
  score: number;
  platform: string;
};

type RawGenre = {
  id: string;
  name: string;
  slug: string;
  pcolle_category_id: number | null;
  is_featured: boolean;
  featured_description: string | null;
};

type RawWorkGenre = {
  genre_id: string;
  work_id: string;
};

type RawGenreWork = {
  work_id: string;
  works: any;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function platformLabel(
  value: { name: string; slug: string } | null
) {
  if (!value) return "Unknown";
  if (value.slug === "fc2-content-market") return "FC2";
  if (value.slug === "pcolle") return "Pcolle";
  return value.name;
}

async function publicFetch<T>(path: string): Promise<T> {
  if (!url || !key) {
    throw new Error("Supabase public env is missing.");
  }

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

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status}: ${text}`);
  }

  return (text ? JSON.parse(text) : []) as T;
}

export async function getGenresWithCounts(): Promise<PublicGenre[]> {
  const [genres, links] = await Promise.all([
    publicFetch<RawGenre[]>(
      "genres?select=id,name,slug,pcolle_category_id,is_featured,featured_description&order=name.asc"
    ),
    publicFetch<RawWorkGenre[]>(
      "work_genres?select=genre_id,work_id"
    ),
  ]);

  const counts = new Map<string, Set<string>>();

  for (const row of links) {
    if (!counts.has(row.genre_id)) {
      counts.set(row.genre_id, new Set());
    }

    counts.get(row.genre_id)!.add(row.work_id);
  }

  return genres.map((genre) => ({
    id: genre.id,
    name: genre.name,
    slug: genre.slug,
    pcolleCategoryId: genre.pcolle_category_id,
    workCount: counts.get(genre.id)?.size ?? 0,
    isFeatured: Boolean(genre.is_featured),
    featuredDescription: genre.featured_description,
  }));
}

export async function getGenreBySlug(
  slug: string
): Promise<PublicGenre | null> {
  const rows = await publicFetch<RawGenre[]>(
    `genres?select=id,name,slug,pcolle_category_id,is_featured,featured_description&slug=eq.${encodeURIComponent(
      slug
    )}&limit=1`
  );

  const row = rows[0];
  if (!row) return null;

  const links = await publicFetch<RawWorkGenre[]>(
    `work_genres?select=genre_id,work_id&genre_id=eq.${row.id}`
  );

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    pcolleCategoryId: row.pcolle_category_id,
    workCount: new Set(links.map((x) => x.work_id)).size,
    isFeatured: Boolean(row.is_featured),
    featuredDescription: row.featured_description,
  };
}

export async function getGenreWorks(
  genreId: string,
  limit = 30
): Promise<GenreWork[]> {
  const select =
    "work_id,works(id,slug,title,image_url,sample_url,score,is_active,is_indie,creators(name),platforms(name,slug))";

  const rows = await publicFetch<RawGenreWork[]>(
    `work_genres?select=${encodeURIComponent(
      select
    )}&genre_id=eq.${encodeURIComponent(
      genreId
    )}&limit=${limit * 3}`
  );

  return rows
    .map((row) => one(row.works))
    .filter(
      (work: any) =>
        Boolean(
          work &&
            work.is_active &&
            work.is_indie
        )
    )
    .map((work: any) => {
      const rawScore =
        typeof work.score === "string"
          ? Number(work.score)
          : work.score ?? 0;

      return {
        id: work.id,
        slug: work.slug,
        title: work.title,
        creator:
          one(work.creators)?.name ??
          "販売者未設定",
        imageUrl: work.image_url,
        sampleUrl: work.sample_url,
        score: Number.isFinite(rawScore)
          ? Math.round(rawScore)
          : 0,
        platform: platformLabel(
          one(work.platforms)
        ),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function getFeaturedGenre(): Promise<PublicGenre | null> {
  const rows = await publicFetch<RawGenre[]>(
    "genres?select=id,name,slug,pcolle_category_id,is_featured,featured_description&is_featured=eq.true&limit=1"
  );

  const row = rows[0];

  if (row) {
    const links = await publicFetch<RawWorkGenre[]>(
      `work_genres?select=genre_id,work_id&genre_id=eq.${row.id}`
    );

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      pcolleCategoryId:
        row.pcolle_category_id,
      workCount:
        new Set(
          links.map((x) => x.work_id)
        ).size,
      isFeatured: true,
      featuredDescription:
        row.featured_description,
    };
  }

  // 万一おすすめ未設定なら作品数の多いジャンルへフォールバック
  const genres =
    await getGenresWithCounts();

  return (
    genres
      .slice()
      .sort(
        (a, b) =>
          b.workCount - a.workCount
      )[0] ?? null
  );
}
