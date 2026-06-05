"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="hidden sm:block"
      style={{
        borderTop: "1px solid rgba(156, 149, 144, 0.2)",
        marginTop: "0",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px 24px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "32px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
              fontWeight: 600,
              fontSize: "1rem",
              color: "var(--bx-primary)",
              marginBottom: "8px",
            }}
          >
            北行之路
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--bx-secondary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
              lineHeight: 1.6,
              maxWidth: "260px",
            }}
          >
            关于思考、阅读与行走的写作空间。
          </p>
        </div>

        <nav aria-label="页脚导航">
          <div className="flex gap-8">
            {[
              { to: "/articles/thinking", label: "自我探索" },
              { to: "/articles/reading", label: "自我提升" },
              { to: "/articles/journey", label: "自我实现" },
              { to: "/about", label: "关于" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                href={to}
                style={{
                  fontSize: "0.875rem",
                  color: "var(--bx-secondary)",
                  fontFamily: '"Noto Sans SC", Inter, sans-serif',
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--bx-tertiary)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--bx-secondary)"; }}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "0 24px 32px",
        }}
      >
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--bx-secondary)",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
            opacity: 0.7,
          }}
        >
          © 2024 北行之路
        </p>
      </div>
    </footer>
  );
}
