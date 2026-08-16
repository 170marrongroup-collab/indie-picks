import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorBySlug } from "@/lib/supabase";

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator) notFound();

  return (
    <main className="creatorDetailPage">
      <section className="creatorDetailHero">
        <div className="wrap creatorDetailHeroInner">
          <div className="creatorDetailAvatar">
            <span>{creator.name.slice(0, 1).toUpperCase()}</span>
          </div>

          <div className="creatorDetailInfo">
            <div className="creatorDetailBadges">
              <span>CREATOR</span>
              <span className="pending">myfans SOON</span>
            </div>

            <h1>{creator.name}</h1>

            <p className="creatorDetailBio">
              {creator.description ?? "プロフィール情報を準備中です。"}
            </p>

            <div className="creatorDetailActions">
              <button className="primary disabled" disabled>
                myfansプロフィール準備中
              </button>
              <Link href="/creators" className="secondary">
                クリエイター一覧へ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="creatorDetailSection wrap">
        <div className="creatorDetailSectionHead">
          <div>
            <p className="kicker">PROFILE</p>
            <h2>クリエイター情報</h2>
          </div>
        </div>

        <div className="creatorDetailInfoGrid">
          <div className="creatorDetailInfoCard">
            <small>PLATFORM</small>
            <strong>myfans</strong>
            <span>審査通過後に連携予定</span>
          </div>

          <div className="creatorDetailInfoCard">
            <small>CONTENT</small>
            <strong>限定コンテンツ</strong>
            <span>投稿・プラン情報を掲載予定</span>
          </div>

          <div className="creatorDetailInfoCard">
            <small>STATUS</small>
            <strong>準備中</strong>
            <span>プロフィールURL連携待ち</span>
          </div>
        </div>
      </section>

      <section className="creatorDetailSection creatorDetailSoft">
        <div className="wrap">
          <div className="creatorDetailSectionHead">
            <div>
              <p className="kicker">CONTENTS</p>
              <h2>このクリエイターの作品</h2>
            </div>
          </div>

          <div className="creatorDetailPlaceholder">
            <div className="creatorDetailPlaceholderIcon">▶</div>
            <div>
              <strong>作品・限定投稿をここに表示します</strong>
              <p>
                myfans連携後、無料サンプル・限定投稿・プランなどをまとめて表示します。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="creatorDetailSection wrap">
        <div className="creatorDetailSectionHead">
          <div>
            <p className="kicker">DISCOVER MORE</p>
            <h2>ほかのクリエイターも見る</h2>
          </div>
        </div>

        <Link href="/creators" className="creatorDetailMore">
          クリエイターランキングへ →
        </Link>
      </section>
    </main>
  );
}
