import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, like } from "drizzle-orm";
import { sql } from "drizzle-orm";

/** GET /api/users */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? "";

  let items;
  if (search) {
    items = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        email: users.email,
        role: users.role,
        isHighValue: users.isHighValue,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(like(users.nickname, `%${search}%`))
      .orderBy(desc(users.createdAt))
      .limit(50);
  } else {
    items = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        email: users.email,
        role: users.role,
        isHighValue: users.isHighValue,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(50);
  }

  return NextResponse.json(items);
}
