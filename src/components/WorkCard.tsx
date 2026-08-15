import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/supabase";

export function WorkCard({ work, rank }: { work: Work; rank?: number }) {
  return (
    <Link href={`/work/${work.slug}`} className="card">
      <div className={`thumb ${work.imageUrl ? "hasImage" : ""}`}>
        {work.imageUrl ? (
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            sizes="(max-width: 800px) 100vw, 33vw"
            className="workImage"
          />
        ) : (
          <>
            <b>{work.score}</b>
            <small>SCORE</small>
          </>
        )}

        <span>{rank ? `#${rank}` : work.tag}</span>

        {work.imageUrl && (
          <div className="scoreBadge">
            <b>{work.score}</b>
            <small>SCORE</small>
          </div>
        )}
      </div>

      <div className="cardBody">
        <p className="eyebrow">{work.creator}</p>
        <h3>{work.title}</h3>
        <p>{work.note}</p>
        <div className="meta">
          <strong>{work.price}</strong>
          <span>詳細を見る →</span>
        </div>
      </div>
    </Link>
  );
}
