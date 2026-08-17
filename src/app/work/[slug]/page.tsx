import Image from "next/image";
import { notFound } from "next/navigation";
import { TrackedLink } from "@/components/TrackedLink";
import { getWorkBySlug } from "@/lib/supabase";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);

  if (!work) notFound();

  return (
    <main className="wrap page">
      <p className="kicker">WORK DETAIL</p>

      <div className="detail">
        <div className={`detailVisual ${work.imageUrl ? "hasImage" : ""}`}>
          {work.imageUrl ? (
            <Image
              src={work.imageUrl}
              alt={work.title}
              fill
              sizes="(max-width: 800px) 100vw, 45vw"
              className="detailImage"
              priority
            />
          ) : (
            <>
              <b>{work.score}</b>
              <span>INDIE SCORE</span>
            </>
          )}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "6px 8px",
                borderRadius: 999,
                background: "rgba(255,92,122,.13)",
                border: "1px solid rgba(255,92,122,.35)",
              }}
            >
              {work.platform}
            </span>

            {work.isIndie && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "6px 8px",
                  borderRadius: 999,
                  border: "1px solid #33333c",
                  color: "#aaa",
                }}
              >
                個人撮影
              </span>
            )}

            {work.sampleUrl && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "6px 8px",
                  borderRadius: 999,
                  border: "1px solid #33333c",
                  color: "#aaa",
                }}
              >
                サンプルあり
              </span>
            )}
          </div>

          <p className="eyebrow">
            {work.creator} / {work.tag}
          </p>

          <h1>{work.title}</h1>
          <p className="lead">{work.note}</p>

          <div className="scoreBox">
            <div>
              <small>INDIE SCORE</small>
              <strong>{work.score}</strong>
            </div>
          </div>

          {work.affiliateUrl ? (
            <TrackedLink
              workId={work.id}
              source="affiliate"
              href={work.affiliateUrl}
              className="primary"
              external
            >
              販売ページで続きを見る
            </TrackedLink>
          ) : (
            <button className="primary disabled" disabled>
              販売ページ準備中
            </button>
          )}

          <p className="notice">
            ※ INDIE SCOREは新着度・販売元情報・サイト内人気などから算出する独自指標です。
          </p>
        </div>
      </div>

      {work.sampleUrl && (
        <section
          style={{
            marginTop: 48,
            paddingTop: 32,
            borderTop: "1px solid #2a2a33",
          }}
        >
          <p className="kicker">FREE PREVIEW</p>
          <h2 style={{ fontSize: 28, margin: "7px 0 8px" }}>
            公式サンプル動画
          </h2>
          <p
            style={{
              color: "#85858f",
              fontSize: 12,
              lineHeight: 1.7,
              marginBottom: 18,
            }}
          >
            販売元が提供する公式プレイヤーを表示しています。
          </p>

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 860,
              aspectRatio: "16 / 9",
              background: "#000",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #2a2a33",
            }}
          >
            <iframe
              src={work.sampleUrl}
              title={`${work.title} サンプル動画`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>

          {work.affiliateUrl && (
            <div style={{ marginTop: 18 }}>
              <TrackedLink
                workId={work.id}
                source="affiliate"
                href={work.affiliateUrl}
                className="primary"
                external
              >
                続きを販売ページで見る
              </TrackedLink>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
