"use client";

import {
  useEffect,
  useState,
} from "react";

type Genre = {
  id: string;
  name: string;
  slug: string;
  pcolle_category_id:
    | number
    | null;
  is_featured: boolean;
  featured_description:
    | string
    | null;
};

export default function AdminGenresPage() {
  const [genres, setGenres] =
    useState<Genre[]>([]);

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [
    categoryId,
    setCategoryId,
  ] = useState("");

  const [
    featuredGenreId,
    setFeaturedGenreId,
  ] = useState("");

  const [
    featuredDescription,
    setFeaturedDescription,
  ] = useState("");

  const [status, setStatus] =
    useState("");

  async function load() {
    const response =
      await fetch(
        "/api/admin/genres",
        {
          cache: "no-store",
        }
      );

    const body =
      await response.json();

    if (!response.ok) {
      throw new Error(
        body.error ||
          "取得失敗"
      );
    }

    const list:
      Genre[] =
      body.genres ?? [];

    setGenres(list);

    const current =
      list.find(
        (genre) =>
          genre.is_featured
      );

    if (current) {
      setFeaturedGenreId(
        current.id
      );

      setFeaturedDescription(
        current.featured_description ??
          ""
      );
    }
  }

  useEffect(() => {
    load().catch((error) =>
      setStatus(
        error instanceof Error
          ? error.message
          : "取得失敗"
      )
    );
  }, []);

  async function addGenre() {
    const response =
      await fetch(
        "/api/admin/genres",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            pcolleCategoryId:
              categoryId ||
              null,
          }),
        }
      );

    const body =
      await response.json();

    if (!response.ok) {
      setStatus(
        body.error ||
          "登録失敗"
      );
      return;
    }

    setName("");
    setSlug("");
    setCategoryId("");

    setStatus(
      "ジャンルを登録しました。"
    );

    await load();
  }

  async function saveFeatured() {
    if (!featuredGenreId) {
      setStatus(
        "トップに表示するジャンルを選んでください。"
      );
      return;
    }

    const response =
      await fetch(
        `/api/admin/genres/${featuredGenreId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isFeatured: true,
            featuredDescription:
              featuredDescription ||
              null,
          }),
        }
      );

    const body =
      await response.json();

    if (!response.ok) {
      setStatus(
        body.error ||
          "更新失敗"
      );
      return;
    }

    setStatus(
      "トップのおすすめジャンルを更新しました。"
    );

    await load();
  }

  async function saveCategory(
    genre: Genre,
    value: string
  ) {
    const response =
      await fetch(
        `/api/admin/genres/${genre.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            pcolleCategoryId:
              value || null,
          }),
        }
      );

    const body =
      await response.json();

    if (!response.ok) {
      setStatus(
        body.error ||
          "更新失敗"
      );
      return;
    }

    setStatus(
      `${genre.name} のPcolleカテゴリを更新しました。`
    );

    await load();
  }

  function changeFeaturedGenre(
    id: string
  ) {
    setFeaturedGenreId(id);

    const genre =
      genres.find(
        (item) =>
          item.id === id
      );

    setFeaturedDescription(
      genre?.featured_description ??
        ""
    );
  }

  return (
    <main style={page}>
      <div style={wrap}>
        <div style={head}>
          <div>
            <p style={kicker}>
              INDIE PICKS ADMIN
            </p>

            <h1
              style={{
                margin:
                  "7px 0 0",
              }}
            >
              ジャンル管理
            </h1>
          </div>

          <a
            href="/admin/works"
            style={button}
          >
            作品管理
          </a>
        </div>

        {status ? (
          <p style={statusStyle}>
            {status}
          </p>
        ) : null}

        <section style={featuredSection}>
          <p style={kicker}>
            TOP RECOMMEND
          </p>

          <h2
            style={{
              margin:
                "7px 0 4px",
            }}
          >
            今、オススメのジャンル
          </h2>

          <p style={helpText}>
            ここで選んだジャンルが、
            トップページの
            「今、オススメのジャンルランキング」
            に表示されます。
          </p>

          <label style={label}>
            トップに表示するジャンル
          </label>

          <select
            value={
              featuredGenreId
            }
            onChange={(e) =>
              changeFeaturedGenre(
                e.target.value
              )
            }
            style={input}
          >
            <option value="">
              選択してください
            </option>

            {genres.map(
              (genre) => (
                <option
                  key={genre.id}
                  value={genre.id}
                >
                  {genre.name}
                </option>
              )
            )}
          </select>

          <label style={label}>
            おすすめ紹介文
          </label>

          <textarea
            value={
              featuredDescription
            }
            onChange={(e) =>
              setFeaturedDescription(
                e.target.value
              )
            }
            placeholder="例：羞恥・診察シチュエーションなど、今チェックしたい個撮作品をピックアップ。"
            style={{
              ...input,
              minHeight: 90,
            }}
          />

          <button
            onClick={saveFeatured}
            style={buttonPink}
          >
            トップのおすすめを保存
          </button>

          {featuredGenreId ? (
            <div
              style={
                previewCard
              }
            >
              <small
                style={{
                  color:
                    "#ff5c7a",
                  fontWeight:
                    900,
                }}
              >
                トップ表示イメージ
              </small>

              <strong
                style={{
                  display:
                    "block",
                  fontSize: 20,
                  marginTop: 6,
                }}
              >
                {
                  genres.find(
                    (g) =>
                      g.id ===
                      featuredGenreId
                  )?.name
                }
              </strong>

              <p
                style={{
                  color:
                    "#999",
                  fontSize: 11,
                  lineHeight: 1.7,
                  marginBottom: 0,
                }}
              >
                {featuredDescription ||
                  "おすすめ紹介文がここに表示されます。"}
              </p>
            </div>
          ) : null}
        </section>

        <section style={section}>
          <h2
            style={{
              marginTop: 0,
            }}
          >
            ジャンルを追加
          </h2>

          <label style={label}>
            ジャンル名
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="例：コスプレ"
            style={input}
          />

          <label style={label}>
            slug（英数字）
          </label>

          <input
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
              )
            }
            placeholder="例：cosplay"
            style={input}
          />

          <label style={label}>
            Pcolleカテゴリ番号
          </label>

          <input
            type="number"
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value
              )
            }
            placeholder="不明なら空欄"
            style={input}
          />

          <button
            onClick={addGenre}
            style={buttonPink}
          >
            ジャンルを登録
          </button>
        </section>

        <section style={section}>
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Pcolleカテゴリ紐付け
          </h2>

          <p style={helpText}>
            PcolleのカテゴリURLにある
            c= の数字を入力します。
          </p>

          <div
            style={{
              display: "grid",
              gap: 10,
              marginTop: 18,
            }}
          >
            {genres.map(
              (genre) => (
                <GenreRow
                  key={genre.id}
                  genre={genre}
                  onSave={
                    saveCategory
                  }
                />
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function GenreRow({
  genre,
  onSave,
}: {
  genre: Genre;
  onSave: (
    genre: Genre,
    value: string
  ) => Promise<void>;
}) {
  const [value, setValue] =
    useState(
      genre.pcolle_category_id?.toString() ??
        ""
    );

  useEffect(() => {
    setValue(
      genre.pcolle_category_id?.toString() ??
        ""
    );
  }, [
    genre.pcolle_category_id,
  ]);

  return (
    <div style={row}>
      <div>
        <strong>
          {genre.name}
        </strong>

        {genre.is_featured ? (
          <span
            style={{
              display:
                "inline-block",
              marginLeft: 7,
              color:
                "#ff7590",
              fontSize: 9,
              fontWeight:
                900,
            }}
          >
            TOP
          </span>
        ) : null}

        <small
          style={{
            display: "block",
            color: "#777",
            marginTop: 4,
          }}
        >
          /genres/{genre.slug}
        </small>
      </div>

      <input
        type="number"
        value={value}
        onChange={(e) =>
          setValue(
            e.target.value
          )
        }
        placeholder="未設定"
        style={input}
      />

      <button
        onClick={() =>
          onSave(
            genre,
            value
          )
        }
        style={button}
      >
        保存
      </button>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: "#0c0c10",
  color: "#fff",
  padding:
    "32px 16px 80px",
} as const;

const wrap = {
  width: "min(900px,100%)",
  margin: "0 auto",
} as const;

const head = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 12,
} as const;

const kicker = {
  color: "#ff5c7a",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".16em",
  margin: 0,
} as const;

const section = {
  marginTop: 20,
  border:
    "1px solid #292932",
  background: "#141419",
  borderRadius: 16,
  padding: 20,
} as const;

const featuredSection = {
  ...section,
  border:
    "1px solid #4a2832",
  background:
    "linear-gradient(180deg,#1b1317,#141419)",
} as const;

const label = {
  display: "block",
  color: "#999",
  fontSize: 10,
  fontWeight: 800,
  margin:
    "13px 0 6px",
} as const;

const input = {
  width: "100%",
  background: "#0d0d11",
  color: "#fff",
  border:
    "1px solid #303039",
  borderRadius: 9,
  padding:
    "11px 12px",
  fontSize: 12,
} as const;

const button = {
  display:
    "inline-block",
  border:
    "1px solid #353540",
  background: "#1b1b21",
  color: "#ddd",
  borderRadius: 8,
  padding:
    "9px 11px",
  fontSize: 10,
  fontWeight: 800,
  cursor: "pointer",
} as const;

const buttonPink = {
  ...button,
  background: "#ff5c7a",
  borderColor: "#ff5c7a",
  color: "#fff",
  marginTop: 18,
} as const;

const statusStyle = {
  marginTop: 14,
  border:
    "1px solid #34343d",
  borderRadius: 10,
  padding: 10,
  color: "#bbb",
  fontSize: 12,
} as const;

const helpText = {
  color: "#777",
  fontSize: 11,
  lineHeight: 1.7,
} as const;

const previewCard = {
  marginTop: 18,
  border:
    "1px solid #392c31",
  background: "#0e0e12",
  borderRadius: 12,
  padding: 15,
} as const;

const row = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0,1fr) 140px auto",
  gap: 10,
  alignItems: "center",
  border:
    "1px solid #292932",
  borderRadius: 10,
  padding: 12,
} as const;
