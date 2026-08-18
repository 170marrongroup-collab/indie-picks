import type { Metadata } from "next";
import { SeoWorkGrid } from "@/components/SeoWorkGrid";
import { getWorksByMaxPrice } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "1000円以下の人気作品",
  description: "1000円以下で楽しめる個人・同人作品をH-IT SCORE順に紹介。価格から作品を探せます。",
  alternates: { canonical: "https://h-item.net/price/under-1000" },
};

export default async function Page() {
  const works = await getWorksByMaxPrice(1000, 60);

  return (
    <SeoWorkGrid
      kicker="UNDER ¥1000"
      title="1000円以下の人気作品"
      description="1000円以下で購入できる作品を、H-IT SCORE順で探せます。"
      works={works}
    />
  );
}
