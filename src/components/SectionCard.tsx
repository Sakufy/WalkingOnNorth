"use client";

import { useState } from "react";
import Link from "next/link";

interface SectionCardProps {
  slug: string;
  name: string;
  description: string;
  articleCount: number;
}

export function SectionCard({ slug, name, description, articleCount }: SectionCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/articles/${slug}`}
      style={{ display: "block", textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          padding: "32px 40px",
          borderRadius: "12px",
          border: hovered
            ? "1px solid rgba(156, 149, 144, 0.5)"
            : "1px solid transparent",
          transition: "border-color 200ms ease",
          height: "100%",
        }}
      >
        <h3
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "1.375rem",
            lineHeight: 1.4,
            color: "var(--bx-primary)",
            marginBottom: "12px",
          }}
        >
          {name}
        </h3>
        <p
          style={{
            fontSize: "1.0625rem",
            lineHeight: 1.8,
            color: "var(--bx-primary)",
            opacity: 0.72,
            marginBottom: "20px",
          }}
        >
          {description}
        </p>
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--bx-secondary)",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
            letterSpacing: "0.01em",
          }}
        >
          {articleCount} 篇文章
        </span>
      </div>
    </Link>
  );
}
