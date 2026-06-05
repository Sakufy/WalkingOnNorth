// ========================================
// 北行之路 · 类型导出
// ========================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  createdAt: Date;
}

export interface Article {
  id: number;
  title: string;
  htmlContent: string;
  category: "self-discovery" | "self-improvement" | "self-actualization";
  status: "draft" | "published";
  isFeatured: boolean;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleVersion {
  id: number;
  articleId: number;
  htmlContent: string;
  versionNumber: number;
  changeSummary: string | null;
  createdAt: Date;
}

export interface Comment {
  id: number;
  articleId: number;
  userId: number;
  paragraphId: number | null;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  htmlContent: string | null;
  updatedAt: Date;
}

export type CategorySlug =
  | "self-discovery"
  | "self-improvement"
  | "self-actualization";

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  "self-discovery": "自我探索",
  "self-improvement": "自我提升",
  "self-actualization": "自我实现",
};
