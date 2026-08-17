"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Genre = {
  id: string;
  name: string;
  slug: string;
  pcolle_category_id: number | null;
};

type WorkRow = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  affiliate_url: string | null;
  sample_url: string | null;
  price: number | null;
  score: number | string | null;
  source_rank: number | null;
  source_rank_type: string | null;
  is_active: boolean;
  genre_ids: string[];
  platforms: { name: string; slug: string } | { name: string; slug: string }[] | null;
  creators: { name: string } | { name: string }[] | null;
};

type Form = {
  platform: "Pcolle" | "FC2";
  affiliateHtml: string;
  playerHtml: string;
  externalId: string;
  title: string;
  creator: string;
  imageUrl: string;
  affiliateUrl: string;
  sampleUrl: string;
  price: string;
  sourceRank: string;
  sourceRankType: string;
  genreIds: string[];
};

const initialForm: Form = {
  platform: "Pcolle",
  affiliateHtml: "",
  playerHtml: "",
  externalId: "",
  title: "",
  creator: "",
  imageUrl: "",
  affiliateUrl: "",
  sampleUrl: "",
  price: "",
  sourceRank: "",
  sourceRankType: "manual",
  genreIds: [],
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function decodeHtml(text: string) {
  const area = document.createElement("textarea");
  area.innerHTML = text;
  return area.value;
}

function parsePcolle(html: string) {
  const doc = new DOMParser().parseFromString(decodeHtml(html), "text/html");
  const anchor = doc.querySelector("a");
  const img = doc.querySelector("img");
  const href = anchor?.getAttribute("href") ?? "";
  const absoluteHref = href.startsWith("//") ? `https:${href}` : href;
  const id =
    new URL(absoluteHref || "https://www.pcolle.com")
      .searchParams.get("product_id") ?? "";

  return {
    externalId: id,
    title:
      anchor?.getAttribute("title") ||
      img?.getAttribute("alt") ||
      "",
    imageUrl: img?.getAttribute("src") || "",
    affiliateUrl: absoluteHref,
    sampleUrl: "",
  };
}

function parseFc2(affiliateHtml: string, playerHtml: string) {
  const doc = new DOMParser().parseFromString(
    decodeHtml(affiliateHtml),
    "text/html"
  );
  const anchor = doc.querySelector("a");
  const img = doc.querySelector("img");
  const href = anchor?.getAttribute("href") ?? "";

  let sampleUrl = "";
  if (playerHtml.trim()) {
    const player = new DOMParser().parseFromString(
      decodeHtml(playerHtml),
      "text/html"
    );
    sampleUrl =
      player.querySelector("iframe")?.getAttribute("src") ?? "";
  }

  return {
    externalId: href.match(/\/article\/(\d+)/)?.[1] ?? "",
    title:
      anchor?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    imageUrl: img?.getAttribute("src") || "",
    affiliateUrl: href,
    sampleUrl,
  };
}

export default function AdminWorksPage() {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [works, setWorks] = useState<WorkRow[]>([]);
  const [form, setForm] = useState<Form>(initialForm);
  const [editing, setEditing] = useState<WorkRow | null>(null);
  const [status, setStatus] = useState("");

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function load() {
    const [worksRes, genresRes] = await Promise.all([
      fetch("/api/admin/works", { cache: "no-store" }),
      fetch("/api/admin/genres", { cache: "no-store" }),
    ]);

    if (worksRes.status === 401 || genresRes.status === 401) {
      router.push("/admin-login");
      return;
    }

    const worksBody = await worksRes.json();
    const genresBody = await genresRes.json();

    if (!worksRes.ok) throw new Error(worksBody.error || "作品取得失敗");
    if (!genresRes.ok) throw new Error(genresBody.error || "ジャンル取得失敗");

    setWorks(worksBody.works ?? []);
    setGenres(genresBody.genres ?? []);
  }

  useEffect(() => {
    load().catch((e) => setStatus(e.message));
  }, []);

  function toggleFormGenre(id: string) {
    set(
      "genreIds",
      form.genreIds.includes(id)
        ? form.genreIds.filter((x) => x !== id)
        : [...form.genreIds, id]
    );
  }

  function autoExtract() {
    try {
      const parsed =
        form.platform === "Pcolle"
          ? parsePcolle(form.affiliateHtml)
          : parseFc2(form.affiliateHtml, form.playerHtml);

      setForm((prev) => ({ ...prev, ...parsed }));
      setStatus("HTMLから商品情報を抽出しました。");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "抽出に失敗しました。"
      );
    }
  }

  async function register() {
    const response = await fetch("/api/admin/works", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: form.platform,
        externalId: form.externalId,
        title: form.title,
        creator: form.creator,
        imageUrl: form.imageUrl,
        affiliateUrl: form.affiliateUrl,
        sampleUrl: form.sampleUrl || null,
        price: form.price ? Number(form.price) : null,
        sourceRank: form.sourceRank ? Number(form.sourceRank) : null,
        sourceRankType: form.sourceRankType,
        genreIds: form.genreIds,
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      setStatus(body.error || "登録失敗");
      return;
    }

    setStatus(`登録しました：${body.title}`);
    setForm(initialForm);
    await load();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const response = await fetch(`/api/admin/works/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "更新失敗");
  }

  async function saveEdit() {
    if (!editing) return;

    await patch(editing.id, {
      title: editing.title,
      creator: one(editing.creators)?.name ?? "",
      imageUrl: editing.image_url,
      affiliateUrl: editing.affiliate_url,
      sampleUrl: editing.sample_url,
      price: editing.price,
      sourceRank: editing.source_rank,
      sourceRankType: editing.source_rank_type,
      score: Number(editing.score ?? 0),
      genreIds: editing.genre_ids,
    });

    setEditing(null);
    setStatus("更新しました。");
    await load();
  }

  async function toggleActive(work: WorkRow) {
    await patch(work.id, { isActive: !work.is_active });
    await load();
  }

  return (
    <main style={page}>
      <div style={wrap}>
        <div style={head}>
          <div>
            <p style={kicker}>INDIE PICKS ADMIN</p>
            <h1 style={{ margin: "7px 0 0" }}>作品管理</h1>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/admin/genres" style={button}>ジャンル管理</a>
            <a href="/admin/analytics" style={button}>アクセス解析</a>
          </div>
        </div>

        {status ? <p style={statusBox}>{status}</p> : null}

        <section style={section}>
          <h2 style={{ marginTop: 0 }}>新しい作品を登録</h2>

          <label style={label}>販売元</label>
          <select
            value={form.platform}
            onChange={(e) =>
              set("platform", e.target.value as "Pcolle" | "FC2")
            }
            style={input}
          >
            <option value="Pcolle">Pcolle</option>
            <option value="FC2">FC2</option>
          </select>

          <label style={label}>
            {form.platform === "Pcolle"
              ? "Pcolle画像リンクHTML"
              : "FC2紹介用画像リンクHTML"}
          </label>
          <textarea
            value={form.affiliateHtml}
            onChange={(e) => set("affiliateHtml", e.target.value)}
            style={{ ...input, minHeight: 120 }}
          />

          {form.platform === "FC2" ? (
            <>
              <label style={label}>FC2プレイヤー埋め込みコード</label>
              <textarea
                value={form.playerHtml}
                onChange={(e) => set("playerHtml", e.target.value)}
                style={{ ...input, minHeight: 80 }}
              />
            </>
          ) : null}

          <button onClick={autoExtract} style={button}>
            HTMLから自動入力
          </button>

          <div style={twoCols}>
            <Field
              labelText="商品ID"
              value={form.externalId}
              onChange={(v) => set("externalId", v)}
            />
            <Field
              labelText="販売者名"
              value={form.creator}
              onChange={(v) => set("creator", v)}
            />
          </div>

          <label style={label}>タイトル</label>
          <textarea
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            style={{ ...input, minHeight: 76 }}
          />

          <Field
            labelText="画像URL"
            value={form.imageUrl}
            onChange={(v) => set("imageUrl", v)}
          />
          <Field
            labelText="アフィリエイトURL"
            value={form.affiliateUrl}
            onChange={(v) => set("affiliateUrl", v)}
          />
          <Field
            labelText="サンプルURL"
            value={form.sampleUrl}
            onChange={(v) => set("sampleUrl", v)}
          />

          <div style={twoCols}>
            <Field
              labelText="価格 / pt"
              value={form.price}
              onChange={(v) => set("price", v)}
              type="number"
            />
            <Field
              labelText="販売元順位"
              value={form.sourceRank}
              onChange={(v) => set("sourceRank", v)}
              type="number"
            />
          </div>

          <label style={label}>ジャンル（複数選択可）</label>
          <div style={genreGrid}>
            {genres.map((genre) => (
              <label key={genre.id} style={genreChoice}>
                <input
                  type="checkbox"
                  checked={form.genreIds.includes(genre.id)}
                  onChange={() => toggleFormGenre(genre.id)}
                />
                <span>{genre.name}</span>
              </label>
            ))}
          </div>

          <button
            onClick={register}
            disabled={
              !form.externalId ||
              !form.title ||
              !form.imageUrl ||
              !form.affiliateUrl
            }
            style={buttonPink}
          >
            この作品を登録する
          </button>
        </section>

        <section style={section}>
          <div style={head}>
            <div>
              <h2 style={{ margin: 0 }}>登録済み作品</h2>
              <small style={{ color: "#777" }}>{works.length}件</small>
            </div>
            <button onClick={() => load()} style={button}>再読み込み</button>
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
            {works.map((work) => {
              const selected = genres
                .filter((g) => work.genre_ids.includes(g.id))
                .map((g) => g.name);

              return (
                <div key={work.id} style={workRow}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={workTitle}>{work.title}</strong>
                    <div style={tagWrap}>
                      {(selected.length ? selected : ["ジャンル未設定"]).map(
                        (name) => (
                          <span key={name} style={tag}>{name}</span>
                        )
                      )}
                    </div>
                  </div>

                  <div style={actions}>
                    <a
                      href={`/work/${work.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={button}
                    >
                      表示
                    </a>
                    <button onClick={() => setEditing(work)} style={button}>
                      編集
                    </button>
                    <button
                      onClick={() => toggleActive(work)}
                      style={button}
                    >
                      {work.is_active ? "非表示" : "再公開"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {editing ? (
          <div style={overlay}>
            <div style={modal}>
              <div style={head}>
                <h2 style={{ margin: 0 }}>作品を編集</h2>
                <button onClick={() => setEditing(null)} style={button}>
                  閉じる
                </button>
              </div>

              <label style={label}>タイトル</label>
              <textarea
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                style={{ ...input, minHeight: 76 }}
              />

              <label style={label}>ジャンル</label>
              <div style={genreGrid}>
                {genres.map((genre) => {
                  const checked = editing.genre_ids.includes(genre.id);

                  return (
                    <label key={genre.id} style={genreChoice}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setEditing({
                            ...editing,
                            genre_ids: checked
                              ? editing.genre_ids.filter(
                                  (id) => id !== genre.id
                                )
                              : [...editing.genre_ids, genre.id],
                          })
                        }
                      />
                      <span>{genre.name}</span>
                    </label>
                  );
                })}
              </div>

              <button onClick={saveEdit} style={buttonPink}>
                保存する
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Field({
  labelText,
  value,
  onChange,
  type = "text",
}: {
  labelText: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label style={label}>{labelText}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      />
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: "#0c0c10",
  color: "#fff",
  padding: "32px 16px 80px",
} as const;

const wrap = {
  width: "min(1100px,100%)",
  margin: "0 auto",
} as const;

const head = {
  display: "flex",
  justifyContent: "space-between",
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
  border: "1px solid #292932",
  background: "#141419",
  borderRadius: 16,
  padding: 20,
} as const;

const label = {
  display: "block",
  color: "#999",
  fontSize: 10,
  fontWeight: 800,
  margin: "13px 0 6px",
} as const;

const input = {
  width: "100%",
  background: "#0d0d11",
  color: "#fff",
  border: "1px solid #303039",
  borderRadius: 9,
  padding: "11px 12px",
  fontSize: 12,
} as const;

const button = {
  display: "inline-block",
  border: "1px solid #353540",
  background: "#1b1b21",
  color: "#ddd",
  borderRadius: 8,
  padding: "9px 11px",
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

const twoCols = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 12,
} as const;

const genreGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
} as const;

const genreChoice = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  border: "1px solid #34343d",
  background: "#101014",
  borderRadius: 999,
  padding: "8px 11px",
  fontSize: 11,
  cursor: "pointer",
} as const;

const statusBox = {
  marginTop: 14,
  border: "1px solid #34343d",
  borderRadius: 10,
  padding: 10,
  color: "#bbb",
  fontSize: 12,
} as const;

const workRow = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) auto",
  gap: 12,
  alignItems: "center",
  border: "1px solid #292932",
  borderRadius: 12,
  padding: 12,
} as const;

const workTitle = {
  display: "block",
  fontSize: 13,
  lineHeight: 1.45,
} as const;

const tagWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: 5,
  marginTop: 8,
} as const;

const tag = {
  border: "1px solid #34343d",
  borderRadius: 999,
  color: "#999",
  padding: "4px 7px",
  fontSize: 9,
} as const;

const actions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  justifyContent: "flex-end",
} as const;

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.75)",
  zIndex: 100,
  display: "grid",
  placeItems: "center",
  padding: 18,
} as const;

const modal = {
  width: "min(680px,100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#141419",
  border: "1px solid #33333d",
  borderRadius: 16,
  padding: 20,
} as const;
