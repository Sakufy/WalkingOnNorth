import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, postVersions, paragraphs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { injectParagraphAnchors, estimateReadingTime } from "@/lib/paragraph";

/**
 * POST /api/articles/[id]/publish
 * Publish an article:
 * 1. Receive HTML content from request body
 * 2. Sanitize HTML
 * 3. Inject paragraph anchors
 * 4. Calculate reading time
 * 5. Update post status + computed fields
 * 6. Create version snapshot
 * 7. Sync paragraphs table
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id: postId } = await params;

  // Check post exists
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // Get HTML content from request body
  const body = await request.json();
  const htmlContent: string = body.content ?? "";

  if (!htmlContent) {
    return NextResponse.json({ error: "文章内容为空" }, { status: 400 });
  }

  // 1. Sanitize HTML (dynamic import to avoid Turbopack build-time bundling)
  const { sanitizeHtml } = await import("@/lib/sanitize");
  const cleanHtml = await sanitizeHtml(htmlContent);

  // 2. Inject paragraph anchors
  const { html: annotatedHtml, anchors } = injectParagraphAnchors(
    cleanHtml,
    postId
  );

  // 3. Calculate reading time
  const readingTime = estimateReadingTime(annotatedHtml);

  // 4. Get next version number
  const [maxVersionResult] = await db
    .select({ maxVersion: sql<number>`COALESCE(MAX(version_number), 0)` })
    .from(postVersions)
    .where(eq(postVersions.postId, postId));
  const nextVersion = (maxVersionResult?.maxVersion ?? 0) + 1;

  // 5. Update post metadata
  const [updated] = await db
    .update(posts)
    .set({
      status: "published",
      readingTime,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.id, postId))
    .returning();

  // 6. Create version snapshot
  const versionId = crypto.randomUUID();
  await db.insert(postVersions).values({
    id: versionId,
    postId,
    content: annotatedHtml,
    versionNumber: nextVersion,
    changeSummary: body.changeSummary ?? null,
    createdAt: new Date().toISOString(),
  });

  // 7. Update current version reference on post
  await db
    .update(posts)
    .set({ currentVersionId: versionId })
    .where(eq(posts.id, postId));

  // 8. Sync paragraphs: delete old, insert new
  await db.delete(paragraphs).where(eq(paragraphs.postId, postId));
  if (anchors.length > 0) {
    await db.insert(paragraphs).values(
      anchors.map((a) => ({
        postId,
        pOrder: a.pOrder,
        pHash: a.pHash,
      }))
    );
  }

  return NextResponse.json({
    post: updated,
    version: nextVersion,
    paragraphCount: anchors.length,
  });
}
