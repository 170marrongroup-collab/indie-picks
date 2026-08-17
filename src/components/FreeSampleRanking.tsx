import Image from "next/image";
import { TrackedLink } from "@/components/TrackedLink";
import {
  getFreeSampleWorks,
  type FreeSampleWork,
} from "@/lib/free-samples";

function SampleCard({
  work,
  rank,
}: {
  work: FreeSampleWork;
  rank: number;
}) {
  return (
    <TrackedLink
      workId={work.id}
      source="detail"
      href={`/work/${work.slug}`}
      className="discoveryWorkCard"
    >
      <div
        className={`discoveryThumb ${
          work.imageUrl ? "hasImage" : ""
        }`}
      >
        {work.imageUrl ? (
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            sizes="(max-width: 700px) 46vw, 220px"
            className="discoveryWorkImage"
          />
        ) : (
          <div className="discoveryNoImage">
            INDIE PICKS
          </div>
        )}

        <span className="rankPill">
          #{rank}
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
          <span>INDIE SCORE</span>
          <b>{work.score}</b>
        </div>
      </div>
    </TrackedLink>
  );
}

export async function FreeSampleRanking({
  limit = 8,
}: {
  limit?: number;
}) {
  const works =
    await getFreeSampleWorks(limit);

  if (!works.length) {
    return (
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
              sample_url が登録された作品が
              自動的にここへ表示されます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="horizontalShelf">
      {works.map((work, index) => (
        <SampleCard
          key={work.id}
          work={work}
          rank={index + 1}
        />
      ))}
    </div>
  );
}
