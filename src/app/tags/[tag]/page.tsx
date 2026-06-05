import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, like, desc, and } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/BackButton";

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  const items = await db
    .select({
      id: posts.id, slug: posts.slug, title: posts.title, summary: posts.summary,
      section: posts.section, readingTime: posts.readingTime, createdAt: posts.createdAt,
    })
    .from(posts)
    .where(and(eq(posts.status, "published"), like(posts.tags, `%${decoded}%`)))
    .orderBy(desc(posts.createdAt))
    .limit(50);

  if (items.length === 0) notFound();

  const sectionNames: Record<string, string> = {
    explore: "自我探索", improve: "自我提升", realize: "自我实现",
  };

  return (
    <main id="main-content" className="pb-20 sm:pb-0" style={{ background: "var(--bx-neutral)" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "clamp(48px, 10vh, 120px) clamp(16px, 5vw, 40px) 80px" }}>
        <BackButton fallbackHref="/articles" style={{
          fontSize: "0.875rem", color: "var(--bx-secondary)",
          fontFamily: '"Noto Sans SC",Inter,sans-serif',
          marginBottom: "clamp(24px, 4vh, 40px)", display: "inline-block",
        }}>← 返回</BackButton>

        <h1 style={{
          fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)", lineHeight: 1.3,
          color: "var(--bx-primary)", marginBottom: "8px",
        }}>{decoded}</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--bx-secondary)", marginBottom: "clamp(32px, 5vh, 56px)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
          {items.length} 篇文章
        </p>

        <div>
          {items.map((article) => (
            <Link key={article.slug} href={`/posts/${article.slug}`}
              style={{ textDecoration: "none", display: "block" }}>
              <article style={{ padding: "20px 0", borderBottom: "1px solid rgba(156,149,144,0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif', border: "1px solid rgba(156,149,144,0.35)", borderRadius: "4px", padding: "1px 8px" }}>
                    {sectionNames[article.section] ?? article.section}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
                    {new Date(article.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
                  fontSize: "clamp(1rem, 2.5vw, 1.125rem)", lineHeight: 1.4,
                  color: "var(--bx-primary)", marginBottom: "4px",
                }}>{article.title}</h3>
                {article.summary && (
                  <p style={{ fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", lineHeight: 1.6, color: "var(--bx-primary)", opacity: 0.68 }}>
                    {article.summary}
                  </p>
                )}
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
