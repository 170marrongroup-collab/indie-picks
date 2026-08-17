import { WorkCard } from "@/components/WorkCard";
import { getTopWorks } from "@/lib/supabase";

export default async function Page() {
  const works = await getTopWorks(10);

  return (
    <main className="wrap page">
      <p className="kicker">H-IT</p>
      <h1>ranking</h1>
      <p className="lead">Supabaseのランキングデータを表示しています。</p>

      {works.length > 0 ? (
        <div className="grid">
          {works.map((work, index) => (
            <WorkCard key={work.id} work={work} rank={index + 1} />
          ))}
        </div>
      ) : (
        <p className="lead">ランキング対象の作品を準備中です。</p>
      )}
    </main>
  );
}
