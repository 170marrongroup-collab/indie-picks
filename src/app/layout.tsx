import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

const siteUrl = "https://h-item.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "H-IT（えっちいっと）| 個人・同人作品の発見メディア",
    template: "%s | H-IT",
  },
  description:
    "H-IT（H-ITEM TREND／えっちいっと）は、個人・同人作品をランキング、新着、ジャンル、クリエイターから探せる大人向け発見メディアです。",
  applicationName: "H-IT",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "H-IT | H-ITEM TREND",
    title: "H-IT（えっちいっと）| 個人・同人作品の発見メディア",
    description:
      "個人作品・同人AV・クリエイターを横断して、今見たい作品を見つける大人向け発見メディア。",
  },
  twitter: {
    card: "summary_large_image",
    title: "H-IT（えっちいっと）| H-ITEM TREND",
    description: "個人作品を、もっと見つけやすく。",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <footer>
          <div className="wrap">
            18歳以上向けコンテンツを扱うメディアです。掲載・広告表記・権利処理は各サービス規約に準拠して運営します。
            <br />
            © 2026 H-IT / H-ITEM TREND
          </div>
        </footer>
      </body>
    </html>
  );
}
