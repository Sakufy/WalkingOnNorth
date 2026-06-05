import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postVersions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/articles/[id]/versions/[versionId]
 * Public: get a specific version's HTML content.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { versionId } = await params;

  const [version] = await db
    .select({ content: postVersions.content })
    .from(postVersions)
    .where(eq(postVersions.id, versionId))
    .limit(1);

  if (!version) {
    return NextResponse.json({ error: "版本不存在" }, { status: 404 });
  }

  return NextResponse.json({ content: version.content });
}
