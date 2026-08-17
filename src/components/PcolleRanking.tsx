"use client";

import { useEffect } from "react";

type PcolleRankingProps = {
  type?: "rankingRealtime" | "ranking2week" | "new";
  count?: number;
  height?: number;
  category?: string;
  direction?: "horizontal" | "vertical";
};

const AFFILIATE_ID = "884168f99732d9bad";
const SCRIPT_ID = "pcolle-parts-script";

export function PcolleRanking({
  type = "ranking2week",
  count = 5,
  height = 150,
  category = "0",
  direction = "horizontal",
}: PcolleRankingProps) {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.pcolle.com/parts/js/parts.js";
    script.charset = "UTF-8";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="pcolleWidgetShell">
      <div
        className="pcolle-parts"
        data-affiliatecategory={category}
        data-affiliatecount={String(count)}
        data-affiliatedirection={direction}
        data-affiliateheight={String(height)}
        data-affiliateid={AFFILIATE_ID}
        data-affiliatetype={type}
      />
      <div className="pcolleOfficialNote">掲載元：Pcolle</div>
    </div>
  );
}