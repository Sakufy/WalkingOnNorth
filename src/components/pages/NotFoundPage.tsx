"use client";

import { useState } from "react";
import Link from "next/link";

export function NotFound() {
  const [hovered, setHovered] = useState(false);

  return (
    <main
      id="main-content"
      className="pb-20 sm:pb-0"
      style={{ maxWidth: "720px", margin: "0 auto", padding: "96px 24px 80px" }}
    >
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--bx-secondary)",
          fontFamily: '"Noto Sans SC", Inter, sans-serif',
          letterSpacing: "0.08em",
          marginBottom: "24px",
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
          fontWeight: 600,
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
          lineHeight: 1.3,
          color: "var(--bx-primary)",
          marginBottom: "20px",
        }}
      >
        这条路不存在。
      </h1>
      <p
        style={{
          fontSize: "1.0625rem",
          lineHeight: 1.8,
          color: "var(--bx-primary)",
          opacity: 0.72,
          marginBottom: "40px",
          maxWidth: "420px",
          fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
        }}
      >
        你可能走错了方向，或者这篇文章已经不在这里了。
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "14px 28px",
          borderRadius: "9999px",
          backgroundColor: hovered ? "var(--bx-tertiary)" : "var(--bx-primary)",
          color: "var(--bx-on-primary)",
          fontSize: "1.0625rem",
          fontFamily: '"Noto Sans SC", Inter, sans-serif',
          transition: "background-color 150ms ease",
          textDecoration: "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        回到首页
      </Link>
    </main>
  );
}
