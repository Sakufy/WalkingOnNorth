import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

/** GET /api/page-sections?page=home — list sections (public) */
export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page");
  if (!page || !["home", "about"].includes(page)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  const sections = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.pageSlug, page as "home" | "about"))
    .orderBy(asc(pageSections.sortOrder));

  return NextResponse.json(sections);
}

/** POST /api/page-sections — create section (admin only) */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { pageSlug, type, title, content } = body;

  if (!pageSlug || !["home", "about"].includes(pageSlug)) {
    return NextResponse.json({ error: "Invalid pageSlug" }, { status: 400 });
  }
  if (!type || !["hero", "audience_item", "section_heading", "text_block"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Auto-increment sort order
  const existing = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.pageSlug, pageSlug))
    .orderBy(asc(pageSections.sortOrder));

  const sortOrder = existing.length > 0 ? (existing[existing.length - 1].sortOrder ?? 0) + 1 : 0;

  const id = randomUUID();
  const now = new Date().toISOString();

  await db.insert(pageSections).values({
    id,
    pageSlug,
    type,
    title: title ?? "",
    content: content ?? "",
    sortOrder,
    createdAt: now,
    updatedAt: now,
  });

  const [created] = await db.select().from(pageSections).where(eq(pageSections.id, id)).limit(1);
  return NextResponse.json(created, { status: 201 });
}
