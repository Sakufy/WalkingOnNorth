import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sanitizeHtml } from "@/lib/sanitize";

// GET /api/pages/[slug] — get single page
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  if (!page) {
    return NextResponse.json({ error: "页面不存在" }, { status: 404 });
  }

  return NextResponse.json(page);
}

// PUT /api/pages/[slug] — update page content (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { slug } = await params;
  const { title, content } = await request.json();

  // Sanitize if HTML content provided
  let cleanHtml: string | undefined;
  if (content !== undefined) {
    cleanHtml = content === "" ? "" : await sanitizeHtml(content);
  }

  // Upsert: insert if not exists, update if exists
  const [existing] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  if (existing) {
    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (cleanHtml !== undefined) updateData.content = cleanHtml;

    const [updated] = await db
      .update(pages)
      .set(updateData)
      .where(eq(pages.id, existing.id))
      .returning();

    return NextResponse.json(updated);
  }

  // Insert new page slot
  const [created] = await db
    .insert(pages)
    .values({
      slug,
      title: title ?? slug,
      content: cleanHtml ?? "",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
