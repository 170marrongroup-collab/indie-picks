import type { Metadata } from "next";
import { SeoWorkGrid } from "@/components/SeoWorkGrid";
import { getWorksByMaxPrice } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "500円以下の人気作品",
  description: "500円以下で楽しめる個人・同人作品をH-IT SCORE順に紹介。低価格の人気作品を探せます。",
  alternates: { canonical: "https://h-item.net/price/under-500" },
};

export default async function Page() {
  const works = await getWorksByMaxPrice(500, 60);

  return (
    <SeoWorkGrid
      kicker="UNDER ¥500"
      title="500円以下の人気作品"
      description="500円以下で購入できる作品を、H-IT SCORE順で探せます。"
      works={works}
    />
  );
}
