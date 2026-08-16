import Link from "next/link";
import { getCreators } from "@/lib/supabase";

export default async function CreatorsPage() {
  const creators = await getCreators();
  const ranked = creators.slice(0, 12);
  const newcomers = creators.slice().reverse().slice(0, 12);

  return (
    <main className="creatorHub">
      <section className="creatorHubHero">
        <div className="wrap">
          <p className="kicker">CREATOR DISCOVERY</p>
          <h1>個人クリエイターを見つける</h1>
          <p className="creatorHubLead">
            人気・新人・急上昇から、気になる個人クリエイターを発見。
            myfans・Fantiaなどのファンクラブ系サービスを横断して探せる場所へ。
          </p>

          <div className="creatorHubBadges">
            <span className="creatorPlatform pending">myfans</span>
            <span className="creatorPlatform pending">Fantia</span>
            <span className="creatorPlatform active">FANZA</span>
          </div>
        </div>
      </section>

      <section className="creatorHubSection wrap">
        <div className="creatorHubSectionHead">
          <div>
            <p className="kicker">CREATOR RANKING</p>
            <h2>クリエイターランキング</h2>
          </div>
        </div>

        <p className="creatorHubNote">
          人気の個人クリエイターをランキング形式で紹介します。
        </p>

        {ranked.length > 0 ? (
          <div className="creatorHubGrid">
            {ranked.map((creator, index) => (
              <article className="creatorHubCard" key={creator.id}>
                <Link href={`/creators/${creator.slug}`} className="creatorHubCardLink">
                  <div className="creatorHubAvatar">
                    <span>{creator.name.slice(0, 1).toUpperCase()}</span>
                    <b>#{index + 1}</b>
                  </div>

                  <div className="creatorHubCardBody">
                    <small className="creatorHubPlatform">CREATOR</small>
                    <h3>{creator.name}</h3>
                    <p>{creator.description ?? "プロフィール情報を準備中です。"}</p>

                    <div className="creatorHubTags">
                      <span>個人クリエイター</span>
                      <span>作品あり</span>
                    </div>

                    <span className="creatorHubCta">
                      プロフィールを見る →
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="creatorEmpty">
            <strong>クリエイター情報を準備中です。</strong>
            <p>myfans連携後、ここにランキングを表示します。</p>
          </div>
        )}
      </section>

      <section className="creatorHubSection creatorHubSoft">
        <div className="wrap">
          <div className="creatorHubSectionHead">
            <div>
              <p className="kicker">NEW FACES</p>
              <h2>新人クリエイター</h2>
            </div>
          </div>

          <div className="creatorHorizontal">
            {newcomers.map((creator) => (
              <Link
                href={`/creators/${creator.slug}`}
                className="creatorMiniProfile"
                key={`new-${creator.id}`}
              >
                <div className="creatorMiniAvatar">
                  {creator.name.slice(0, 1).toUpperCase()}
                </div>
                <small>NEW CREATOR</small>
                <strong>{creator.name}</strong>
                <span>プロフィールを見る →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="creatorHubSection wrap">
        <div className="creatorHubSectionHead">
          <div>
            <p className="kicker">FAN CLUB</p>
            <h2>ファンクラブから探す</h2>
          </div>
        </div>

        <div className="creatorPlatformGrid">
          <div className="creatorPlatformCard">
            <small>COMING SOON</small>
            <strong>myfans</strong>
            <p>
              審査通過後、参加クリエイターのプロフィールとアフィリエイト導線を掲載します。
            </p>
          </div>

          <div className="creatorPlatformCard">
            <small>COMING SOON</small>
            <strong>Fantia</strong>
            <p>
              ファンクラブ・限定コンテンツ系クリエイターを追加予定です。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
