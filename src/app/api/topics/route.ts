import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";



/** GET /api/topics */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const section = searchParams.get("section");
  const validSections = ["explore", "improve", "realize"] as const;
  type DbSection = (typeof validSections)[number];
  const filtered = section && validSections.includes(section as DbSection) ? section as DbSection : null;

  const conditions = filtered ? [eq(topics.section, filtered)] : [];

  const items = await db
    .select()
    .from(topics)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(asc(topics.sortOrder));

  return NextResponse.json(items);
}

/** POST /api/topics */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, section } = body;

  if (!name || !section) {
    return NextResponse.json({ error: "名称和板块为必填项" }, { status: 400 });
  }

  const validSections = ["explore", "improve", "realize"];
  if (!validSections.includes(section)) {
    return NextResponse.json({ error: "无效的板块" }, { status: 400 });
  }

  const [topic] = await db
    .insert(topics)
    .values({
      id: crypto.randomUUID(),
      name,
      description: description ?? null,
      section,
      sortOrder: 0,
    })
    .returning();

  return NextResponse.json(topic, { status: 201 });
}
