import { getCreators } from "@/lib/supabase";

export default async function Page() {
  const creators = await getCreators();

  return (
    <main className="wrap page">
      <p className="kicker">INDIE PICKS</p>
      <h1>creators</h1>
      <p className="lead">登録クリエイターから作品を探せます。</p>

      <div className="categoryGrid">
        {creators.map((creator, index) => (
          <div key={creator.id} className="category">
            <small>{String(index + 1).padStart(2, "0")}</small>
            <strong>{creator.name}</strong>
            <span>{creator.description ?? "作品を準備中"}</span>
          </div>
        ))}
      </div>

      {creators.length === 0 && (
        <p className="lead">クリエイター情報を準備中です。</p>
      )}
    </main>
  );
}
