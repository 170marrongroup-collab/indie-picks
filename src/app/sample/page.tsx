import type { Metadata } from "next";
import { SeoWorkGrid } from "@/components/SeoWorkGrid";
import { getSampleWorks } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "サンプルありの人気作品",
  description: "公式サンプルがある個人・同人作品をH-IT SCORE順に紹介。購入前に確認しやすい作品を探せます。",
  alternates: { canonical: "https://h-item.net/sample" },
};

export default async function Page() {
  const works = await getSampleWorks(60);

  return (
    <SeoWorkGrid
      kicker="SAMPLE AVAILABLE"
      title="サンプルありの人気作品"
      description="公式サンプルが登録されている作品だけを、H-IT SCORE順で探せます。"
      works={works}
    />
  );
}
