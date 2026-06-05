"use client";

import { useRouter } from "next/navigation";
import type { ReactNode, CSSProperties } from "react";

/**
 * Back button — uses browser history to preserve scroll position.
 * Falls back to `fallbackHref` when there's no history (e.g. direct URL access).
 */
export function BackButton({
  children,
  fallbackHref,
  style,
  className,
}: {
  children: ReactNode;
  fallbackHref: string;
  style?: CSSProperties;
  className?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
        display: "inline-block",
        ...style,
      }}
      className={className}
    >
      {children}
    </button>
  );
}
