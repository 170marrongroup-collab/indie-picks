import { getGenres } from "@/lib/supabase";

export default async function Page() {
  const genres = await getGenres();

  return (
    <main className="wrap page">
      <p className="kicker">INDIE PICKS</p>
      <h1>genres</h1>
      <p className="lead">登録ジャンルから作品を探せます。</p>

      <div className="categoryGrid">
        {genres.map((genre, index) => (
          <div key={genre.id} className="category">
            <small>{String(index + 1).padStart(2, "0")}</small>
            <strong>{genre.name}</strong>
            <span>→</span>
          </div>
        ))}
      </div>

      {genres.length === 0 && <p className="lead">ジャンル情報を準備中です。</p>}
    </main>
  );
}
