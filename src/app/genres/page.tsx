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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 12,
        }}
      >
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/genres/${genre.slug}`}
            style={{
              border: "1px solid #292932",
              background: "#141419",
              borderRadius: 14,
              padding: 18,
              color: "#fff",
              display: "block",
            }}
          >
            <small style={{ color: "#ff5c7a", fontWeight: 900 }}>
              個撮ランキング
            </small>
            <strong style={{ display: "block", fontSize: 20, marginTop: 8 }}>
              {genre.name}
            </strong>
            <span style={{ display: "block", color: "#777", fontSize: 11, marginTop: 10 }}>
              {genre.workCount}作品 →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
