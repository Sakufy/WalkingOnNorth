/**
 * Push Drizzle schema to Turso via raw SQL.
 * Use: $env:DATABASE_URL=... $env:TURSO_AUTH_TOKEN=... ; npx tsx scripts/push-turso.ts
 */
import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";

const createStatements = [
  // users
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_high_value INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // topics
  `CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    section TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // posts
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
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // post_versions
  `CREATE TABLE IF NOT EXISTS post_versions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // paragraphs
  `CREATE TABLE IF NOT EXISTS paragraphs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    p_order INTEGER NOT NULL,
    p_hash TEXT NOT NULL
  )`,

  // comments
  `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paragraph_id TEXT,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    selected_text TEXT,
    char_count INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    is_high_value INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // likes
  `CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // pages
  `CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  // page_sections
  `CREATE TABLE IF NOT EXISTS page_sections (
    id TEXT PRIMARY KEY,
    page_slug TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });
  const db = drizzle(client);

  console.log(`Connecting to: ${process.env.DATABASE_URL}`);
  console.log("Pushing schema to Turso...\n");

  for (const stmt of createStatements) {
    try {
      await db.run(sql.raw(stmt));
      const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] ?? "?";
      console.log(`  ✓ ${tableName}`);
    } catch (err: any) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log("\nSchema push complete.");
  process.exit(0);
}

main();
