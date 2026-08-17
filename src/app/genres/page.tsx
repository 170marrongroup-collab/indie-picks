import Link from "next/link";
import { getGenresWithCounts } from "@/lib/genre-ranking";

export default async function GenresPage() {
  const genres = await getGenresWithCounts();

  return (
    <main className="wrap page">
      <p className="kicker">GENRE RANKING</p>
      <h1 style={{ fontSize: "clamp(38px,6vw,72px)", marginBottom: 12 }}>
        ジャンル別ランキング
      </h1>
      <p className="lead" style={{ marginBottom: 30 }}>
        見たいジャンルから、個人撮影作品を探せます。
      </p>

      <div className="genre-grid">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/genres/${genre.slug}`}
            className="genre-card"
          >
            <small className="genre-card-label">個撮ランキング</small>
            <strong className="genre-card-name">{genre.name}</strong>
            <span className="genre-card-count">{genre.workCount}作品 →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
