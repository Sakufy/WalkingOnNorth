"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Pencil, History, Trash2, Star, GitCompare } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  section: "explore" | "improve" | "realize";
  status: "draft" | "published";
  isFeatured: boolean;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
};

const SECTION_LABELS: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
};

export default function AdminArticlesPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const limit = 20;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (sectionFilter) params.set("section", sectionFilter);

    const res = await fetch(`/api/articles?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search, statusFilter, sectionFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/articles/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteTarget(null);
      fetchPosts();
    }
    setDeleting(false);
  };

  const handleToggleFeatured = async (post: Post) => {
    await fetch(`/api/articles/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !post.isFeatured }),
    });
    fetchPosts();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}
        >
          文章管理
        </h1>
        <Link href="/admin/articles/new">
          <Button
            className="inline-flex items-center gap-2 rounded-full px-6"
            style={{
              backgroundColor: "#2D2A26",
              color: "#F5F1EB",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A67C52")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2D2A26")}
          >
            <Plus size={18} />
            新建文章
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#9C9590" }}
          />
          <Input
            placeholder="搜索标题…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 border-0 border-b rounded-none"
            style={{
              borderColor: "#9C9590",
              backgroundColor: "transparent",
              color: "#2D2A26",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-md border text-sm"
          style={{
            borderColor: "#9C9590",
            backgroundColor: "transparent",
            color: "#2D2A26",
          }}
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
        </select>
        <select
          value={sectionFilter}
          onChange={(e) => {
            setSectionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-md border text-sm"
          style={{
            borderColor: "#9C9590",
            backgroundColor: "transparent",
            color: "#2D2A26",
          }}
        >
          <option value="">全部板块</option>
          <option value="explore">自我探索</option>
          <option value="improve">自我提升</option>
          <option value="realize">自我实现</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16" style={{ color: "#9C9590" }}>
          加载中…
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p
            className="text-lg mb-2"
            style={{ fontFamily: '"Noto Serif SC", serif', color: "#9C9590" }}
          >
            还没有文章
          </p>
          <p className="text-sm" style={{ color: "#9C9590" }}>
            写下你的第一篇，开始北行。
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#E8E3DC" }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: "#E8E3DC" }}>
                <TableHead style={{ color: "#2D2A26", fontWeight: 600 }}>标题</TableHead>
                <TableHead style={{ color: "#2D2A26", fontWeight: 600 }}>板块</TableHead>
                <TableHead style={{ color: "#2D2A26", fontWeight: 600 }}>状态</TableHead>
                <TableHead style={{ color: "#2D2A26", fontWeight: 600 }}>更新时间</TableHead>
                <TableHead style={{ color: "#2D2A26", fontWeight: 600 }} className="text-right">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow
                  key={post.id}
                  style={{ borderColor: "#E8E3DC" }}
                  className="hover:bg-[#F5F1EB] transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/articles/${post.id}/edit`}
                        className="font-medium hover:underline"
                        style={{ color: "#2D2A26" }}
                      >
                        {post.title}
                      </Link>
                      {post.isFeatured && (
                        <Star size={14} style={{ color: "#A67C52" }} fill="#A67C52" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded px-2 py-0.5 text-xs"
                      style={{
                        borderColor: "#9C9590",
                        color: "#2D2A26",
                        backgroundColor: "transparent",
                      }}
                    >
                      {SECTION_LABELS[post.section]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          post.status === "published" ? "#6B8F5E20" : "#C49A3C20",
                        color: post.status === "published" ? "#6B8F5E" : "#C49A3C",
                      }}
                    >
                      {STATUS_LABELS[post.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm" style={{ color: "#9C9590" }}>
                    {post.updatedAt
                      ? new Date(post.updatedAt).toLocaleDateString("zh-CN")
                      : new Date(post.createdAt).toLocaleDateString("zh-CN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="编辑"
                        onClick={() => router.push(`/admin/articles/${post.id}/edit`)}
                        className="p-1.5 rounded hover:bg-[#F5F1EB] transition-colors"
                        style={{ color: "#9C9590" }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        title="版本历史"
                        onClick={() => router.push(`/admin/articles/${post.id}/versions`)}
                        className="p-1.5 rounded hover:bg-[#F5F1EB] transition-colors"
                        style={{ color: "#9C9590" }}
                      >
                        <History size={16} />
                      </button>
                      <button
                        type="button"
                        title="版本对比"
                        onClick={() => router.push(`/admin/articles/${post.id}/diff`)}
                        className="p-1.5 rounded hover:bg-[#F5F1EB] transition-colors"
                        style={{ color: "#9C9590" }}
                      >
                        <GitCompare size={16} />
                      </button>
                      <button
                        type="button"
                        title={post.isFeatured ? "取消精选" : "设为精选"}
                        onClick={() => handleToggleFeatured(post)}
                        className="p-1.5 rounded hover:bg-[#F5F1EB] transition-colors"
                        style={{ color: post.isFeatured ? "#A67C52" : "#9C9590" }}
                      >
                        <Star size={16} fill={post.isFeatured ? "#A67C52" : "none"} />
                      </button>
                      <button
                        type="button"
                        title="删除"
                        onClick={() => setDeleteTarget(post)}
                        className="p-1.5 rounded hover:bg-[#F5F1EB] transition-colors"
                        style={{ color: "#9C9590" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className="px-3 py-1 rounded text-sm transition-colors"
              style={{
                backgroundColor: p === page ? "#2D2A26" : "transparent",
                color: p === page ? "#F5F1EB" : "#9C9590",
                border: p === page ? "none" : "1px solid #E8E3DC",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除「{deleteTarget?.title}」吗？此操作不可撤销，将同时删除所有版本、段落和评论。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="rounded-full"
              style={{ borderColor: "#9C9590", color: "#2D2A26" }}
            >
              取消
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full"
              style={{
                backgroundColor: "#B85450",
                color: "#F5F1EB",
              }}
            >
              {deleting ? "删除中…" : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
