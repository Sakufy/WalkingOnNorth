import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/comments/[id] — moderate (approve/reject)
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
  if (body.status && ["approved", "rejected"].includes(body.status)) {
    updates.status = body.status;
  }
  if (body.isHighValue !== undefined) {
    updates.isHighValue = !!body.isHighValue;
  }

  const [updated] = await db
    .update(comments)
    .set(updates)
    .where(eq(comments.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "评论不存在" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/comments/[id] — admin delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "评论不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
