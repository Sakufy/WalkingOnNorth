import { getSectionPosts } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { BackButton } from "@/components/BackButton";

type DbSection = "explore" | "improve" | "realize";

const SLUG_TO_DB: Record<string, DbSection> = {
  thinking: "explore",
  reading: "improve",
  journey: "realize",
};

const SECTION_NAMES: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

export default async function TopicPage({
  params,
}: {
  params: Promise<{ sectionSlug: string; topicId: string }>;
}) {
  const { sectionSlug, topicId } = await params;
  const dbSection = SLUG_TO_DB[sectionSlug];

  if (!dbSection) notFound();

  const [topic] = await db
    .select()
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1);

  if (!topic) notFound();

  const rawPosts = await getSectionPosts(dbSection, topicId);
  const posts = rawPosts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary ?? "",
    section: p.section,
    topicId: p.topicId,
    coverImage: p.coverImage ?? "",
    readingTime: p.readingTime,
    createdAt: p.createdAt,
  }));

  return (
    <TodoPageContent topic={topic} posts={posts} sectionSlug={sectionSlug} sectionLabel={SECTION_NAMES[dbSection]} />
  );
}

function TodoPageContent({
  topic,
  posts,
  sectionSlug,
  sectionLabel,
}: {
  topic: { id: string; name: string; description: string | null };
  posts: Array<{
    id: string; slug: string; title: string; summary: string;
    section: string; topicId: string | null;
    coverImage: string; readingTime: number; createdAt: string;
  }>;
  sectionSlug: string;
  sectionLabel: string;
}) {
  return (
    <main id="main-content" className="pb-20 sm:pb-0">
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px 48px" }}>
        <BackButton fallbackHref={`/articles/${sectionSlug}`} style={{ marginBottom: "24px", fontSize: "0.875rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
          ← {sectionLabel}
        </BackButton>

        <h1
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            color: "var(--bx-primary)",
            marginBottom: "16px",
          }}
        >
          {topic.name}
        </h1>

        {topic.description && (
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.8,
              color: "var(--bx-primary)",
              opacity: 0.72,
              marginBottom: "32px",
            }}
          >
            {topic.description}
          </p>
        )}

        <p
          className="text-sm"
          style={{ color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC", Inter, sans-serif' }}
        >
          {posts.length} 篇文章
        </p>
      </div>

      <div style={{ height: "1px", backgroundColor: "rgba(156,149,144,0.2)", maxWidth: "800px", margin: "0 auto" }} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px 80px" }}>
        {posts.length === 0 ? (
          <p style={{ color: "var(--bx-secondary)" }}>暂无文章。</p>
        ) : (
          posts.map((article) => (
            <ArticleCard key={article.slug} article={article} sectionName="" />
          ))
        )}
      </div>
    </main>
  );
}
