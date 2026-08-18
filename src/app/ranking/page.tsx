import type { Metadata } from "next";
import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import { getTopWorks } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "人気作品ランキング",
  description:
    "H-ITの人気作品ランキング。日間・週間・月間、価格帯、サンプルあり作品から探せます。",
  alternates: { canonical: "https://h-item.net/ranking" },
};

const menus = [
  { href: "/ranking/daily", label: "日間ランキング", sub: "直近24時間の注目作品" },
  { href: "/ranking/weekly", label: "週間ランキング", sub: "直近7日間の人気作品" },
  { href: "/ranking/monthly", label: "月間ランキング", sub: "直近30日間の人気作品" },
  { href: "/price/under-500", label: "500円以下", sub: "低価格の人気作品" },
  { href: "/price/under-1000", label: "1000円以下", sub: "価格で選ぶ人気作品" },
  { href: "/sample", label: "サンプルあり", sub: "公式サンプルがある作品" },
];

export default async function Page() {
  const works = await getTopWorks(12);

  return (
    <main className="wrap page">
      <p className="kicker">H-IT RANKING</p>
      <h1>人気作品ランキング</h1>
      <p className="lead">
        期間・価格・サンプルの有無から、気になる作品を探せます。
      </p>

      <div className="ranking-menu-grid">
        {menus.map((item) => (
          <Link key={item.href} href={item.href} className="ranking-menu-card">
            <strong>{item.label}</strong>
            <span>{item.sub} →</span>
          </Link>
        ))}
      </div>

      <section className="seo-ranking-section">
        <p className="kicker">H-IT SCORE</p>
        <h2>現在の総合ランキング</h2>

        {works.length > 0 ? (
          <div className="grid">
            {works.map((work, index) => (
              <WorkCard key={work.id} work={work} rank={index + 1} />
            ))}
          </div>
        ) : (
          <p className="lead">ランキング対象の作品を準備中です。</p>
        )}
      </section>
    </main>
  );
}
