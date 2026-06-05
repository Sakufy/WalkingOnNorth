import { hash } from "bcryptjs";
import postgres from "postgres";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:password@localhost:5432/beixingzhilu";

async function main() {
  const sql = postgres(DATABASE_URL);

  const email = "admin@beixingzhilu.com";
  const name = "北行之路";
  const password = "beixing123";
  const passwordHash = await hash(password, 12);

  // Check if admin already exists
  const [existing] = await sql<{ id: number }[]>`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `;

  if (existing) {
    console.log("管理员已存在，更新密码...");
    await sql`
      UPDATE users SET password_hash = ${passwordHash}, role = 'admin' WHERE email = ${email}
    `;
  } else {
    console.log("创建管理员账号...");
    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, 'admin')
    `;
  }

  console.log("✅ 管理员账号已就绪！");
  console.log("   邮箱:", email);
  console.log("   密码:", password);
  console.log("   角色: admin");

  await sql.end();
}

main().catch((err) => {
  console.error("❌ 种子脚本失败:", err);
  process.exit(1);
});
