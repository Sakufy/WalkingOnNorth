import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** PATCH /api/page-sections/[id] — update section (admin only) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, content, sortOrder, type } = body;

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  if (type !== undefined) updateData.type = type;

  await db.update(pageSections).set(updateData).where(eq(pageSections.id, id));

  const [updated] = await db.select().from(pageSections).where(eq(pageSections.id, id)).limit(1);
  return NextResponse.json(updated);
}

/** DELETE /api/page-sections/[id] — delete section (admin only) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await db.delete(pageSections).where(eq(pageSections.id, id));
  return NextResponse.json({ success: true });
}
