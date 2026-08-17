import Image from "next/image";
import Link from "next/link";
import { TrackedLink } from "@/components/TrackedLink";
import { FreeSampleRanking } from "@/components/FreeSampleRanking";
import { FeaturedGenreRanking } from "@/components/FeaturedGenreRanking";
import { PcolleRanking } from "@/components/PcolleRanking";
import {
  getCreators,
  getIndieTopWorks,
  getLatestWorks,
  getTopWorks,
  type Work,
} from "@/lib/supabase";

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

        {rank ? (
          <span className="rankPill">
            #{rank}
          </span>
        ) : null}

        {badge ? (
          <span className="contentPill">
            {badge}
          </span>
        ) : null}

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

        <Link href={href}>
          もっと見る →
        </Link>
      </div>

      {children}
    </section>
  );
}

export default async function Home() {
  const [
    indieRanking,
    ranking,
    latest,
    creators,
  ] = await Promise.all([
    getIndieTopWorks(10),
    getTopWorks(8),
    getLatestWorks(8),
    getCreators(),
  ]);

  const creatorPreview =
    creators.slice(0, 8);

  return (
    <main className="discoveryHome">
      {/* HERO */}
      <section className="compactHero">
        <div className="wrap">
          <div className="compactHeroTop">
            <div>
              <p className="kicker">
                INDIE ADULT DISCOVERY
              </p>

              <h1>
                個人発信のアダルト作品を見つける場所
              </h1>

              <p>
                個人作品・同人AV・ファンクラブを横断して、
                今見たい作品とクリエイターを発見。
              </p>
            </div>

            <div className="serviceMiniBadges">
              <span className="live">
                FANZA
              </span>
              <span className="live">
                Pcolle
              </span>
              <span className="live">
                FC2
              </span>
              <span>myfans</span>
              <span>Fantia</span>
            </div>
          </div>

          <div className="mainChoice">
            <Link
              href="/ranking"
              className="mainChoiceCard"
            >
              <small>WATCH</small>
              <strong>作品を探す</strong>
              <span>
                個人撮影・ランキング・新着 →
              </span>
            </Link>

            <Link
              href="/creators"
              className="mainChoiceCard creatorChoice"
            >
              <small>CREATORS</small>
              <strong>
                クリエイターを探す
              </strong>
              <span>
                人気・新人・急上昇 →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="homeTabs">
        <div className="wrap homeTabsInner">
          <Link href="/ranking">
            作品ランキング
          </Link>
          <Link href="/creators">
            クリエイター
          </Link>
          <Link href="/new">
            新着
          </Link>
          <Link href="/genres">
            ジャンル
          </Link>
        </div>
      </div>

      {/* INDIE CROSS RANKING */}
      <Shelf
        eyebrow="INDIE CROSS RANKING"
        title="個人撮影 総合ランキング"
        href="/ranking"
      >
        <p className="shelfNote">
          Pcolle・FC2などの個人撮影作品をINDIE
          PICKS独自指標で横断ランキング。
        </p>

        {indieRanking.length > 0 ? (
          <div className="horizontalShelf">
            {indieRanking.map(
              (work, index) => (
                <CompactWorkCard
                  key={work.id}
                  work={work}
                  rank={index + 1}
                  badge={
                    work.sampleUrl
                      ? "サンプルあり"
                      : "個人撮影"
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="futureShelf">
            <div className="futureShelfCopy">
              <span className="futureIcon">
                ★
              </span>

              <div>
                <strong>
                  個人撮影作品を準備中です
                </strong>

                <p>
                  Pcolle・FC2の個別作品登録後、
                  ここに横断ランキングを表示します。
                </p>
              </div>
            </div>
          </div>
        )}
      </Shelf>

      <FeaturedGenreRanking limit={8} />

      {/* PCOLLE REALTIME */}
      <Shelf
        eyebrow="PCOLLE REALTIME"
        title="Pcolle リアルタイム人気"
        href="/ranking"
      >
        <p className="shelfNote">
          Pcolle公式ランキングのリアルタイム人気作品を表示。
        </p>

        <PcolleRanking
          type="rankingRealtime"
          count={5}
          height={150}
          direction="horizontal"
        />
      </Shelf>

      {/* PCOLLE POPULAR */}
      <Shelf
        eyebrow="PCOLLE POPULAR"
        title="Pcolle 人気ランキング"
        href="/ranking"
      >
        <p className="shelfNote">
          Pcolleで人気の個人撮影作品をチェック。
        </p>

        <PcolleRanking
          type="ranking2week"
          count={5}
          height={150}
          direction="horizontal"
        />
      </Shelf>

      {/* PCOLLE NEW */}
      <Shelf
        eyebrow="PCOLLE NEW"
        title="Pcolle 新着"
        href="/new"
      >
        <p className="shelfNote">
          Pcolleで新しく公開された個人撮影作品をチェック。
        </p>

        <PcolleRanking
          type="new"
          count={5}
          height={150}
          direction="horizontal"
        />
      </Shelf>

      {/* FREE SAMPLE */}
      <Shelf
        eyebrow="FREE SAMPLE RANKING"
        title="無料サンプルランキング"
        href="/free"
      >
        <p className="shelfNote">
          公式サンプル動画がある個人撮影作品を、
          クリック実績を含むINDIE
          SCORE順にランキング。
        </p>

        <FreeSampleRanking limit={8} />
      </Shelf>

      {/* CREATOR RANKING */}
      <Shelf
        eyebrow="CREATOR RANKING"
        title="クリエイターランキング"
        href="/creators"
      >
        <p className="shelfNote">
          人気の個人クリエイターをランキング形式で紹介します。
        </p>

        <div className="creatorShelf">
          {creatorPreview.length ? (
            creatorPreview.map(
              (creator, index) => (
                <Link
                  href={`/creators/${creator.slug}`}
                  className="creatorMiniCard"
                  key={creator.id}
                >
                  <div className="creatorAvatar">
                    <span>
                      {creator.name
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                    <b>#{index + 1}</b>
                  </div>

                  <strong>
                    {creator.name}
                  </strong>

                  <small>
                    CREATOR
                  </small>

                  <span className="creatorCta">
                    プロフィールを見る →
                  </span>
                </Link>
              )
            )
          ) : (
            <div className="comingPanel">
              クリエイター情報を準備中です。
            </div>
          )}
        </div>
      </Shelf>

      {/* NEW RELEASES */}
      <Shelf
        eyebrow="NEW RELEASES"
        title="新着動画"
        href="/new"
      >
        <div className="horizontalShelf">
          {latest.map((work) => (
            <CompactWorkCard
              key={work.id}
              work={work}
              badge="NEW"
            />
          ))}
        </div>
      </Shelf>

      {/* NEW CREATORS */}
      <Shelf
        eyebrow="NEW FACES"
        title="新人クリエイター"
        href="/creators"
      >
        <div className="creatorShelf">
          {creatorPreview
            .slice()
            .reverse()
            .map((creator) => (
              <Link
                href={`/creators/${creator.slug}`}
                className="creatorMiniCard"
                key={`new-${creator.id}`}
              >
                <div className="creatorAvatar newCreatorAvatar">
                  <span>
                    {creator.name
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                </div>

                <strong>
                  {creator.name}
                </strong>

                <small>
                  NEW CREATOR
                </small>

                <span className="creatorCta">
                  チェックする →
                </span>
              </Link>
            ))}
        </div>
      </Shelf>

      {/* EXCLUSIVE */}
      <Shelf
        eyebrow="EXCLUSIVE"
        title="ここでしか見られない"
        href="/ranking"
      >
        <div className="futureShelf exclusiveFuture">
          <div className="futureShelfCopy">
            <span className="futureIcon">
              🔒
            </span>

            <div>
              <strong>
                限定・独占コンテンツをまとめて発見
              </strong>

              <p>
                個人販売・ファンクラブの限定作品を
                販売サイト横断で表示する予定です。
              </p>
            </div>
          </div>

          <span className="soonBadge">
            Pcolle / FC2 / myfans /
            Fantia
          </span>
        </div>
      </Shelf>

      {/* PLATFORM */}
      <section className="discoveryShelf wrap">
        <div className="discoveryShelfHead">
          <div>
            <p className="kicker">
              BY PLATFORM
            </p>
            <h2>サービス別</h2>
          </div>
        </div>

        <div className="platformGrid">
          {[
            [
              "Pcolle",
              "個人撮影",
              "連携中",
            ],
            [
              "FC2",
              "個人撮影",
              "連携中",
            ],
            [
              "myfans",
              "クリエイター",
              "審査中",
            ],
            [
              "Fantia",
              "ファンクラブ",
              "追加予定",
            ],
          ].map(
            ([name, type, status]) => (
              <div
                className="platformCard"
                key={name}
              >
                <small>{type}</small>
                <strong>{name}</strong>
                <span>{status}</span>
              </div>
            )
          )}
        </div>
      </section>

      {/* FANZA / COMMERCIAL */}
      <section className="commercialSection">
        <div className="wrap">
          <div className="discoveryShelfHead">
            <div>
              <p className="kicker">
                PRO / COMMERCIAL
              </p>
              <h2>
                同人・商業作品
              </h2>
            </div>

            <Link href="/ranking">
              もっと見る →
            </Link>
          </div>

          <p className="shelfNote">
            個人発信作品に加えて、
            FANZAなどの同人・商業作品も比較できます。
          </p>

          <div className="horizontalShelf">
            {ranking
              .slice(0, 6)
              .map((work) => (
                <CompactWorkCard
                  key={`pro-${work.id}`}
                  work={work}
                  badge={work.platform}
                />
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
