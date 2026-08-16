import Image from "next/image";
import { notFound } from "next/navigation";
import { TrackedLink } from "@/components/TrackedLink";
import { getWorkBySlug } from "@/lib/supabase";

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  return (
    <main className="wrap page">
      <p className="kicker">WORK DETAIL</p>
      <div className="detail">
        <div className={`detailVisual ${work.imageUrl ? "hasImage" : ""}`}>
          {work.imageUrl ? (
            <Image src={work.imageUrl} alt={work.title} fill sizes="(max-width: 800px) 100vw, 45vw" className="detailImage" priority />
          ) : (<> <b>{work.score}</b><span>INDIE SCORE</span> </>)}
        </div>
        <div>
          <p className="eyebrow">{work.creator} / {work.tag}</p>
          <h1>{work.title}</h1>
          <p className="lead">{work.note}</p>
          <div className="scoreBox">
            <div><small>INDIE SCORE</small><strong>{work.score}</strong></div>
            <div><small>参考価格</small><strong>{work.price}</strong></div>
          </div>
          {work.affiliateUrl ? (
            <TrackedLink workId={work.id} source="affiliate" href={work.affiliateUrl} className="primary" external>販売ページを見る</TrackedLink>
          ) : (<button className="primary disabled" disabled>販売ページ準備中</button>)}
          <p className="notice">※ INDIE SCOREは新着度・価格・レビュー・サイト内人気などから算出する独自指標です。</p>
        </div>
      </div>
    </main>
  );
}
