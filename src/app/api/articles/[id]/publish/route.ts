import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, postVersions, paragraphs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { injectParagraphAnchors, estimateReadingTime } from "@/lib/paragraph";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * POST /api/articles/[id]/publish
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: postId } = await params;

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    const body = await request.json();
    const htmlContent: string = body.content ?? "";

    if (!htmlContent) {
      return NextResponse.json({ error: "文章内容为空" }, { status: 400 });
    }

    const cleanHtml = await sanitizeHtml(htmlContent);
    const { html: annotatedHtml, anchors } = injectParagraphAnchors(cleanHtml, postId);
    const readingTime = estimateReadingTime(annotatedHtml);

    const [maxVersionResult] = await db
      .select({ maxVersion: sql<number>`COALESCE(MAX(version_number), 0)` })
      .from(postVersions)
      .where(eq(postVersions.postId, postId));
    const nextVersion = (maxVersionResult?.maxVersion ?? 0) + 1;

    await db
      .update(posts)
      .set({ status: "published", readingTime, updatedAt: new Date().toISOString() })
      .where(eq(posts.id, postId));

    const versionId = crypto.randomUUID();
    await db.insert(postVersions).values({
      id: versionId, postId, content: annotatedHtml,
      versionNumber: nextVersion,
      changeSummary: body.changeSummary ?? null,
      createdAt: new Date().toISOString(),
    });

    await db.update(posts).set({ currentVersionId: versionId }).where(eq(posts.id, postId));

    await db.delete(paragraphs).where(eq(paragraphs.postId, postId));
    if (anchors.length > 0) {
      await db.insert(paragraphs).values(
        anchors.map((a) => ({ postId, pOrder: a.pOrder, pHash: a.pHash }))
      );
    }

    return NextResponse.json({ version: nextVersion, paragraphCount: anchors.length });
  } catch (err: any) {
    console.error("Publish error:", err);
    return NextResponse.json({ error: err.message || "发布失败" }, { status: 500 });
  }
}
