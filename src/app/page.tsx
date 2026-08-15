import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import { getTopWorks } from "@/lib/supabase";

export default async function Home() {
  const works = await getTopWorks(3);

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <p className="kicker">DISCOVER SOMETHING NEW</p>
          <h1>
            個人作品を、
            <br />
            <em>もっと見つけやすく。</em>
          </h1>
          <p className="lead">
            ランキング、新着、ジャンル、クリエイター。大量の作品から「今見るべき作品」を探すための発見メディア。
          </p>
          <div className="heroActions">
            <Link className="primary" href="/ranking">
              今日のランキングを見る
            </Link>
            <Link className="secondary" href="/new">
              新着を見る
            </Link>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="sectionHead">
          <div>
            <p className="kicker">TRENDING NOW</p>
            <h2>今日の注目作品</h2>
          </div>
          <Link href="/ranking">TOP10を見る →</Link>
        </div>

        {works.length > 0 ? (
          <div className="grid">
            {works.map((work, index) => (
              <WorkCard key={work.id} work={work} rank={index + 1} />
            ))}
          </div>
        ) : (
          <p className="lead">作品データを準備中です。Supabaseに作品を追加するとここに表示されます。</p>
        )}
      </section>

      <section className="section soft">
        <div className="wrap">
          <div className="sectionHead">
            <div>
              <p className="kicker">DISCOVER</p>
              <h2>目的から探す</h2>
            </div>
          </div>
          <div className="categoryGrid">
            {["今日の新着", "急上昇", "価格から探す", "クリエイターから探す"].map(
              (label, index) => (
                <Link
                  key={label}
                  href={index === 0 ? "/new" : index === 3 ? "/creators" : "/genres"}
                  className="category"
                >
                  <small>0{index + 1}</small>
                  <strong>{label}</strong>
                  <span>→</span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
