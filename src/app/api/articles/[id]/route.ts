import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, postVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/articles/[id]
 * Get single article with latest version content
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // Fetch latest version content
  const [latestVersion] = await db
    .select()
    .from(postVersions)
    .where(eq(postVersions.postId, id))
    .orderBy(desc(postVersions.versionNumber))
    .limit(1);

  return NextResponse.json({
    ...post,
    content: latestVersion?.content ?? "",
  });
}

/**
 * PATCH /api/articles/[id]
 * Update post metadata (title, section, summary, isFeatured, status)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }
    updates.title = body.title;
  }

  if (body.section !== undefined) {
    const valid = ["explore", "improve", "realize"];
    if (!valid.includes(body.section)) {
      return NextResponse.json({ error: "无效的板块" }, { status: 400 });
    }
    updates.section = body.section;
  }

  if (body.summary !== undefined) {
    updates.summary = String(body.summary);
  }

  if (body.topicId !== undefined) {
    updates.topicId = body.topicId || null;
  }

  if (body.tags !== undefined) {
    updates.tags = String(body.tags);
  }

  if (body.coverImage !== undefined) {
    updates.coverImage = String(body.coverImage);
  }

  if (body.isFeatured !== undefined) {
    updates.isFeatured = !!body.isFeatured;
  }

  if (body.status !== undefined) {
    if (!["draft", "published"].includes(body.status)) {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.sortOrder !== undefined) {
    updates.sortOrder = Number(body.sortOrder);
  }

  updates.updatedAt = new Date().toISOString();

  const [updated] = await db
    .update(posts)
    .set(updates)
    .where(eq(posts.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

/**
 * DELETE /api/articles/[id]
 * Delete an article (cascades to versions, paragraphs, comments)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  await db.delete(posts).where(eq(posts.id, id));

  return NextResponse.json({ success: true });
}
