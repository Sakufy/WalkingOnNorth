import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postVersions, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/articles/[id]/versions
 * Public: list version metadata for an article (no content).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  // Get current version ID
  const [post] = await db
    .select({ currentVersionId: posts.currentVersionId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  const versions = await db
    .select({
      id: postVersions.id,
      versionNumber: postVersions.versionNumber,
      changeSummary: postVersions.changeSummary,
      createdAt: postVersions.createdAt,
    })
    .from(postVersions)
    .where(eq(postVersions.postId, postId))
    .orderBy(desc(postVersions.versionNumber));

  return NextResponse.json(
    versions.map((v) => ({
      ...v,
      isCurrent: v.id === post?.currentVersionId,
    }))
  );
}
