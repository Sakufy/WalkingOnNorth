const { createClient } = require("@libsql/client");
const { hashSync } = require("bcryptjs");
const { randomUUID } = require("crypto");

const client = createClient({ url: "file:local.db" });

async function main() {
  const sql = client;

  // Create tables
  await sql.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' NOT NULL,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL
    )
  `);

  await sql.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      html_content TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'draft' NOT NULL,
      is_featured INTEGER DEFAULT 0 NOT NULL,
      reading_time INTEGER DEFAULT 1 NOT NULL,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')) NOT NULL
    )
  `);

  await sql.execute(`
    CREATE TABLE IF NOT EXISTS article_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      html_content TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      change_summary TEXT,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL
    )
  `);

  await sql.execute(`
    CREATE TABLE IF NOT EXISTS paragraphs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      p_order INTEGER NOT NULL,
      p_hash TEXT NOT NULL
    )
  `);

  await sql.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      paragraph_id INTEGER REFERENCES paragraphs(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL
    )
  `);

  await sql.execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      html_content TEXT,
      updated_at TEXT DEFAULT (datetime('now')) NOT NULL
    )
  `);

  await sql.execute(`
    CREATE TABLE IF NOT EXISTS page_sections (
      id TEXT PRIMARY KEY,
      page_slug TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')) NOT NULL
    )
  `);

  // Create admin user
  const passwordHash = hashSync("beixing123", 12);
  const r = await sql.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: ["admin@beixingzhilu.com"],
  });

  if (r.rows.length > 0) {
    await sql.execute({
      sql: "UPDATE users SET password_hash = ?, role = 'admin' WHERE email = ?",
      args: [passwordHash, "admin@beixingzhilu.com"],
    });
    console.log("updated admin");
  } else {
    await sql.execute({
      sql: "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      args: ["北行之路", "admin@beixingzhilu.com", passwordHash, "admin"],
    });
    console.log("created admin");
  }

  console.log("DONE: admin@beixingzhilu.com / beixing123");

  // Seed default page sections for home and about
  const now = new Date().toISOString();
  const homeSections = [
    { type: "hero", title: "慢下来，想清楚，\n然后写出来。", content: "这是一个关于思考、阅读与行走的写作空间。不快，不急，不迎合算法。只是把真正值得写下来的东西写下来。", sort: 0 },
    { type: "audience_item", title: "喜欢慢读的人", content: "每篇文章都有版本记录。你可以看到一篇文章如何从初稿变成现在的样子，以及我为什么改。", sort: 1 },
    { type: "audience_item", title: "喜欢在书边写字的人", content: "每一段都可以留下批注。不是公开评论区，是更私密一些的、针对某一段话的对话。", sort: 2 },
    { type: "audience_item", title: "不喜欢被打断的人", content: "没有推送、没有通知、没有弹窗。文章就在这里，你来了就可以读，不来也不会被催。", sort: 3 },
    { type: "audience_item", title: "相信写作是思考的人", content: "我在写的过程中弄清楚我的想法。这里的文章不是结论，是过程的记录。", sort: 4 },
  ];

  const aboutSections = [
    { type: "text_block", title: "为什么叫北行之路", content: "北，是方向，不是目的地。路，是过程，不是终点。这个名字是一种提醒——我在走，但我不确定走向哪里，我只是继续走。", sort: 0 },
    { type: "text_block", title: "这里写什么", content: "三个板块：思想笔记，是我试图把脑子里模糊的感受弄清楚的过程；阅读摘录，是那些让我停下来的句子和段落；长路纪行，是走过的地方留下来的侧记。", sort: 1 },
    { type: "text_block", title: "段评和版本", content: "每篇文章都有版本历史——我相信写作是一个迭代的过程，让读者看到修改本身是有意义的。每一段文字都可以留下批注，不是公开的广场，是更私密一点的对话空间。", sort: 2 },
    { type: "text_block", title: "联系", content: "如果你想说什么，可以在文章段落里留言，或者通过邮件联系。我读每一封邮件，但回复可能很慢。", sort: 3 },
  ];

  // Only seed if table is empty
  const existing = await sql.execute("SELECT COUNT(*) as cnt FROM page_sections");
  if (existing.rows[0].cnt === 0) {
    for (const s of homeSections) {
      await sql.execute({
        sql: "INSERT INTO page_sections (id, page_slug, type, title, content, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [randomUUID(), "home", s.type, s.title, s.content, s.sort, now, now],
      });
    }
    for (const s of aboutSections) {
      await sql.execute({
        sql: "INSERT INTO page_sections (id, page_slug, type, title, content, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [randomUUID(), "about", s.type, s.title, s.content, s.sort, now, now],
      });
    }
    console.log("seeded page_sections (home + about)");
  }

  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
