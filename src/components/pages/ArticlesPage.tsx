"use client";

import { useState } from "react";
import Link from "next/link";

/* ============================================
 * Types
 * ============================================ */

type Post = {
  id: string; slug: string; title: string; summary: string;
  section: string; coverImage: string; readingTime: number;
  createdAt: string; tags?: string | null;
};

type SectionMeta = {
  slug: string; name: string; description: string; postCount: number;
};

export type ArticlesPageData = {
  headline?: string;
  intro?: string[];
};

/* ============================================
 * Defaults
 * ============================================ */

const DEFAULTS = {
  headline: "长路纪行",
  intro: [
    "这里记录我的思考、学习与实践——从困惑到清晰，从想法到落地，从输入到输出。",
    "自我探索向内求索，自我提升打磨能力，自我实现向外输出——三者构成完整的成长闭环。",
    "写作是为了把没想清楚的事情想清楚。每一次修改都是思维迭代的痕迹，每一篇文章都保留版本历史。",
  ],
};

function get<T>(v: T | undefined, fallback: T): T {
  return v !== undefined ? v : fallback;
}

/* ============================================
 * Sub-components
 * ============================================ */

function SectionCardSm({
  slug, name, postCount,
}: { slug: string; name: string; postCount: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/articles/${slug}`} style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        padding: "clamp(16px, 3vw, 28px)", borderRadius: "12px",
        border: hovered ? "1px solid rgba(166,124,82,0.35)" : "1px solid rgba(156,149,144,0.15)",
        textAlign: "center", transition: "border-color 200ms ease",
      }}>
        <h3 style={{
          fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
          fontSize: "clamp(1rem, 2.5vw, 1.25rem)", lineHeight: 1.3,
          color: hovered ? "var(--bx-tertiary)" : "var(--bx-primary)",
          marginBottom: "4px", transition: "color 200ms ease",
        }}>{name}</h3>
        <span style={{ fontSize: "0.8125rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
          {postCount} 篇
        </span>
      </div>
    </Link>
  );
}

function ArticleCardRow({ article }: { article: Post }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/posts/${article.slug}`} style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <article style={{
        padding: "24px 0", borderBottom: "1px solid rgba(156,149,144,0.12)", cursor: "pointer",
      }}>
        <h3 style={{
          fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
          fontSize: "clamp(1.0625rem, 2.2vw, 1.25rem)", lineHeight: 1.4,
          color: hovered ? "var(--bx-tertiary)" : "var(--bx-primary)",
          marginBottom: "6px", transition: "color 200ms ease",
        }}>{article.title}</h3>
        {article.summary && (
          <p style={{ fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", lineHeight: 1.65, color: "var(--bx-primary)", opacity: 0.7 }}>
            {article.summary}
          </p>
        )}
      </article>
    </Link>
  );
}

/* ============================================
 * Main
 * ============================================ */

export function Articles({
  sections, recentPosts, allTags, pageData,
}: {
  sections: SectionMeta[];
  recentPosts: Post[];
  allTags: string[];
  pageData?: ArticlesPageData;
}) {
  const pd = pageData ?? {};
  const headline = get(pd.headline, DEFAULTS.headline);
  const intro = get(pd.intro, DEFAULTS.intro);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredPosts = activeTag
    ? recentPosts.filter((p) => p.tags?.split(",").map((t) => t.trim()).includes(activeTag))
    : recentPosts;

  const PAGE_SIZE = 7;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Reset pagination when tag filter changes
  const handleTagSelect = (tag: string | null) => {
    setVisibleCount(PAGE_SIZE);
    setActiveTag(tag);
  };
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <main id="main-content" className="pb-20 sm:pb-0" style={{ background: "var(--bx-neutral)" }}>
      {/* ==========================================
       * PAGE 1 — Introduction (free scroll)
       * ========================================== */}
      <section style={{
        minHeight: "100dvh",
        maxWidth: "clamp(320px, 85vw, 680px)",
        margin: "0 auto",
        padding: `clamp(48px, 10vh, 120px) clamp(16px, 5vw, 40px) clamp(32px, 6vh, 80px)`,
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
      }}>
        <h1 style={{
          marginTop: "clamp(64px, 12vh, 140px)",
          fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
          fontSize: "clamp(2rem, 7vw, 3.5rem)", lineHeight: 1.15,
          letterSpacing: "0.02em", color: "var(--bx-primary)", marginBottom: "clamp(32px, 5vh, 56px)",
        }}>
          {headline}
        </h1>
        {intro.map((text, i) => (
          <p key={i} style={{
            fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif',
            fontSize: "clamp(1.0625rem, 2.5vw, 1.25rem)", lineHeight: 2.0,
            color: "var(--bx-primary)", opacity: 0.82,
            marginBottom: i < intro.length - 1 ? "clamp(24px, 4vh, 40px)" : 0,
          }}>
            {text}
          </p>
        ))}
      </section>

      {/* ==========================================
       * PAGE 2 — Content hub
       * ========================================== */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 clamp(16px, 5vw, 40px)" }}>
        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: "clamp(32px, 5vh, 56px)" }}>
          {sections.map((s) => (
            <SectionCardSm key={s.slug} slug={s.slug} name={s.name} postCount={s.postCount} />
          ))}
        </div>

        {/* Tag cloud */}
        {allTags.length > 0 && (
          <div style={{ marginBottom: "clamp(24px, 4vh, 40px)" }}>
            <div className="flex gap-2" style={{ overflowX: "auto", flexWrap: "nowrap", paddingBottom: "4px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", justifyContent: "center" }}>
              {allTags.map((tag) => (
                <button key={tag} onClick={() => handleTagSelect(activeTag === tag ? null : tag)}
                  style={{
                    padding: "5px 12px", borderRadius: "9999px", border: "1px solid rgba(156,149,144,0.35)",
                    backgroundColor: activeTag === tag ? "var(--bx-primary)" : "transparent",
                    color: activeTag === tag ? "var(--bx-on-primary)" : "var(--bx-secondary)",
                    fontSize: "0.8125rem", fontFamily: '"Noto Sans SC",Inter,sans-serif',
                    cursor: "pointer", transition: "all 150ms ease", whiteSpace: "nowrap",
                  }}
                >{tag}</button>
              ))}
            </div>
            {activeTag && (
              <p style={{ fontSize: "0.8125rem", color: "var(--bx-secondary)", marginTop: "8px" }}>
                「{activeTag}」· {filteredPosts.length} 篇
                <button onClick={() => handleTagSelect(null)} style={{
                  color: "var(--bx-tertiary)", textDecoration: "underline", cursor: "pointer",
                  marginLeft: "8px", background: "none", border: "none", fontSize: "0.8125rem",
                }}>清除</button>
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "rgba(156,149,144,0.2)" }} />
      </div>

      {/* All articles */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px clamp(16px, 5vw, 40px) 80px" }}>
        {filteredPosts.length === 0 ? (
          <p style={{ color: "var(--bx-secondary)", fontSize: "0.9375rem" }}>
            {activeTag ? `"${activeTag}" 标签下暂无文章` : "暂无文章。"}
          </p>
        ) : (
          <>
            <h2 style={{
              fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
              fontSize: "clamp(1.5rem, 4vw, 2rem)", lineHeight: 1.3, textAlign: "center",
              color: "var(--bx-primary)", marginBottom: "16px", paddingBottom: "16px",
              borderBottom: "1px solid rgba(156,149,144,0.15)",
            }}>{activeTag ? `「${activeTag}」` : "全部文章"}</h2>
            <div>
              {visiblePosts.map((article) => (
                <ArticleCardRow key={article.slug} article={article} />
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} style={{
                  padding: "10px 32px", borderRadius: "9999px",
                  border: "1px solid rgba(156,149,144,0.35)", color: "var(--bx-secondary)",
                  fontSize: "0.9375rem", fontFamily: '"Noto Sans SC",Inter,sans-serif',
                  background: "transparent", cursor: "pointer",
                }}>加载更多</button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
