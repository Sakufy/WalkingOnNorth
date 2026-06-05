"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";

type Post = {
  id: string; slug: string; title: string; summary: string;
  section: string; topicId: string | null; tags: string | null;
  coverImage: string; readingTime: number; createdAt: string;
};
type Topic = { id: string; name: string; description: string | null; postCount: number };

export type SectionPageData = {
  headline?: string;
  intro?: string[];
};

const SECTION_META: Record<string, { name: string; defaultHeadline: string; defaultIntro: string[] }> = {
  thinking: {
    name: "自我探索",
    defaultHeadline: "自我探索",
    defaultIntro: [
      "向内求索，确立本心。这里是思想笔记的空间——把脑子里模糊的感受试图说清楚。",
      "收录北行世界观、价值观、人生观与能量理论，拆解精神内耗与自我觉醒的底层逻辑。",
      "每一次思考的沉淀，都是更真实的自己浮现的过程。",
    ],
  },
  reading: {
    name: "自我提升",
    defaultHeadline: "自我提升",
    defaultIntro: [
      "打磨能力，精进成长。这里记录的是可落地的学习方法论。",
      "分享高考自学、大学专业课、身心能量管理的全套实践，所有方法均来自亲身验证。",
      "不相信捷径，只信迭代——每一步精进都值得被记录。",
    ],
  },
  journey: {
    name: "自我实现",
    defaultHeadline: "自我实现",
    defaultIntro: [
      "落地价值，向外输出。这里是行动与创造的记录。",
      "从付费咨询到北行者同行计划，从个人项目到软件开发的完整历程。",
      "价值不是想出来的，是做出来的。",
    ],
  },
};

function get<T>(v: T | undefined, fallback: T): T {
  return v !== undefined ? v : fallback;
}

export function Section({
  sectionSlug, sectionName, pageData, posts, topics,
}: {
  sectionSlug: string;
  sectionName: string;
  pageData?: SectionPageData;
  posts: Post[];
  topics: Topic[];
}) {
  const router = useRouter();
  const meta = SECTION_META[sectionSlug] ?? { name: sectionName, defaultHeadline: sectionName, defaultIntro: [] };
  const pd = pageData ?? {};
  const headline = get(pd.headline, meta.defaultHeadline);
  const intro = get(pd.intro, meta.defaultIntro);

  const PAGE_SIZE = 7;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <main id="main-content" className="pb-20 sm:pb-0" style={{ background: "var(--bx-neutral)" }}>
      {/* ==========================================
       * PAGE 1 — Section Introduction (free scroll)
       * ========================================== */}
      <section style={{
        minHeight: "100dvh",
        maxWidth: "clamp(320px, 85vw, 680px)",
        margin: "0 auto",
        padding: `clamp(48px, 10vh, 120px) clamp(16px, 5vw, 40px) clamp(32px, 6vh, 80px)`,
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
      }}>
        <button onClick={() => router.back()} style={{
          fontSize: "0.875rem", color: "var(--bx-secondary)",
          fontFamily: '"Noto Sans SC",Inter,sans-serif',
          marginTop: "clamp(64px, 12vh, 140px)",
          marginBottom: "clamp(24px, 4vh, 40px)",
          background: "none", border: "none", cursor: "pointer", padding: 0,
          minHeight: "44px", minWidth: "44px", textAlign: "left",
        }}>← 长路纪行</button>
        <h1 style={{
          fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
          fontSize: "clamp(2rem, 7vw, 3.5rem)", lineHeight: 1.15,
          letterSpacing: "0.02em", color: "var(--bx-primary)",
          marginBottom: "clamp(32px, 5vh, 56px)",
        }}>{headline}</h1>
        {intro.map((text, i) => (
          <p key={i} style={{
            fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif',
            fontSize: "clamp(1.0625rem, 2.5vw, 1.25rem)", lineHeight: 2.0,
            color: "var(--bx-primary)", opacity: 0.82,
            marginBottom: i < intro.length - 1 ? "clamp(24px, 4vh, 40px)" : 0,
          }}>{text}</p>
        ))}
      </section>

      {/* ==========================================
       * PAGE 2 — Topics + Articles
       * ========================================== */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 clamp(16px, 5vw, 40px)" }}>
        {/* Topics — horizontal scroll on mobile */}
        {topics.length > 0 && (
          <div style={{ marginBottom: "clamp(24px, 4vh, 40px)" }}>
            <Link href={`/articles/${sectionSlug}/topics`} style={{
              fontSize: "0.75rem", color: "var(--bx-tertiary)",
              fontFamily: '"Noto Sans SC",Inter,sans-serif',
              letterSpacing: "0.06em", marginBottom: "12px",
              textDecoration: "none", display: "inline-block",
            }}>专栏 →</Link>
            <div className="flex gap-2" style={{ overflowX: "auto", flexWrap: "nowrap", paddingBottom: "4px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", justifyContent: "center" }}>
              {topics.slice(0, 3).map((t) => (
                <Link key={t.id} href={`/articles/${sectionSlug}/topic/${t.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors shrink-0"
                  style={{
                    borderColor: "rgba(156,149,144,0.35)", color: "var(--bx-primary)",
                    fontFamily: '"Noto Sans SC",Inter,sans-serif', textDecoration: "none",
                    fontSize: "0.8125rem", whiteSpace: "nowrap",
                  }}>
                  {t.name}
                </Link>
              ))}
            </div>
            {topics.length > 3 && (
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <Link href={`/articles/${sectionSlug}/topics`} style={{
                  fontSize: "1.125rem", color: "var(--bx-secondary)", opacity: 0.3,
                  letterSpacing: "0.3em", textDecoration: "none",
                }}>···</Link>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "rgba(156,149,144,0.2)" }} />
      </div>

      {/* All articles */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px clamp(16px, 5vw, 40px) 80px" }}>
        {posts.length === 0 ? (
          <p style={{ color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>暂无文章。</p>
        ) : (
          <>
            {visiblePosts.map((article) => (
              <ArticleCard key={article.slug} article={article} sectionName="" />
            ))}
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
