"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ============================================
 * Types
 * ============================================ */

type HomeSection = { slug: string; name: string; description: string; postCount: number };
type HomePost = { id: string; slug: string; title: string; summary: string; section: string; coverImage: string; readingTime: number; createdAt: string };

/** CMS-supplied homepage content. Omitted fields fall back to hardcoded defaults. */
export type HomePageData = {
  slogan?: string;
  philosophy?: string[];
  audience?: { title: string; trait: string; text: string }[];
  sections?: {
    thinking?: { subtitle?: string; intro?: string; action?: string };
    reading?: { subtitle?: string; intro?: string; action?: string };
    journey?: { subtitle?: string; intro?: string; action?: string };
  };
};

/* ============================================
 * Hardcoded defaults (fallback when CMS has no data)
 * ============================================ */

const DEFAULTS = {
  slogan: "向内探寻，向北而行",
  philosophy: [
    "北行之路从不是被划定的人生轨道，而是一片任由自我开拓的旷野。",
    "我们拒绝世俗单一的成功规训，以自我探索、自我提升、自我实现为完整成长闭环；依托亲身实战沉淀学习方法论，借持续创作沉淀思想，用内容联结同频、交换价值。",
    "在这里，所有文字都是成长的沉淀，每一次分享都是双向的成长迭代。",
  ],
  audience: [
    { title: "不甘规训者", trait: "独立意志，拒绝从众", text: "不盲从世俗的标准答案，不被流水线人生裹挟。拥有自己的判断体系，愿意为内心的选择，承受独行的代价。" },
    { title: "向内求索者", trait: "深度自省，探寻本心", text: "不满足表层生活，长期思考自我、价值与人生意义。愿意直面迷茫，把困惑当作自我迭代、向内扎根的契机。" },
    { title: "务实破局者", trait: "摒弃内耗，行动至上", text: "厌恶空想与精神内耗，不信抱怨、只信迭代。接纳现实的不完美，始终以行动破局，以精进对抗焦虑。" },
    { title: "长期践行者", trait: "追求自洽，实现自我", text: "不屑短期功利的泡沫价值，追求长久的内心自洽与成长复利。渴望搭建属于自己的人生体系，最终完成自我价值的创造与落地。" },
  ],
  sections: {
    thinking: { subtitle: "向内求索，确立本心", intro: "收录北行世界观、价值观、人生观、能量价值理论，拆解精神内耗与自我觉醒，理清人生选择底层逻辑。", action: "进入探索" },
    reading: { subtitle: "打磨能力，精进成长", intro: "分享高考自学、大学专业课、身心能量管理全套落地方法论，所有方法均来自亲身实践验证。", action: "查看干货" },
    journey: { subtitle: "落地价值，向外输出", intro: "记录付费咨询、北行者同行计划筹备、个人项目与软件开发全流程，见证能力落地与价值变现。", action: "了解实践" },
  },
};

function get<T>(cmsVal: T | undefined, fallback: T): T {
  return cmsVal !== undefined ? cmsVal : fallback;
}

/* ============================================
 * Sub-components
 * ============================================ */

function SectionCard({
  slug,
  name,
  postCount,
  sectionMeta,
}: {
  slug: string;
  name: string;
  postCount: number;
  sectionMeta: { subtitle: string; intro: string; action: string };
}) {
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
          padding: "clamp(20px, 4vw, 72px)",
          borderRadius: "12px",
          border: hovered
            ? "1px solid rgba(166, 124, 82, 0.35)"
            : "1px solid rgba(156, 149, 144, 0.15)",
          display: "flex",
          flexDirection: "column",
          minHeight: "clamp(150px, 22vh, 360px)",
          maxHeight: "clamp(180px, 44vh, 400px)",
          transition: "border-color 200ms ease",
        }}
      >
        {/* Top: section name + post count */}
        <div style={{ marginBottom: "auto" }}>
          <h3
            style={{
              fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
              fontWeight: 600,
              fontSize: "clamp(1.125rem, 2.5vw, 2rem)",
              lineHeight: 1.3,
              color: hovered ? "var(--bx-tertiary)" : "var(--bx-primary)",
              marginBottom: "4px",
              transition: "color 200ms ease",
            }}
          >
            {name}
          </h3>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--bx-tertiary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
              marginBottom: "10px",
              letterSpacing: "0.02em",
            }}
          >
            {sectionMeta.subtitle}
          </p>
          <p
            style={{
              fontSize: "clamp(0.8125rem, 1.5vw, 0.9375rem)",
              lineHeight: 1.8,
              color: "var(--bx-primary)",
              opacity: 0.62,
              marginBottom: "16px",
            }}
          >
            {sectionMeta.intro}
          </p>
        </div>

        {/* Bottom: action link */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--bx-tertiary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
            }}
          >
            {sectionMeta.action} →
          </span>
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--bx-secondary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
            }}
          >
            {postCount} 篇
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCardInline({ article }: { article: HomePost }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      style={{
        padding: "clamp(28px, 4vh, 40px) 0",
        borderBottom: "1px solid rgba(156, 149, 144, 0.1)",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3
        style={{
          fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
          fontWeight: 600,
          fontSize: "clamp(1.25rem, 3vw, 1.625rem)",
          lineHeight: 1.4,
          color: hovered ? "var(--bx-tertiary)" : "var(--bx-primary)",
          marginBottom: "10px",
          transition: "color 200ms ease",
        }}
      >
        {article.title}
      </h3>
      {article.summary && (
        <p
          style={{
          fontSize: "clamp(0.8125rem, 1.8vw, 0.875rem)",
          lineHeight: 1.65,
          color: "var(--bx-primary)",
          opacity: 0.62,
          }}
        >
          {article.summary}
        </p>
      )}
    </article>
  );
}

/* ============================================
 * Main
 * ============================================ */

export function Home({
  sections,
  featuredPosts,
  pageData,
}: {
  sections: HomeSection[];
  featuredPosts: HomePost[];
  pageData?: HomePageData;
}) {
  const pd = pageData ?? {};
  const slogan = get(pd.slogan, DEFAULTS.slogan);
  const philosophy = get(pd.philosophy, DEFAULTS.philosophy);
  const audience = get(pd.audience, DEFAULTS.audience);
  const sectionMeta = {
    thinking: { ...DEFAULTS.sections.thinking, ...pd.sections?.thinking },
    reading: { ...DEFAULTS.sections.reading, ...pd.sections?.reading },
    journey: { ...DEFAULTS.sections.journey, ...pd.sections?.journey },
  };
  const sloganRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(true);

  /* Enable scroll-snap on html — desktop only.
   * Mobile is disabled: 100dvh changes when address bar appears/hides,
   * shifting snap points mid-scroll and causing jank. */
  useEffect(() => {
    const el = document.documentElement;
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => {
      el.style.scrollSnapType = mq.matches ? "y proximity" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      el.style.scrollSnapType = "";
      mq.removeEventListener("change", apply);
    };
  }, []);

  /* Hide arrow when slogan page scrolls out of view */
  useEffect(() => {
    const el = sloganRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowArrow(entry.intersectionRatio > 0.3),
      { threshold: [0, 0.3, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollNext = useCallback(() => {
    sloganRef.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <main
      id="main-content"
      className="pb-20 sm:pb-0 bx-homepage"
      style={{ background: "var(--bx-neutral)" }}
    >
      {/* ==========================================
       * MODULE 0 — Slogan（吸附）
       * ========================================== */}
      <div
        ref={sloganRef}
        className="bx-snap-start"
        style={{
          minHeight: "var(--bx-vh)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "clamp(24px, 8vh, 80px) clamp(16px, 5vw, 40px)",
          backgroundColor: "var(--bx-neutral)",
        }}
      >
        <h1
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "clamp(1.75rem, 6vw, 4.25rem)",
            lineHeight: 1.15,
            letterSpacing: "0.08em",
            color: "var(--bx-primary)",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {slogan}
        </h1>

        {/* Scroll arrow */}
        <div
          onClick={scrollNext}
          className={`bx-arrow-bounce ${showArrow ? "" : "bx-arrow-hidden"}`}
          style={{
            position: "absolute",
            bottom: "clamp(24px, 5vh, 48px)",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "pointer",
            transition: "opacity 300ms ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
          aria-label="向下滚动"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") scrollNext();
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--bx-secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* ==========================================
       * MODULE 1 — 理念阐释（居中铺砌）
       * ========================================== */}
      <section
        style={{
          minHeight: "var(--bx-vh)",
          maxWidth: "clamp(320px, 75vw, 720px)",
          margin: "0 auto",
          padding: "clamp(32px, 5vh, 64px) clamp(16px, 5vw, 40px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "var(--bx-surface)",
        }}
      >
        {philosophy.map((text, i) => {
          const firstSentenceEnd = Math.max(
            text.indexOf("。"),
            text.indexOf("！"),
            text.indexOf("？")
          );
          const hasSplit = firstSentenceEnd >= 0;
          const firstSentence = hasSplit ? text.slice(0, firstSentenceEnd + 1) : text;
          const rest = hasSplit ? text.slice(firstSentenceEnd + 1) : "";

          return (
            <p
              key={i}
              style={{
                fontFamily: '"LXGW WenKai", "Noto Serif SC", "Source Serif 4", Georgia, serif',
                fontSize: "clamp(1.0625rem, 2.5vw, 1.375rem)",
                lineHeight: 2.0,
                color: "var(--bx-primary)",
                opacity: 0.82,
                marginBottom: i < philosophy.length - 1 ? "clamp(32px, 5vh, 56px)" : 0,
              }}
            >
              <span style={{ fontWeight: 600, opacity: 1 }}>{firstSentence}</span>
              {rest}
            </p>
          );
        })}
      </section>

      {/* Breathing spacer */}
      <div style={{ height: "clamp(48px, 8vh, 120px)" }} />

      {/* ==========================================
       * MODULE 2 — 人群适配（一屏呈现）
       * ========================================== */}
      <section
        style={{
          minHeight: "var(--bx-vh)",
          maxWidth: "clamp(320px, 90vw, 1100px)",
          margin: "0 auto",
          padding: "clamp(32px, 5vh, 80px) clamp(16px, 5vw, 40px) clamp(32px, 5vh, 80px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "var(--bx-neutral)",
        }}
      >
        <h2
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            lineHeight: 1.3,
            color: "var(--bx-primary)",
            marginBottom: "clamp(32px, 5vh, 72px)",
            textAlign: "center",
          }}
        >
          这里适合谁？
        </h2>

        {/* 2×2 grid on desktop, single column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          {audience.map((card) => (
            <div key={card.title} style={{ padding: "clamp(16px, 3vw, 32px) clamp(20px, 4vw, 40px)", border: "1px solid rgba(156,149,144,0.1)", borderRadius: "10px" }}>
              <h3
                style={{
                  fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
                  fontWeight: 600,
                  fontSize: "clamp(1.125rem, 3vw, 1.5rem)",
                  lineHeight: 1.3,
                  color: "var(--bx-primary)",
                  marginBottom: "6px",
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--bx-tertiary)",
                  fontFamily: '"Noto Sans SC", Inter, sans-serif',
                  marginBottom: "12px",
                  letterSpacing: "0.02em",
                }}
              >
                核心特质：{card.trait}
              </p>
              <p
                style={{
                  fontSize: "clamp(0.875rem, 1.8vw, 0.9375rem)",
                  lineHeight: 1.8,
                  color: "var(--bx-primary)",
                  opacity: 0.78,
                }}
              >
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Breathing spacer */}
      <div style={{ height: "clamp(48px, 8vh, 120px)" }} />

      {/* ==========================================
       * MODULE 3 — 板块导引（一屏呈现）
       * ========================================== */}
      <section
        style={{
          minHeight: "var(--bx-vh)",
          maxWidth: "clamp(320px, 90vw, 1200px)",
          margin: "0 auto",
          padding: `clamp(32px, 5vh, 80px) clamp(16px, 5vw, 40px) clamp(32px, 5vh, 80px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "var(--bx-surface)",
        }}
      >
        <h2
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            lineHeight: 1.3,
            color: "var(--bx-primary)",
            marginBottom: "clamp(28px, 6vh, 88px)",
            textAlign: "center",
          }}
        >
          三大成长板块
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {sections.map((s) => (
            <SectionCard
              key={s.slug}
              slug={s.slug}
              name={s.name}
              postCount={s.postCount}
              sectionMeta={sectionMeta[s.slug as "thinking" | "reading" | "journey"] ?? { subtitle: "", intro: "", action: "" }}
            />
          ))}
        </div>
      </section>

      {/* Breathing spacer */}
      <div style={{ height: "clamp(48px, 8vh, 120px)" }} />

      {/* ==========================================
       * MODULE 4 — 精选文章
       * ========================================== */}
      <section
        style={{
          minHeight: "var(--bx-vh)",
          maxWidth: "760px",
          margin: "0 auto",
          padding: `0 clamp(16px, 5vw, 40px) clamp(60px, 10vh, 120px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "var(--bx-neutral)",
        }}
      >
        <h2
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            lineHeight: 1.3,
            color: "var(--bx-primary)",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          精选文章
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--bx-secondary)",
            marginBottom: "clamp(32px, 5vh, 48px)",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
            textAlign: "center",
          }}
        >
          编辑推荐
        </p>

        {featuredPosts.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--bx-secondary)", padding: "40px 0" }}>
            暂无精选文章。
          </p>
        ) : (
          <div>
            {featuredPosts.slice(0, 5).map((article) => (
              <Link
                key={article.slug}
                href={`/posts/${article.slug}`}
                style={{ display: "block", textDecoration: "none" }}
              >
                <ArticleCardInline article={article} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
