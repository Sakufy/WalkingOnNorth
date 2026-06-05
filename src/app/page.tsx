import type { Metadata } from "next";
import { getSections, getFeaturedPosts, getPageContent } from "@/lib/db/queries";
import { Home, type HomePageData } from "@/components/pages/HomePage";

// Vercel build network blocks Turso hrana protocol.
// Force runtime rendering so DB queries happen after deployment.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "北行之路 - 个人成长专属内容平台",
  description:
    "向内探寻，向北而行。原创成长内容平台，以自我探索、自我提升、自我实现为完整成长闭环。服务拒绝盲从、追求精神自立的独立个体。",
  openGraph: {
    title: "北行之路 - 个人成长专属内容平台",
    description:
      "向内探寻，向北而行。原创成长内容平台，以自我探索、自我提升、自我实现为完整成长闭环。",
  },
};

export default async function HomePage() {
  const [sections, featuredPosts, homePage] = await Promise.all([
    getSections(),
    getFeaturedPosts(5),
    getPageContent("home"),
  ]);

  let pageData: HomePageData | undefined;
  if (homePage?.content) {
    try {
      pageData = JSON.parse(homePage.content) as HomePageData;
    } catch { /* use defaults if JSON is malformed */ }
  }

  return (
    <Home
      sections={sections}
      featuredPosts={featuredPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        summary: p.summary ?? "",
        section: p.section,
        coverImage: p.coverImage ?? "",
        readingTime: p.readingTime,
        createdAt: p.createdAt,
      }))}
      pageData={pageData}
    />
  );
}
