import Image from "next/image";
import { TrackedLink } from "@/components/TrackedLink";
import { getFreeSampleWorks } from "@/lib/free-samples";

export default async function FreeSamplePage() {
  const works = await getFreeSampleWorks(50);

  return (
    <main className="wrap page">
      <p className="kicker">
        FREE SAMPLE RANKING
      </p>

      <h1
        style={{
          fontSize: "clamp(38px,6vw,72px)",
          marginBottom: 12,
        }}
      >
        無料サンプルランキング
      </h1>

      <p
        className="lead"
        style={{ marginBottom: 34 }}
      >
        公式サンプル動画がある個人撮影作品を、
        H-IT SCORE順にランキング。
        気になる作品は詳細ページで
        公式サンプルを再生できます。
      </p>

      {works.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(170px,1fr))",
            gap: 14,
          }}
        >
          {works.map((work, index) => (
            <TrackedLink
              key={work.id}
              workId={work.id}
              source="detail"
              href={`/work/${work.slug}`}
              className="discoveryWorkCard"
            >
              <div
                className={`discoveryThumb ${
                  work.imageUrl
                    ? "hasImage"
                    : ""
                }`}
              >
                {work.imageUrl ? (
                  <Image
                    src={work.imageUrl}
                    alt={work.title}
                    fill
                    sizes="220px"
                    className="discoveryWorkImage"
                  />
                ) : (
                  <div className="discoveryNoImage">
                    H-IT
                  </div>
                )}

                <span className="rankPill">
                  #{index + 1}
                </span>
                <span className="contentPill">
                  ▶ 無料サンプル
                </span>
                <span className="sourcePill">
                  {work.platform}
                </span>
              </div>

              <div className="discoveryWorkBody">
                <h3>{work.title}</h3>
                <p>{work.creator}</p>

                <div className="discoveryMeta">
                  <span>H-IT SCORE</span>
                  <b>{work.score}</b>
                </div>
              </div>
            </TrackedLink>
          ))}
        </div>
      ) : (
        <div className="futureShelf">
          <div className="futureShelfCopy">
            <span className="futureIcon">
              ▶
            </span>
            <div>
              <strong>
                無料サンプル作品を準備中
              </strong>
              <p>
                FC2などでsample_urlを登録すると
                自動表示されます。
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
