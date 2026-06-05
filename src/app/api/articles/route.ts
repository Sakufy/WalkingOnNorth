import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, like, and, desc, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/articles
 * List articles with pagination and filtering
 * Query params: page, limit, status, section, search, featured
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const status = searchParams.get("status") as "draft" | "published" | null;
  const section = searchParams.get("section") as
    | "explore"
    | "improve"
    | "realize"
    | null;
  const search = searchParams.get("search") ?? "";
  const featured = searchParams.get("featured");

  const conditions = [];

  if (status) {
    conditions.push(eq(posts.status, status));
  }
  if (section) {
    conditions.push(eq(posts.section, section));
  }
  if (search) {
    conditions.push(like(posts.title, `%${search}%`));
  }
  if (featured === "true") {
    conditions.push(eq(posts.isFeatured, true));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(posts)
    .where(where);
  const total = totalResult?.count ?? 0;

  const items = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      section: posts.section,
      status: posts.status,
      isFeatured: posts.isFeatured,
      readingTime: posts.readingTime,
      sortOrder: posts.sortOrder,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(where)
    .orderBy(desc(posts.updatedAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

/**
 * POST /api/articles
 * Create a new article (draft by default)
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { title, section, topicId } = body;

  if (!title || !section) {
    return NextResponse.json(
      { error: "标题和板块为必填项" },
      { status: 400 }
    );
  }

  const validSections = ["explore", "improve", "realize"];
  if (!validSections.includes(section)) {
    return NextResponse.json(
      { error: "无效的板块" },
      { status: 400 }
    );
  }

  const id = uuidv4();
  // slug = id prefix until explicitly set
  const slug = id.slice(0, 8);

  const [post] = await db
    .insert(posts)
    .values({
      id,
      slug,
      title,
      section,
      topicId: topicId || null,
      status: "draft",
      isFeatured: false,
      readingTime: 1,
    })
    .returning();

  return NextResponse.json(post, { status: 201 });
}
