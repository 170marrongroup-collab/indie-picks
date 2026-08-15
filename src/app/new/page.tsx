import { WorkCard } from "@/components/WorkCard";
import { getLatestWorks } from "@/lib/supabase";

export default async function Page() {
  const works = await getLatestWorks(24);

  return (
    <main className="wrap page">
      <p className="kicker">INDIE PICKS</p>
      <h1>new</h1>
      <p className="lead">Supabaseに登録された最新作品を表示しています。</p>

      {works.length > 0 ? (
        <div className="grid">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      ) : (
        <p className="lead">新着作品を準備中です。</p>
      )}
    </main>
  );
}
