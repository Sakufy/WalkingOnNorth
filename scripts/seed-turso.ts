/**
 * Seed admin user to Turso production database.
 * Usage: $env:DATABASE_URL=... $env:TURSO_AUTH_TOKEN=... ; npx tsx scripts/seed-turso.ts
 */
import { createClient } from "@libsql/client/node";
import { hash } from "bcryptjs";

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

  const email = "admin@beixingzhilu.com";
  const name = "北行之路";
  const password = process.env.ADMIN_PASSWORD ?? "beixing123";
  const passwordHash = await hash(password, 12);
  const now = new Date().toISOString();

  // Check if admin exists
  const existing = await client.execute({
    sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });

  if (existing.rows.length > 0) {
    console.log("管理员已存在，更新密码...");
    await client.execute({
      sql: "UPDATE users SET password_hash = ?, role = 'admin' WHERE email = ?",
      args: [passwordHash, email],
    });
  } else {
    console.log("创建管理员账号...");
    const uuid = crypto.randomUUID();
    await client.execute({
      sql: "INSERT INTO users (id, nickname, email, password_hash, role, is_high_value, created_at) VALUES (?, ?, ?, ?, 'admin', 0, ?)",
      args: [uuid, name, email, passwordHash, now],
    });
  }

  console.log("✅ 管理员账号已就绪！");
  console.log("   邮箱:", email);
  console.log("   密码:", password);
  console.log("   角色: admin");
}

main().catch((err) => {
  console.error("❌ 失败:", err);
  process.exit(1);
});
