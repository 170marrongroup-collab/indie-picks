"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Analytics = {
  generatedAt: string;
  totals: {
    detail7: number;
    affiliate7: number;
    detail30: number;
    affiliate30: number;
    ctr7: number;
    ctr30: number;
  };
  platforms: {
    platform: string;
    works: number;
    detail30: number;
    affiliate30: number;
    ctr30: number;
  }[];
  daily: {
    date: string;
    detail: number;
    affiliate: number;
  }[];
  works: {
    id: string;
    slug: string;
    title: string;
    score: number;
    imageUrl: string | null;
    isActive: boolean;
    platform: string;
    detail7: number;
    affiliate7: number;
    detail30: number;
    affiliate30: number;
    ctr7: number;
    ctr30: number;
  }[];
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(
        "/api/admin/analytics",
        { cache: "no-store" }
      );

      const body = await response.json();

      if (response.status === 401) {
        router.push("/admin-login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          body.error ||
            "アクセス解析の取得に失敗しました。"
        );
      }

      setData(body);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "取得に失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const maxDaily = useMemo(() => {
    if (!data) return 1;
    return Math.max(
      1,
      ...data.daily.map(
        (d) => d.detail + d.affiliate
      )
    );
  }, [data]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={wrapStyle}>
          読み込み中...
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={wrapStyle}>
        <div style={topBar}>
          <div>
            <p style={kicker}>
              INDIE PICKS ADMIN
            </p>
            <h1 style={{ margin: "7px 0 0" }}>
              アクセス解析
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <a
              href="/admin/works"
              style={buttonDark}
            >
              作品管理
            </a>

            <button
              onClick={load}
              style={buttonPink}
            >
              再読み込み
            </button>
          </div>
        </div>

        {status && (
          <div style={statusBox}>
            {status}
          </div>
        )}

        {data && (
          <>
            <section style={summaryGrid}>
              <MetricCard
                label="7日 詳細クリック"
                value={data.totals.detail7}
              />
              <MetricCard
                label="7日 販売ページ"
                value={data.totals.affiliate7}
              />
              <MetricCard
                label="7日 CTR"
                value={`${data.totals.ctr7}%`}
              />
              <MetricCard
                label="30日 販売ページ"
                value={data.totals.affiliate30}
              />
            </section>

            <section style={sectionStyle}>
              <div style={sectionHead}>
                <div>
                  <p style={kicker}>
                    LAST 14 DAYS
                  </p>
                  <h2 style={sectionTitle}>
                    クリック推移
                  </h2>
                </div>
              </div>

              <div style={chartWrap}>
                {data.daily.map((day) => {
                  const total =
                    day.detail + day.affiliate;

                  const height =
                    Math.max(
                      4,
                      (total / maxDaily) * 150
                    );

                  const affiliateHeight =
                    total > 0
                      ? (day.affiliate /
                          total) *
                        height
                      : 0;

                  return (
                    <div
                      key={day.date}
                      style={barColumn}
                      title={`${day.date} 詳細:${day.detail} 販売:${day.affiliate}`}
                    >
                      <div
                        style={{
                          ...barStack,
                          height,
                        }}
                      >
                        <div
                          style={{
                            height:
                              height -
                              affiliateHeight,
                            background:
                              "#34343d",
                            borderRadius:
                              "6px 6px 0 0",
                          }}
                        />
                        <div
                          style={{
                            height:
                              affiliateHeight,
                            background:
                              "#ff5c7a",
                            borderRadius:
                              "0 0 6px 6px",
                          }}
                        />
                      </div>

                      <span style={barDate}>
                        {day.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={legend}>
                <span>
                  <i
                    style={{
                      ...dot,
                      background:
                        "#34343d",
                    }}
                  />
                  詳細クリック
                </span>

                <span>
                  <i
                    style={{
                      ...dot,
                      background:
                        "#ff5c7a",
                    }}
                  />
                  販売ページ
                </span>
              </div>
            </section>

            <section style={sectionStyle}>
              <div style={sectionHead}>
                <div>
                  <p style={kicker}>
                    PLATFORM
                  </p>
                  <h2 style={sectionTitle}>
                    販売元別
                  </h2>
                </div>
              </div>

              <div style={platformGrid}>
                {data.platforms.map(
                  (platform) => (
                    <div
                      key={
                        platform.platform
                      }
                      style={platformCard}
                    >
                      <strong
                        style={{
                          fontSize: 18,
                        }}
                      >
                        {platform.platform}
                      </strong>

                      <small
                        style={{
                          color: "#777",
                          marginTop: 4,
                        }}
                      >
                        {platform.works}作品
                      </small>

                      <div
                        style={{
                          marginTop: 14,
                          display: "grid",
                          gap: 6,
                          fontSize: 11,
                        }}
                      >
                        <span>
                          詳細{" "}
                          <b>
                            {
                              platform.detail30
                            }
                          </b>
                        </span>

                        <span>
                          販売{" "}
                          <b>
                            {
                              platform.affiliate30
                            }
                          </b>
                        </span>

                        <span>
                          CTR{" "}
                          <b>
                            {platform.ctr30}%
                          </b>
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <section style={sectionStyle}>
              <div style={sectionHead}>
                <div>
                  <p style={kicker}>
                    TOP WORKS
                  </p>
                  <h2 style={sectionTitle}>
                    作品別アクセス
                  </h2>
                </div>

                <small
                  style={{ color: "#777" }}
                >
                  販売ページクリック順
                </small>
              </div>

              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>
                        作品
                      </th>
                      <th style={th}>
                        販売元
                      </th>
                      <th style={th}>
                        7日詳細
                      </th>
                      <th style={th}>
                        7日販売
                      </th>
                      <th style={th}>
                        7日CTR
                      </th>
                      <th style={th}>
                        30日詳細
                      </th>
                      <th style={th}>
                        30日販売
                      </th>
                      <th style={th}>
                        30日CTR
                      </th>
                      <th style={th}>
                        SCORE
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.works.map(
                      (work) => (
                        <tr key={work.id}>
                          <td style={td}>
                            <a
                              href={`/work/${work.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#fff",
                                fontWeight:
                                  700,
                              }}
                            >
                              {work.title}
                            </a>
                          </td>

                          <td style={td}>
                            {work.platform}
                          </td>

                          <td style={td}>
                            {work.detail7}
                          </td>

                          <td style={td}>
                            <b
                              style={{
                                color:
                                  "#ff8298",
                              }}
                            >
                              {
                                work.affiliate7
                              }
                            </b>
                          </td>

                          <td style={td}>
                            {work.ctr7}%
                          </td>

                          <td style={td}>
                            {work.detail30}
                          </td>

                          <td style={td}>
                            <b
                              style={{
                                color:
                                  "#ff8298",
                              }}
                            >
                              {
                                work.affiliate30
                              }
                            </b>
                          </td>

                          <td style={td}>
                            {work.ctr30}%
                          </td>

                          <td style={td}>
                            {work.score}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <p
              style={{
                color: "#666",
                fontSize: 10,
                lineHeight: 1.7,
                marginTop: 18,
              }}
            >
              CTR =
              販売ページクリック ÷
              詳細クリック。
              詳細クリックが0の場合は0%表示です。
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={metricCard}>
      <small
        style={{
          color: "#777",
          fontSize: 10,
        }}
      >
        {label}
      </small>

      <strong
        style={{
          display: "block",
          fontSize: 30,
          marginTop: 7,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#0c0c10",
  color: "#fff",
  padding: "32px 16px 80px",
} as const;

const wrapStyle = {
  width: "min(1160px,100%)",
  margin: "0 auto",
} as const;

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
} as const;

const kicker = {
  color: "#ff5c7a",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".16em",
  margin: 0,
} as const;

const summaryGrid = {
  marginTop: 24,
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(160px,1fr))",
  gap: 10,
} as const;

const metricCard = {
  border: "1px solid #292932",
  background: "#141419",
  borderRadius: 14,
  padding: 17,
} as const;

const sectionStyle = {
  marginTop: 20,
  border: "1px solid #292932",
  background: "#141419",
  borderRadius: 16,
  padding: 20,
} as const;

const sectionHead = {
  display: "flex",
  alignItems: "end",
  justifyContent: "space-between",
  gap: 14,
} as const;

const sectionTitle = {
  margin: "5px 0 0",
  fontSize: 21,
} as const;

const chartWrap = {
  marginTop: 24,
  height: 190,
  display: "grid",
  gridTemplateColumns:
    "repeat(14,minmax(28px,1fr))",
  gap: 7,
  alignItems: "end",
  overflowX: "auto",
} as const;

const barColumn = {
  minWidth: 28,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 7,
} as const;

const barStack = {
  width: "70%",
  minWidth: 16,
  overflow: "hidden",
  borderRadius: 6,
  display: "flex",
  flexDirection: "column",
} as const;

const barDate = {
  color: "#666",
  fontSize: 8,
  transform: "rotate(-45deg)",
  whiteSpace: "nowrap",
  marginBottom: 8,
} as const;

const legend = {
  display: "flex",
  gap: 18,
  flexWrap: "wrap",
  color: "#777",
  fontSize: 10,
  marginTop: 10,
} as const;

const dot = {
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: 2,
  marginRight: 5,
} as const;

const platformGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(160px,1fr))",
  gap: 10,
  marginTop: 18,
} as const;

const platformCard = {
  border: "1px solid #292932",
  background: "#101014",
  borderRadius: 12,
  padding: 16,
  display: "flex",
  flexDirection: "column",
} as const;

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 16,
  minWidth: 850,
} as const;

const th = {
  textAlign: "left",
  fontSize: 9,
  color: "#777",
  fontWeight: 800,
  borderBottom: "1px solid #2c2c35",
  padding: "10px 9px",
  whiteSpace: "nowrap",
} as const;

const td = {
  fontSize: 11,
  color: "#aaa",
  borderBottom: "1px solid #222229",
  padding: "11px 9px",
  verticalAlign: "middle",
} as const;

const buttonDark = {
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
  border: 0,
  background: "#ff5c7a",
  color: "#fff",
  borderRadius: 8,
  padding: "9px 11px",
  fontSize: 10,
  fontWeight: 900,
  cursor: "pointer",
} as const;

const statusBox = {
  marginTop: 16,
  padding: 12,
  border: "1px solid #34343d",
  borderRadius: 10,
  color: "#bbb",
  fontSize: 12,
} as const;
