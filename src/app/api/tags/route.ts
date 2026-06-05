import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, and, not, sql } from "drizzle-orm";

/**
 * GET /api/tags?section=explore
 * Public: returns unique tags used in a section (excluding empty/null).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const validSections = ["explore", "improve", "realize"] as const;
  type DbSection = (typeof validSections)[number];
  const isValid = section && validSections.includes(section as DbSection);

  const where = isValid
    ? and(eq(posts.section, section as DbSection), eq(posts.status, "published"))
    : eq(posts.status, "published");

  const rows = await db
    .select({ tags: posts.tags })
    .from(posts)
    .where(and(where, not(sql`${posts.tags} IS NULL`), not(sql`${posts.tags} = ''`)));

  const tagSet = new Set<string>();
  for (const row of rows) {
    if (!row.tags) continue;
    row.tags.split(",").forEach((t) => tagSet.add(t.trim()));
  }

  return NextResponse.json([...tagSet].filter(Boolean).sort());
}
