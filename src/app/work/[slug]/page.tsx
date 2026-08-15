import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkBySlug } from "@/lib/supabase";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);

  if (!work) notFound();

  return (
    <main className="wrap page">
      <p className="kicker">WORK DETAIL</p>
      <div className="detail">
        <div className="detailVisual">
          <b>{work.score}</b>
          <span>INDIE SCORE</span>
        </div>

        <div>
          <p className="eyebrow">
            {work.creator} / {work.tag}
          </p>
          <h1>{work.title}</h1>
          <p className="lead">{work.note}</p>

          <div className="scoreBox">
            <div>
              <small>総合スコア</small>
              <strong>{work.score}</strong>
            </div>
            <div>
              <small>参考価格</small>
              <strong>{work.price}</strong>
            </div>
          </div>

          {work.affiliateUrl ? (
            <Link
              className="primary"
              href={work.affiliateUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
            >
              販売ページを見る
            </Link>
          ) : (
            <button className="primary disabled" disabled>
              販売ページ準備中
            </button>
          )}

          <p className="notice">
            ※ 作品情報・画像・価格・販売リンクは、各販売元・ASPの利用規約に沿って掲載してください。
          </p>
        </div>
      </div>
    </main>
  );
}
