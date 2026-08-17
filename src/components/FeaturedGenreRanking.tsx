import Link from "next/link";
import { GenreWorkCard } from "@/components/GenreWorkCard";
import {
  getFeaturedGenre,
  getGenreWorks,
} from "@/lib/genre-ranking";

export async function FeaturedGenreRanking({
  limit = 8,
}: {
  limit?: number;
}) {
  const genre =
    await getFeaturedGenre();

  if (!genre) return null;

  const works =
    await getGenreWorks(
      genre.id,
      limit
    );

  return (
    <section className="discoveryShelf wrap">
      <div className="discoveryShelfHead">
        <div>
          <p className="kicker">
            RECOMMENDED GENRE
          </p>

          <h2>
            今、オススメのジャンルランキング
          </h2>
        </div>

        <Link
          href={`/genres/${genre.slug}`}
        >
          もっと見る →
        </Link>
      </div>

      <div
        style={{
          marginTop: 10,
          marginBottom: 16,
        }}
      >
        <strong
          style={{
            display: "block",
            fontSize:
              "clamp(22px,3vw,32px)",
            lineHeight: 1.25,
          }}
        >
          {genre.name}
        </strong>

        <p
          className="shelfNote"
          style={{
            marginTop: 7,
            marginBottom: 0,
          }}
        >
          {genre.featuredDescription ||
            `${genre.name}の個人撮影作品を、H-IT SCORE順にピックアップ。`}
        </p>
      </div>

      {works.length ? (
        <div className="horizontalShelf">
          {works.map(
            (work, index) => (
              <GenreWorkCard
                key={work.id}
                work={work}
                rank={index + 1}
              />
            )
          )}
        </div>
      ) : (
        <div className="futureShelf">
          <div className="futureShelfCopy">
            <span className="futureIcon">
              #
            </span>

            <div>
              <strong>
                このジャンルの作品を準備中です
              </strong>

              <p>
                管理画面で作品に
                「{genre.name}」
                を設定すると自動表示されます。
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 16,
        }}
      >
        <Link
          href="/genres"
          style={{
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          他のジャンルのランキングも見る →
        </Link>
      </div>
    </section>
  );
}
