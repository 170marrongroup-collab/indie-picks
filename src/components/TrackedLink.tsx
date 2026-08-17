"use client";

import type { MouseEvent, ReactNode } from "react";

type Props = {
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
}: Props) {
  function handleClick(_event: MouseEvent<HTMLAnchorElement>) {
    try {
      const payload = JSON.stringify({ workId, source });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/click", blob);
      } else {
        fetch("/api/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // クリック記録失敗でも遷移は止めない
    }
  }

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer sponsored" : undefined}
    >
      {children}
    </a>
  );
}
