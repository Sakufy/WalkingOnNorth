import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/pages/ArticleDetailPage";

// ISR: cache 10min. OG image requires fresh cache for WeChat card preview.
export const revalidate = 600;

const SECTION_NAMES: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

const SECTION_SLUGS: Record<string, string> = {
  explore: "thinking",
  improve: "reading",
  realize: "journey",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "未找到" };

  const sectionName = SECTION_NAMES[post.section] ?? post.section;

  return {
    title: post.title,
    description: post.summary ?? `北行之路原创文章。探索${sectionName}领域的思考与实践。`,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags ? post.tags.split(",").map((t) => t.trim()) : undefined,
      images: [
        {
          url: `${process.env.NODE_ENV === "production" ? "https://northwalking.cn" : "http://localhost:3000"}/api/og?title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.summary ?? "")}&section=${encodeURIComponent(post.section)}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    alternates: {
      canonical: `/posts/${slug}`,
    },
  };
}

const articleJsonLd = (post: {
  title: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  section: string;
  slug: string;
  topicName?: string | null;
}) => {
  const sectionName = SECTION_NAMES[post.section] ?? post.section;
  const sectionSlug = SECTION_SLUGS[post.section] ?? post.section;
  const siteUrl =
    process.env.NODE_ENV === "production"
      ? "https://northwalking.cn"
      : "http://localhost:3000";

  const breadcrumbItems = [
    { "@type": "ListItem" as const, position: 1, name: "首页", item: siteUrl },
    {
      "@type": "ListItem" as const,
      position: 2,
      name: "长路纪行",
      item: `${siteUrl}/articles`,
    },
    {
      "@type": "ListItem" as const,
      position: 3,
      name: sectionName,
      item: `${siteUrl}/articles/${sectionSlug}`,
    },
  ];

  if (post.topicName) {
    breadcrumbItems.push({
      "@type": "ListItem" as const,
      position: 4,
      name: post.topicName,
      item: `${siteUrl}/articles/${sectionSlug}`,
    });
  }

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.summary ?? undefined,
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      author: { "@type": "Person", name: "北行之路" },
      publisher: { "@type": "Organization", name: "北行之路" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    },
  ];
};

export default async function PostPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Lookup topic name if article belongs to a topic
  let topicInfo: { id: string; name: string } | null = null;
  if (post.topicId) {
    const [t] = await db.select({ id: topics.id, name: topics.name }).from(topics).where(eq(topics.id, post.topicId)).limit(1);
    topicInfo = t ?? null;
  }

  const ldJson = articleJsonLd({
    title: post.title,
    summary: post.summary,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    section: post.section,
    slug: post.slug,
    topicName: topicInfo?.name ?? null,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <ArticleDetail
        article={{
          id: post.id, slug: post.slug, title: post.title,
          summary: post.summary ?? "", section: post.section,
          tags: post.tags, topicId: post.topicId, topicName: topicInfo?.name ?? null,
          readingTime: post.readingTime, createdAt: post.createdAt,
          updatedAt: post.updatedAt, content: post.content,
        }}
      />
    </>
  );
}
