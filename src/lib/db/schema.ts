import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ========================================
// users
// ========================================

export const users = sqliteTable("users", {
  id: text().primaryKey(), // uuid
  nickname: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text({ enum: ["user", "admin"] })
    .default("user")
    .notNull(),
  isHighValue: integer("is_high_value", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// ========================================
// topics
// ========================================

export const topics = sqliteTable("topics", {
  id: text().primaryKey(), // uuid
  name: text().notNull(),
  description: text(),
  section: text({ enum: ["explore", "improve", "realize"] }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// ========================================
// posts
// ========================================

export const posts = sqliteTable("posts", {
  id: text().primaryKey(), // uuid
  slug: text().notNull().unique(),
  title: text().notNull(),
  summary: text(),
  section: text({ enum: ["explore", "improve", "realize"] }).notNull(),
  topicId: text("topic_id").references(() => topics.id, {
    onDelete: "set null",
  }),
  tags: text(), // JSON array string
  coverImage: text("cover_image"),
  currentVersionId: text("current_version_id"), // FK to post_versions (handled in app)
  status: text({ enum: ["draft", "published"] }).default("draft").notNull(),
  isFeatured: integer("is_featured", { mode: "boolean" })
    .default(false)
    .notNull(),
  readingTime: integer("reading_time").default(1).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// ========================================
// post_versions
// ========================================

export const postVersions = sqliteTable("post_versions", {
  id: text().primaryKey(), // uuid
  postId: text("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  versionNumber: integer("version_number").notNull(),
  content: text().notNull(), // 富文本 HTML
  changeSummary: text("change_summary"),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// ========================================
// paragraphs — 段落锚点索引
// ========================================

export const paragraphs = sqliteTable("paragraphs", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  postId: text("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  pOrder: integer("p_order").notNull(),
  pHash: text("p_hash", { length: 64 }).notNull(),
});

// ========================================
// comments
// ========================================

export const comments = sqliteTable("comments", {
  id: text().primaryKey(), // uuid
  postId: text("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  paragraphId: text("paragraph_id"), // data-p-id string, null = 文末评论
  type: text({ enum: ["paragraph", "end"] }).notNull(),
  content: text().notNull(),
  selectedText: text("selected_text"),
  charCount: integer("char_count").notNull(),
  status: text({ enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
  isHighValue: integer("is_high_value", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// ========================================
// likes
// ========================================

export const likes = sqliteTable("likes", {
  id: text().primaryKey(), // uuid
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  targetType: text("target_type", { enum: ["post", "comment"] }).notNull(),
  targetId: text("target_id").notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// ========================================
// pages (legacy — kept for backward compat)
// ========================================

export const pages = sqliteTable("pages", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  slug: text().notNull().unique(),
  title: text().notNull(),
  content: text(), // rich text HTML or JSON
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// ========================================
// page_sections — block-based CMS content
//
// Each page (home, about) is composed of
// typed, sortable sections. Admin edits
// them via card-based editor in Settings.
// Frontend renders by type + sortOrder.
// ========================================

export const pageSections = sqliteTable("page_sections", {
  id: text().primaryKey(), // uuid
  pageSlug: text("page_slug").notNull(), // 'home' | 'about'
  type: text({
    enum: ["hero", "audience_item", "section_heading", "text_block"],
  }).notNull(),
  title: text().notNull().default(""), // heading text
  content: text().notNull().default(""), // body text
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});
