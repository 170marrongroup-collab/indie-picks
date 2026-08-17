import { notFound } from "next/navigation";
import Link from "next/link";
import { GenreWorkCard } from "@/components/GenreWorkCard";
import { PcolleRanking } from "@/components/PcolleRanking";
import { getGenreBySlug, getGenreWorks } from "@/lib/genre-ranking";

export default async function GenreRankingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const genre = await getGenreBySlug(slug);
  if (!genre) notFound();

  const works = await getGenreWorks(genre.id, 50);

  return (
    <main className="wrap page">
      <p className="kicker">GENRE RANKING</p>
      <h1 style={{ fontSize: "clamp(36px,6vw,68px)", marginBottom: 12 }}>
        個撮　{genre.name} ランキング
      </h1>
      <p className="lead" style={{ marginBottom: 28 }}>
        H-ITに登録された「{genre.name}」作品をH-IT SCORE順に表示。
      </p>

      {works.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
            gap: 14,
          }}
        >
          {works.map((work, index) => (
            <GenreWorkCard
              key={work.id}
              work={work}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="futureShelf">
          <div className="futureShelfCopy">
            <span className="futureIcon">#</span>
            <div>
              <strong>作品を準備中です</strong>
              <p>管理画面からこのジャンルを設定してください。</p>
            </div>
          </div>
        </div>
      )}

      {genre.pcolleCategoryId ? (
        <section className="discoveryShelf" style={{ marginTop: 54 }}>
          <div className="discoveryShelfHead">
            <div>
              <p className="kicker">PCOLLE OFFICIAL</p>
              <h2>Pcolle {genre.name} 人気ランキング</h2>
            </div>
          </div>
          <PcolleRanking
            type="ranking2week"
            category={String(genre.pcolleCategoryId)}
            count={5}
            height={150}
            direction="horizontal"
          />
        </section>
      ) : null}

      <div style={{ marginTop: 30 }}>
        <Link href="/genres">← 他のジャンルのランキングを見る</Link>
      </div>
    </main>
  );
}
