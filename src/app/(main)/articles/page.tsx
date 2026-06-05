import type { Metadata } from "next";
import { getSections, getRecentPosts, getAllTags, getPageContent } from "@/lib/db/queries";
import { Articles, type ArticlesPageData } from "@/components/pages/ArticlesPage";

// Vercel build network blocks Turso hrana protocol.
// Force runtime rendering so DB queries happen after deployment.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "长路纪行",
  description:
    "北行之路文章总览。三大成长板块——自我探索、自我提升、自我实现，记录走向精神自立的每一步。",
  openGraph: {
    title: "长路纪行 | 北行之路",
    description:
      "北行之路文章总览。三大成长板块——自我探索、自我提升、自我实现，记录走向精神自立的每一步。",
  },
};

const toCard = (p: Record<string, unknown>) => ({
  id: p.id as string, slug: p.slug as string, title: p.title as string,
  summary: (p.summary as string) ?? "", section: p.section as string,
  tags: p.tags as string | null, coverImage: (p.coverImage as string) ?? "",
  readingTime: p.readingTime as number, createdAt: p.createdAt as string,
});

export default async function ArticlesPage() {
  const [sections, recentPosts, allTags, articlesPage] = await Promise.all([
    getSections(), getRecentPosts(20), getAllTags(),
    getPageContent("articles"),
  ]);

  let pageData: ArticlesPageData | undefined;
  if (articlesPage?.content) {
    try { pageData = JSON.parse(articlesPage.content) as ArticlesPageData; } catch { /* use defaults */ }
  }

  return (
    <Articles
      sections={sections}
      recentPosts={recentPosts.map(toCard)}
      allTags={allTags}
      pageData={pageData}
    />
  );
}
