import type { Metadata } from "next";
import { getSectionPosts, getTopicsBySection, getPageContent } from "@/lib/db/queries";
import { Section, type SectionPageData } from "@/components/pages/SectionPage";

// ISR: cache section pages 2 hours
export const revalidate = 7200;

type DbSection = "explore" | "improve" | "realize";

const SLUG_TO_DB: Record<string, DbSection> = {
  thinking: "explore", reading: "improve", journey: "realize",
};

const SECTION_NAMES: Record<string, string> = {
  thinking: "自我探索", reading: "自我提升", journey: "自我实现",
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  thinking: "锚定本心方向，搭建个人叙事系统",
  reading: "搭建高效专属学习与任务管理系统",
  journey: "打造完整北行独元，完成价值交换",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionSlug: string }>;
}): Promise<Metadata> {
  const { sectionSlug } = await params;
  const name = SECTION_NAMES[sectionSlug] ?? sectionSlug;
  const desc = SECTION_DESCRIPTIONS[sectionSlug] ?? "";

  return {
    title: name,
    description: desc || `北行之路「${name}」板块文章合集。`,
    openGraph: {
      title: `${name} | 北行之路`,
      description: desc || undefined,
    },
  };
}

export default async function SectionPage({
  params,
}: { params: Promise<{ sectionSlug: string }> }) {
  const { sectionSlug } = await params;
  const dbSection = SLUG_TO_DB[sectionSlug];
  const sectionName = SECTION_NAMES[sectionSlug] ?? sectionSlug;

  if (!dbSection) {
    return <Section sectionSlug={sectionSlug} sectionName={sectionName} posts={[]} topics={[]} />;
  }

  const [posts, topics, cmsPage] = await Promise.all([
    getSectionPosts(dbSection),
    getTopicsBySection(dbSection),
    getPageContent(`section-${sectionSlug}`),
  ]);

  let pageData: SectionPageData | undefined;
  if (cmsPage?.content) {
    try { pageData = JSON.parse(cmsPage.content) as SectionPageData; } catch { /* defaults */ }
  }

  return (
    <Section
      sectionSlug={sectionSlug}
      sectionName={sectionName}
      pageData={pageData}
      posts={posts.map((p) => ({
        id: p.id, slug: p.slug, title: p.title, summary: p.summary ?? "",
        section: p.section, topicId: p.topicId, tags: p.tags,
        coverImage: p.coverImage ?? "", readingTime: p.readingTime, createdAt: p.createdAt,
      }))}
      topics={topics.map((t) => ({
        id: t.id, name: t.name, description: t.description, postCount: t.postCount,
      }))}
    />
  );
}
