// SQLite migration using Node.js built-in sqlite (available since Node 22.5)
import { DatabaseSync } from "node:sqlite";

const DB_PATH = "local.db";

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_high_value INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    section TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    section TEXT NOT NULL,
    topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
    tags TEXT,
    cover_image TEXT,
    current_version_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    is_featured INTEGER NOT NULL DEFAULT 0,
    reading_time INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS post_versions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS paragraphs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    p_order INTEGER NOT NULL,
    p_hash TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paragraph_id TEXT,
    type TEXT NOT NULL DEFAULT 'end',
    content TEXT NOT NULL,
    selected_text TEXT,
    char_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    is_high_value INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

for (const stmt of TABLES) {
  db.exec(stmt);
  console.log("Created:", stmt.slice(0, 50).replace(/\n/g, " ") + "...");
}

console.log("\n✅ All 8 tables created!");

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
console.log("Tables:", tables.map((t) => t.name).join(", "));

// Seed default topics
const DEFAULT_TOPICS: [string, string, string, string, number][] = [
  ["t-explore-1", "自我认知", "了解自己的思维模式与价值观", "explore", 1],
  ["t-explore-2", "人生哲学", "探索人生意义与存在方式", "explore", 2],
  ["t-explore-3", "三观构建", "建立个人世界观与价值体系", "explore", 3],
  ["t-explore-4", "成长经历", "回顾与反思个人成长历程", "explore", 4],
  ["t-improve-1", "学习底层原理", "理解学习的本质与高效方法", "improve", 1],
  ["t-improve-2", "高效方法论", "实用工具与思维框架", "improve", 2],
  ["t-improve-3", "时间管理", "精力分配与优先级决策", "improve", 3],
  ["t-improve-4", "任务拆解工具", "复杂问题的分解与执行", "improve", 4],
  ["t-realize-1", "北行独元理论", "构建个人独特价值主张", "realize", 1],
  ["t-realize-2", "AI 实战应用", "AI 时代的个人能力提升", "realize", 2],
  ["t-realize-3", "内容创作", "创作方法论与实践经验", "realize", 3],
  ["t-realize-4", "价值交换体系", "从输出到价值实现的路径", "realize", 4],
];

const insertTopic = db.prepare(
  "INSERT OR IGNORE INTO topics (id, name, description, section, sort_order, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
);
for (const [id, name, desc, section, order] of DEFAULT_TOPICS) {
  insertTopic.run(id, name, desc, section, order);
}
console.log("✅ Default topics seeded:", DEFAULT_TOPICS.length);

// Seed default pages
const insertPage = db.prepare(
  "INSERT OR IGNORE INTO pages (slug, title, content, updated_at) VALUES (?, ?, ?, datetime('now'))"
);
insertPage.run("home", "首页内容", "");
insertPage.run("about", "关于页", "");
console.log("✅ Default pages seeded: home, about");

db.close();
