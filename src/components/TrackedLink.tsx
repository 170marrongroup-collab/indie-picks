"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type TrackedLinkProps = {
  workId: string;
  source: "detail" | "affiliate";
  href: string;
  className?: string;
  external?: boolean;
  children: ReactNode;
};

export function TrackedLink({
  workId,
  source,
  href,
  className,
  external = false,
  children,
}: TrackedLinkProps) {
  const handleClick = (_event: MouseEvent<HTMLAnchorElement>) => {
    try {
      const body = JSON.stringify({
        workId,
        source,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/click",
          new Blob([body], { type: "application/json" })
        );
      } else {
        fetch("/api/click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // 計測に失敗してもリンク遷移は止めない
    }
  };

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
