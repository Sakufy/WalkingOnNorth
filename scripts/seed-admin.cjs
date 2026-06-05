const { hash } = require("bcryptjs");

async function main() {
  const postgres = require("postgres");
  const DATABASE_URL =
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/beixingzhilu";

  console.log("Connecting to:", DATABASE_URL.replace(/\/\/.*@/, "//***@"));

  let sql;
  try {
    sql = postgres(DATABASE_URL, { connect_timeout: 10 });
    console.log("Connection created, testing...");
    const result = await sql`SELECT 1 AS test`;
    console.log("DB OK:", result);
  } catch (e) {
    console.error("DB CONNECT FAILED:", String(e));
    console.error("Code:", e.code, "Errno:", e.errno);
    console.error("请确认 PostgreSQL 已启动，且数据库 beixingzhilu 已创建");
    process.exit(1);
  }

  const email = "admin@beixingzhilu.com";
  const name = "北行之路";
  const password = "beixing123";
  const passwordHash = await hash(password, 12);

  try {
    const [existing] = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existing) {
      console.log("exists, updating...");
      await sql`
        UPDATE users SET password_hash = ${passwordHash}, role = 'admin'
        WHERE email = ${email}
      `;
    } else {
      console.log("creating...");
      await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${name}, ${email}, ${passwordHash}, 'admin')
      `;
    }

    console.log("OK: admin@beixingzhilu.com / beixing123");
  } catch (e) {
    console.error("DB WRITE FAILED:", e.message);
    process.exit(1);
  }

  await sql.end();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
