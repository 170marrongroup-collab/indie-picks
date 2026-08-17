import Image from "next/image";
import { TrackedLink } from "@/components/TrackedLink";
import {
  getDiscoveryShelves,
  type DiscoveryWork,
} from "@/lib/discovery-ranking";

function WorkCard({
  work,
  badge,
  metric,
}: {
  work: DiscoveryWork;
  badge: string;
  metric: string;
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
            H-IT
          </div>
        )}

        <span className="contentPill">
          {badge}
        </span>

        <span className="sourcePill">
          {work.platform}
        </span>

        {work.sampleUrl && (
          <span className="rankPill">
            ▶ SAMPLE
          </span>
        )}
      </div>

      <div className="discoveryWorkBody">
        <h3>{work.title}</h3>
        <p>{work.creator}</p>

        <div className="discoveryMeta">
          <span>{metric}</span>
          <b>{work.score}</b>
        </div>
      </div>
    </TrackedLink>
  );
}

function ShelfBlock({
  eyebrow,
  title,
  note,
  works,
  badge,
  metric,
}: {
  eyebrow: string;
  title: string;
  note: string;
  works: DiscoveryWork[];
  badge: string;
  metric: string;
}) {
  return (
    <section className="shelfSection">
      <div className="shelfHeader">
        <div>
          <p className="shelfEyebrow">
            {eyebrow}
          </p>
          <h2>{title}</h2>
        </div>
      </div>

      <p className="shelfNote">{note}</p>

      <div className="horizontalShelf">
        {works.map((work) => (
          <WorkCard
            key={work.id}
            work={work}
            badge={badge}
            metric={metric}
          />
        ))}
      </div>
    </section>
  );
}

export async function AutoOptimizedShelves({
  limit = 8,
}: {
  limit?: number;
}) {
  const shelves =
    await getDiscoveryShelves(limit);

  return (
    <>
      <ShelfBlock
        eyebrow="TRENDING NOW"
        title="個人撮影 急上昇"
        note="直近7日の詳細クリック・販売ページ遷移・新着度をもとに自動更新。"
        works={shelves.rising}
        badge="急上昇"
        metric="H-IT SCORE"
      />

      <ShelfBlock
        eyebrow="HIGH CTR"
        title="販売ページ遷移率が高い作品"
        note="作品詳細を見た人のうち、販売ページまで進んだ割合を重視。母数が少ない作品は自動補正します。"
        works={shelves.highCtr}
        badge="高CTR"
        metric="H-IT SCORE"
      />

      <ShelfBlock
        eyebrow="H-IT"
        title="今注目の個人撮影"
        note="H-IT SCOREと直近30日のアクセス実績を組み合わせた総合注目ランキング。"
        works={shelves.attention}
        badge="注目"
        metric="H-IT SCORE"
      />
    </>
  );
}
