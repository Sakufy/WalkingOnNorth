import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";

// GET /api/pages — list all page slots
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const items = await db.select().from(pages).orderBy(pages.slug);

  return NextResponse.json(items);
}
