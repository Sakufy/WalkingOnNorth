import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { comments, users, posts } from "@/lib/db/schema";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const LONG_COMMENT_THRESHOLD = 200;

// GET /api/comments — list with filters
export async function GET(request: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const status = searchParams.get("status") ?? "";
  const postId = searchParams.get("postId") ?? "";
  const search = searchParams.get("search") ?? "";

  // Public can read approved comments for a post; admin required for pending/all
  const isPublicRead = postId && status === "approved";
  if (!isPublicRead && (!session?.user || session.user.role !== "admin")) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const conditions = [];

  if (status) {
    conditions.push(eq(comments.status, status as "pending" | "approved" | "rejected"));
  }
  if (postId) {
    conditions.push(eq(comments.postId, postId));
  }
  if (search) {
    conditions.push(like(comments.content, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(where);

  const total = totalResult?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  const items = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      paragraphId: comments.paragraphId,
      type: comments.type,
      content: comments.content,
      status: comments.status,
      isHighValue: comments.isHighValue,
      charCount: comments.charCount,
      createdAt: comments.createdAt,
      userName: users.nickname,
      articleTitle: posts.title,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(posts, eq(comments.postId, posts.id))
    .where(where)
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return NextResponse.json({ items, total, page, limit, totalPages });
}

// POST /api/comments — create a comment
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { postId, paragraphId, content } = await request.json();

  if (!postId || !content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 });
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: "评论内容过长" }, { status: 400 });
  }

  // Long comments (≥200 chars) auto-approved
  const autoApproved = content.trim().length >= LONG_COMMENT_THRESHOLD;

  const [comment] = await db
    .insert(comments)
    .values({
      id: uuidv4(),
      postId,
      userId: session.user.id as string,
      paragraphId: paragraphId ?? null,
      type: paragraphId ? "paragraph" : "end",
      content: content.trim(),
      selectedText: null,
      charCount: content.trim().length,
      status: autoApproved ? "approved" : "pending",
    })
    .returning();

  return NextResponse.json({ ...comment, autoApproved }, { status: 201 });
}
