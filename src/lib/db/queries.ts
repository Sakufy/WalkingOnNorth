import { cache } from "react";
import { db } from "./index";
import { posts, postVersions, paragraphs, topics, pages, pageSections, comments, users } from "./schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";

/* ========================================
 * Posts
 * ======================================== */

/** Featured posts for homepage / articles page */
export async function getFeaturedPosts(limit = 5) {
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      summary: posts.summary,
      section: posts.section,
      tags: posts.tags,
      coverImage: posts.coverImage,
      readingTime: posts.readingTime,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(and(eq(posts.status, "published"), eq(posts.isFeatured, true)))
    .orderBy(desc(posts.updatedAt))
    .limit(limit);
}

/** All unique tags across published posts */
export async function getAllTags(): Promise<string[]> {
  const rows = await db
    .select({ tags: posts.tags })
    .from(posts)
    .where(eq(posts.status, "published"));

  const set = new Set<string>();
  for (const row of rows) {
    if (!row.tags) continue;
    row.tags.split(",").forEach((t) => {
      const trimmed = t.trim();
      if (trimmed) set.add(trimmed);
    });
  }
  return [...set].sort();
}

/** All published posts (recent first) — for global listing */
export async function getRecentPosts(limit = 20) {
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      summary: posts.summary,
      section: posts.section,
      tags: posts.tags,
      coverImage: posts.coverImage,
      readingTime: posts.readingTime,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.updatedAt))
    .limit(limit);
}

/** Posts for a section page, with optional topic filter */
export async function getSectionPosts(
  section: "explore" | "improve" | "realize",
  topicId?: string,
  limit = 20,
  offset = 0
) {
  const conditions = [eq(posts.section, section), eq(posts.status, "published")];
  if (topicId) conditions.push(eq(posts.topicId, topicId));

  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      summary: posts.summary,
      section: posts.section,
      topicId: posts.topicId,
      tags: posts.tags,
      coverImage: posts.coverImage,
      readingTime: posts.readingTime,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(and(...conditions))
    .orderBy(asc(posts.sortOrder), desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

/** Full post detail by slug, including latest version content.
 * Wrapped in React cache() so generateMetadata + Page sharing the
 * same slug in one request only hit the DB once. */
export const getPostBySlug = cache(async (slug: string) => {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  if (!post) return null;

  const [version] = await db
    .select()
    .from(postVersions)
    .where(eq(postVersions.postId, post.id))
    .orderBy(desc(postVersions.versionNumber))
    .limit(1);

  return { ...post, content: version?.content ?? "" };
});

/** Version history for a post */
export async function getPostVersions(postId: string) {
  return db
    .select({
      id: postVersions.id,
      versionNumber: postVersions.versionNumber,
      changeSummary: postVersions.changeSummary,
      content: postVersions.content,
      createdAt: postVersions.createdAt,
    })
    .from(postVersions)
    .where(eq(postVersions.postId, postId))
    .orderBy(desc(postVersions.versionNumber));
}

/* ========================================
 * Topics
 * ======================================== */

/** All topics grouped by section */
export async function getAllTopics() {
  return db.select().from(topics).orderBy(asc(topics.sortOrder));
}

/** Topics for a specific section, with post counts (single query) */
export async function getTopicsBySection(section: "explore" | "improve" | "realize") {
  return db
    .select({
      id: topics.id,
      name: topics.name,
      description: topics.description,
      section: topics.section,
      sortOrder: topics.sortOrder,
      createdAt: topics.createdAt,
      postCount: sql<number>`count(${posts.id})`.mapWith(Number),
    })
    .from(topics)
    .leftJoin(posts, and(eq(posts.topicId, topics.id), eq(posts.status, "published")))
    .where(eq(topics.section, section))
    .groupBy(topics.id)
    .orderBy(asc(topics.sortOrder));
}

/* ========================================
 * Pages (CMS content)
 * ======================================== */

export async function getPageContent(slug: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);
  return page ?? null;
}

/* ========================================
 * Comments
 * ======================================== */

export async function getApprovedCommentsByPost(postId: string) {
  return db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      paragraphId: comments.paragraphId,
      type: comments.type,
      content: comments.content,
      selectedText: comments.selectedText,
      charCount: comments.charCount,
      isHighValue: comments.isHighValue,
      createdAt: comments.createdAt,
      userName: users.nickname,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.postId, postId), eq(comments.status, "approved")))
    .orderBy(desc(comments.createdAt));
}

/* ========================================
 * Paragraphs (for inline comments)
 * ======================================== */

export async function getParagraphsByPost(postId: string) {
  return db
    .select()
    .from(paragraphs)
    .where(eq(paragraphs.postId, postId))
    .orderBy(asc(paragraphs.pOrder));
}

/* ========================================
 * Sections metadata
 * ======================================== */

export type SectionMeta = {
  slug: string;
  name: string;
  description: string;
  postCount: number;
};

export async function getSections(): Promise<SectionMeta[]> {
  const sectionDefs = [
    { slug: "thinking", name: "自我探索", description: "思想笔记与内心对话" },
    { slug: "reading", name: "自我提升", description: "阅读摘录与知识沉淀" },
    { slug: "journey", name: "自我实现", description: "长路纪行与行动记录" },
  ];

  const dbSections: Array<"explore" | "improve" | "realize"> = ["explore", "improve", "realize"];

  // Single query for all section counts
  const counts = await db
    .select({
      section: posts.section,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(posts)
    .where(and(eq(posts.status, "published")))
    .groupBy(posts.section);

  const countMap = new Map(counts.map((c) => [c.section, c.count]));

  return sectionDefs.map((def, i) => ({
    ...def,
    postCount: countMap.get(dbSections[i]) ?? 0,
  }));
}

/* ========================================
 * Page Sections (block-based CMS)
 * ======================================== */

export type PageSectionRow = typeof pageSections.$inferSelect;

/** All sections for a page, sorted by sort_order */
export async function getPageSections(pageSlug: "home" | "about") {
  return db
    .select()
    .from(pageSections)
    .where(eq(pageSections.pageSlug, pageSlug))
    .orderBy(asc(pageSections.sortOrder));
}
