"use client";

import { useState } from "react";
import Link from "next/link";

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    section: string;
    coverImage?: string;
    readingTime?: number;
    createdAt?: string;
    tags?: string | string[] | null;
  };
  sectionName?: string;
}

/** Normalize tags from DB (string or null) to array for rendering */
function getTags(tags?: string | string[] | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export function ArticleCard({ article, sectionName }: ArticleCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/posts/${article.slug}`}
      style={{ display: "block", textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        style={{
          padding: "clamp(24px, 4vh, 36px) 32px",
          borderRadius: "8px",
          borderBottom: hovered
            ? "1px solid rgba(45, 42, 38, 0.08)"
            : "1px solid transparent",
          transition: "border-color 200ms ease",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          {sectionName && (
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--bx-secondary)",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                border: "1px solid rgba(156, 149, 144, 0.4)",
                borderRadius: "4px",
                padding: "3px 10px",
                letterSpacing: "0.01em",
              }}
            >
              {sectionName}
            </span>
          )}
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--bx-secondary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
              letterSpacing: "0.01em",
            }}
          >
            {article.createdAt ? new Date(article.createdAt).toLocaleDateString("zh-CN") : ""}
          </span>
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--bx-secondary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
            }}
          >
            {article.readingTime} 分钟
          </span>
        </div>

        <h3
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "1.375rem",
            lineHeight: 1.4,
            color: hovered ? "var(--bx-tertiary)" : "var(--bx-primary)",
            marginBottom: "10px",
            transition: "color 200ms ease",
          }}
        >
          {article.title}
        </h3>

        <p
          style={{
          fontSize: "0.9375rem",
          lineHeight: 1.75,
          color: "var(--bx-primary)",
          opacity: 0.68,
            marginBottom: "14px",
          }}
        >
          {article.summary}
        </p>

        <div className="flex flex-wrap gap-2">
          {getTags(article.tags).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.8125rem",
                color: "var(--bx-secondary)",
                border: "1px solid rgba(156, 149, 144, 0.35)",
                borderRadius: "9999px",
                padding: "2px 10px",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                letterSpacing: "0.01em",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
}
