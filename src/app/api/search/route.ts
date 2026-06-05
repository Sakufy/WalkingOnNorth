import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, like, or, desc, and } from "drizzle-orm";

/** GET /api/search?q=xxx — public search across published posts */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) return NextResponse.json([]);

  const results = await db
    .select({
      id: posts.id, slug: posts.slug, title: posts.title,
      summary: posts.summary, section: posts.section,
      readingTime: posts.readingTime, createdAt: posts.createdAt,
    })
    .from(posts)
    .where(and(
      eq(posts.status, "published"),
      or(like(posts.title, `%${q}%`), like(posts.summary ?? "", `%${q}%`)),
    ))
    .orderBy(desc(posts.createdAt))
    .limit(10);

  return NextResponse.json(results);
}
