import type { Metadata } from "next";
import { SeoWorkGrid } from "@/components/SeoWorkGrid";
import { getWorksByPeriod } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "月間人気作品ランキング",
  description: "直近30日間の個人・同人作品をH-IT SCORE順に紹介。今月の人気作品を探せます。",
  alternates: { canonical: "https://h-item.net/ranking/monthly" },
};

export default async function Page() {
  const works = await getWorksByPeriod(30, 60);

  return (
    <SeoWorkGrid
      kicker="MONTHLY RANKING"
      title="月間人気作品ランキング"
      description="直近30日間に公開された作品を、H-IT SCORE順でチェックできます。"
      works={works}
    />
  );
}
