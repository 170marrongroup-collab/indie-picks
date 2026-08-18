import Link from "next/link";
import { WorkCard } from "@/components/WorkCard";
import type { Work } from "@/lib/supabase";

type Props = {
  kicker: string;
  title: string;
  description: string;
  works: Work[];
  emptyText?: string;
};

export function SeoWorkGrid({
  kicker,
  title,
  description,
  works,
  emptyText = "対象作品を準備中です。",
}: Props) {
  return (
    <main className="wrap page">
      <nav className="seo-quick-nav" aria-label="条件から作品を探す">
        <Link href="/ranking/daily">日間</Link>
        <Link href="/ranking/weekly">週間</Link>
        <Link href="/ranking/monthly">月間</Link>
        <Link href="/price/under-500">500円以下</Link>
        <Link href="/price/under-1000">1000円以下</Link>
        <Link href="/sample">サンプルあり</Link>
      </nav>

      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>

      {works.length > 0 ? (
        <div className="grid">
          {works.map((work, index) => (
            <WorkCard key={work.id} work={work} rank={index + 1} />
          ))}
        </div>
      ) : (
        <p className="lead">{emptyText}</p>
      )}
    </main>
  );
}
