import Image from "next/image";
import Link from "next/link";
import { getCreators, getLatestWorks, getTopWorks, type Work } from "@/lib/supabase";
import { PcolleRanking } from "@/components/PcolleRanking";

function CompactWorkCard({
  work,
  rank,
  badge,
}: {
  work: Work;
  rank?: number;
  badge?: string;
}) {
  return (
    <Link href={`/work/${work.slug}`} className="discoveryWorkCard">
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
        {badge ? <span className="contentPill">{badge}</span> : null}
        <span className="sourcePill">FANZA</span>
      </div>

      <div className="discoveryWorkBody">
        <h3>{work.title}</h3>
        <p>{work.creator}</p>
        <div className="discoveryMeta">
          <span>INDIE SCORE</span>
          <b>{work.score}</b>
        </div>
      </div>
    </Link>
  );
}

function Shelf({
  eyebrow,
  title,
  href,
  children,
}: {
  eyebrow: string;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="discoveryShelf wrap">
      <div className="discoveryShelfHead">
        <div>
          <p className="kicker">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <Link href={href}>もっと見る →</Link>
      </div>
      {children}
    </section>
  );
}

export default async function Home() {
  const [ranking, latest, creators] = await Promise.all([
    getTopWorks(8),
    getLatestWorks(8),
    getCreators(),
  ]);

  const creatorPreview = creators.slice(0, 8);

  return (
    <main className="discoveryHome">
      <section className="compactHero">
        <div className="wrap">
          <div className="compactHeroTop">
            <div>
              <p className="kicker">INDIE ADULT DISCOVERY</p>
              <h1>個人発信のアダルト作品を見つける場所</h1>
              <p>
                個人作品・同人AV・ファンクラブを横断して、
                今見たい作品とクリエイターを発見。
              </p>
            </div>
            <div className="serviceMiniBadges">
              <span className="live">FANZA</span>
              <span className="live">Pcolle</span>
              <span>FC2</span>
              <span>myfans</span>
              <span>Fantia</span>
            </div>
          </div>

          <div className="mainChoice">
            <Link href="/ranking" className="mainChoiceCard">
              <small>WATCH</small>
              <strong>作品を探す</strong>
              <span>個人撮影・ランキング・新着 →</span>
            </Link>
            <Link href="/creators" className="mainChoiceCard creatorChoice">
              <small>CREATORS</small>
              <strong>クリエイターを探す</strong>
              <span>人気・新人・急上昇 →</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="homeTabs">
        <div className="wrap homeTabsInner">
          <Link href="/ranking">作品ランキング</Link>
          <Link href="/creators">クリエイター</Link>
          <Link href="/new">新着</Link>
          <Link href="/genres">ジャンル</Link>
        </div>
      </div>

      <Shelf eyebrow="TRENDING WORKS" title="総合作品ランキング" href="/ranking">
        <p className="shelfNote">
          現在はFANZA掲載作品から算出。Pcolle・FC2連携後は横断ランキングになります。
        </p>
        <div className="horizontalShelf">
          {ranking.map((work, index) => (
            <CompactWorkCard key={work.id} work={work} rank={index + 1} />
          ))}
        </div>
      </Shelf>

      <Shelf eyebrow="TRENDING NOW" title="個人撮影 急上昇" href="/ranking">
        <p className="shelfNote">
          今この瞬間に動いている個人撮影作品をピックアップ。
        </p>
        <PcolleRanking type="rankingRealtime" count={5} height={150} direction="horizontal" />
      </Shelf>

      <Shelf eyebrow="INDIE VIDEO RANKING" title="個人撮影 人気ランキング" href="/ranking">
        <p className="shelfNote">
          個人クリエイターが販売する人気動画をピックアップ。
        </p>
        <PcolleRanking type="ranking2week" count={5} height={150} direction="horizontal" />
      </Shelf>

      <Shelf eyebrow="NEW INDIE VIDEOS" title="個人撮影 新着" href="/new">
        <p className="shelfNote">
          新しく公開された個人撮影作品をチェック。
        </p>
        <PcolleRanking type="new" count={5} height={150} direction="horizontal" />
      </Shelf>

      <Shelf eyebrow="CREATOR RANKING" title="クリエイターランキング" href="/creators">
        <p className="shelfNote">
          myfans・Fantiaなどの個人クリエイターを横断して探せるメイン機能へ拡張予定。
        </p>
        <div className="creatorShelf">
          {creatorPreview.length ? (
            creatorPreview.map((creator, index) => (
              <Link href="/creators" className="creatorMiniCard" key={creator.id}>
                <div className="creatorAvatar">
                  <span>{creator.name.slice(0, 1).toUpperCase()}</span>
                  <b>#{index + 1}</b>
                </div>
                <strong>{creator.name}</strong>
                <small>FANZA / CREATOR</small>
                <span className="creatorCta">作品を見る →</span>
              </Link>
            ))
          ) : (
            <div className="comingPanel">
              myfans・Fantia連携後、ここにクリエイターランキングを表示します。
            </div>
          )}
        </div>
      </Shelf>

      <Shelf eyebrow="FREE PREVIEW" title="無料動画ランキング" href="/ranking">
        <div className="futureShelf">
          <div className="futureShelfCopy">
            <span className="futureIcon">▶</span>
            <div>
              <strong>無料サンプルから作品を発見</strong>
              <p>
                Pcolle・myfansなどの公式無料動画／サンプルを連携し、
                人気順に並べる予定です。
              </p>
            </div>
          </div>
          <span className="soonBadge">COMING SOON</span>
        </div>
      </Shelf>

      <Shelf eyebrow="NEW RELEASES" title="新着動画" href="/new">
        <div className="horizontalShelf">
          {latest.map((work) => (
            <CompactWorkCard key={work.id} work={work} badge="NEW" />
          ))}
        </div>
      </Shelf>

      <Shelf eyebrow="NEW FACES" title="新人クリエイター" href="/creators">
        <div className="creatorShelf">
          {creatorPreview.slice().reverse().map((creator) => (
            <Link href="/creators" className="creatorMiniCard" key={`new-${creator.id}`}>
              <div className="creatorAvatar newCreatorAvatar">
                <span>{creator.name.slice(0, 1).toUpperCase()}</span>
              </div>
              <strong>{creator.name}</strong>
              <small>NEW CREATOR</small>
              <span className="creatorCta">チェックする →</span>
            </Link>
          ))}
        </div>
      </Shelf>

      <Shelf eyebrow="EXCLUSIVE" title="ここでしか見られない" href="/ranking">
        <div className="futureShelf exclusiveFuture">
          <div className="futureShelfCopy">
            <span className="futureIcon">🔒</span>
            <div>
              <strong>限定・独占コンテンツをまとめて発見</strong>
              <p>
                個人販売・ファンクラブの「限定作品」を販売サイト横断で表示する予定です。
              </p>
            </div>
          </div>
          <span className="soonBadge">Pcolle / myfans / Fantia</span>
        </div>
      </Shelf>

      <section className="discoveryShelf wrap">
        <div className="discoveryShelfHead">
          <div>
            <p className="kicker">BY PLATFORM</p>
            <h2>サービス別ランキング</h2>
          </div>
        </div>
        <div className="platformGrid">
          {[
            ["Pcolle", "個人動画", "公式ランキング連携中"],
            ["FC2", "個人動画", "追加予定"],
            ["myfans", "クリエイター", "追加予定"],
            ["Fantia", "ファンクラブ", "追加予定"],
          ].map(([name, type, status]) => (
            <div className="platformCard" key={name}>
              <small>{type}</small>
              <strong>{name}</strong>
              <span>{status}</span>
            </div>
          ))}
        </div>
      </section>

      <Shelf eyebrow="SALE" title="セール作品" href="/ranking">
        <div className="futureShelf saleFuture">
          <div className="futureShelfCopy">
            <span className="futureIcon">%</span>
            <div>
              <strong>値下げ・キャンペーン中の作品</strong>
              <p>
                通常一覧では価格を強調せず、この棚だけ割引率・価格を目立たせます。
              </p>
            </div>
          </div>
          <span className="soonBadge">SALE</span>
        </div>
      </Shelf>

      <section className="commercialSection">
        <div className="wrap">
          <div className="discoveryShelfHead">
            <div>
              <p className="kicker">PRO / COMMERCIAL</p>
              <h2>商業・同人作品も見る</h2>
            </div>
            <Link href="/ranking">FANZA作品を見る →</Link>
          </div>
          <p className="shelfNote">
            INDIE PICKSの主役は個人発信。FANZA作品は比較・発見のための別枠として掲載します。
          </p>
          <div className="horizontalShelf">
            {ranking.slice(0, 6).map((work) => (
              <CompactWorkCard key={`pro-${work.id}`} work={work} badge="FANZA" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
