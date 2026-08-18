import type { Metadata } from "next";
import { SeoWorkGrid } from "@/components/SeoWorkGrid";
import { getWorksByPeriod } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "週間人気作品ランキング",
  description: "直近7日間の個人・同人作品をH-IT SCORE順に紹介。今週の注目作品を探せます。",
  alternates: { canonical: "https://h-item.net/ranking/weekly" },
};

export default async function Page() {
  const works = await getWorksByPeriod(7, 60);

  return (
    <SeoWorkGrid
      kicker="WEEKLY RANKING"
      title="週間人気作品ランキング"
      description="直近7日間に公開された作品を、H-IT SCORE順でチェックできます。"
      works={works}
    />
  );
}
