import type { Metadata } from "next";
import { SeoWorkGrid } from "@/components/SeoWorkGrid";
import { getWorksByPeriod } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "今日の人気作品ランキング",
  description: "直近24時間の個人・同人作品をH-IT SCORE順に紹介。今日の注目作品を探せます。",
  alternates: { canonical: "https://h-item.net/ranking/daily" },
};

export default async function Page() {
  const works = await getWorksByPeriod(1, 60);

  return (
    <SeoWorkGrid
      kicker="DAILY RANKING"
      title="今日の人気作品ランキング"
      description="直近24時間に公開された作品を、H-IT SCORE順でチェックできます。"
      works={works}
    />
  );
}
