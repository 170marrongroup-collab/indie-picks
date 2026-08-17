import Image from "next/image";
import { TrackedLink } from "@/components/TrackedLink";
import type { GenreWork } from "@/lib/genre-ranking";

export function GenreWorkCard({
  work,
  rank,
}: {
  work: GenreWork;
  rank?: number;
}) {
  return (
    <TrackedLink
      workId={work.id}
      source="detail"
      href={`/work/${work.slug}`}
      className="discoveryWorkCard"
    >
      <div className={`discoveryThumb ${work.imageUrl ? "hasImage" : ""}`}>
        {work.imageUrl ? (
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            sizes="(max-width: 700px) 46vw, 220px"
            className="discoveryWorkImage"
          />
        ) : (
          <div className="discoveryNoImage">INDIE PICKS</div>
        )}

        {rank ? <span className="rankPill">#{rank}</span> : null}
        <span className="contentPill">
          {work.sampleUrl ? "サンプルあり" : "個撮"}
        </span>
        <span className="sourcePill">{work.platform}</span>
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
