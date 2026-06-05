/**
 * Set a user as admin in Turso.
 * Usage: $env:DATABASE_URL=... $env:TURSO_AUTH_TOKEN=... ; npx tsx scripts/set-admin.ts
 */
import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";
import { eq, sql } from "drizzle-orm";
import { users } from "../src/lib/db/schema";

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });
  const db = drizzle(client);

  const email = process.argv[2] || "2634856820@qq.com";

  const result = await db
    .update(users)
    .set({ role: "admin", nickname: "路行北", updatedAt: new Date().toISOString() })
    .where(eq(users.email, email))
    .returning();

  if (result.length === 0) {
    console.error(`User ${email} not found`);
    process.exit(1);
  }

  console.log(`✅ ${email} is now admin (role: ${result[0].role}, nickname: ${result[0].nickname})`);
  process.exit(0);
}

main();
