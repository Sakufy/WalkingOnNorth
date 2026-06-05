"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithCache } from "@/lib/client-cache";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Trash2, Star, Loader2 } from "lucide-react";

type Comment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  isHighValue: boolean;
  charCount: number;
  createdAt: string;
  userName: string;
  articleTitle: string;
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const fetchComments = useCallback(async (skipCache = false) => {
    setLoading(true);
    const statusParam = tab === "pending" ? "?status=pending" : "";
    const cacheKey = `admin_comments_${tab}`;

    const fetcher = async () => {
      const res = await fetch(`/api/comments${statusParam}`);
      if (res.ok) return await res.json();
      throw new Error("Failed");
    };

    try {
      const data = skipCache
        ? await fetcher()
        : await fetchWithCache(cacheKey, fetcher, 60);
      setComments(data.items ?? []);
    } catch {
      // Keep stale data
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApprove = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved" }) });
    fetchComments(true);
  };
  const handleReject = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected" }) });
    fetchComments(true);
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/comments/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchComments(true);
  };
  const handleToggleHighValue = async (comment: Comment) => {
    await fetch(`/api/comments/${comment.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isHighValue: !comment.isHighValue }) });
    fetchComments(true);
  };

  const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "#C49A3C20", color: "#C49A3C", label: "待审核" },
    approved: { bg: "#6B8F5E20", color: "#6B8F5E", label: "已通过" },
    rejected: { bg: "#B8545020", color: "#B85450", label: "已拒绝" },
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1
        className="text-2xl font-semibold mb-8"
        style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}
      >
        评论管理
      </h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">待审核</TabsTrigger>
          <TabsTrigger value="all">全部评论</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {loading ? (
            <div className="text-center py-16" style={{ color: "#9C9590" }}>
              <Loader2 className="animate-spin inline mr-2" size={16} />
              加载中…
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16" style={{ color: "#9C9590" }}>
              暂无待审核评论
            </div>
          ) : (
            <CommentTable
              comments={comments}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={(c) => setDeleteTarget(c)}
              onToggleHighValue={handleToggleHighValue}
            />
          )}
        </TabsContent>

        <TabsContent value="all">
          {loading ? (
            <div className="text-center py-16" style={{ color: "#9C9590" }}>
              <Loader2 className="animate-spin inline mr-2" size={16} />
              加载中…
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16" style={{ color: "#9C9590" }}>
              暂无评论
            </div>
          ) : (
            <CommentTable
              comments={comments}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={(c) => setDeleteTarget(c)}
              onToggleHighValue={handleToggleHighValue}
              showStatus
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "#9C9590" }}>
            确定要删除这条评论吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-full">
              取消
            </Button>
            <Button
              onClick={handleDelete}
              className="rounded-full"
              style={{ backgroundColor: "#B85450", color: "#F5F1EB" }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommentTable({
  comments,
  onApprove,
  onReject,
  onDelete,
  onToggleHighValue,
  showStatus,
}: {
  comments: Comment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (c: Comment) => void;
  onToggleHighValue: (c: Comment) => void;
  showStatus?: boolean;
}) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#E8E3DC" }}>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#E8E3DC" }}>
            <TableHead style={{ color: "#2D2A26" }}>评论内容</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>文章</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>用户</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>字数</TableHead>
            {showStatus && <TableHead style={{ color: "#2D2A26" }}>状态</TableHead>}
            <TableHead style={{ color: "#2D2A26" }}>时间</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((c) => (
            <TableRow key={c.id} style={{ borderColor: "#E8E3DC" }}>
              <TableCell className="max-w-xs">
                <p className="truncate text-sm" style={{ color: "#2D2A26" }}>
                  {c.content.length > 80 ? c.content.slice(0, 80) + "…" : c.content}
                </p>
              </TableCell>
              <TableCell className="text-sm" style={{ color: "#9C9590" }}>
                {c.articleTitle ?? "—"}
              </TableCell>
              <TableCell className="text-sm" style={{ color: "#9C9590" }}>
                {c.userName ?? "—"}
              </TableCell>
              <TableCell className="text-sm" style={{ color: "#9C9590" }}>
                {c.charCount || c.content.length}
              </TableCell>
              {showStatus && (
                <TableCell>
                  {(() => {
                    const s = { pending: "#C49A3C20", approved: "#6B8F5E20", rejected: "#B8545020" };
                    const sc = { pending: "#C49A3C", approved: "#6B8F5E", rejected: "#B85450" };
                    const sl = { pending: "待审核", approved: "已通过", rejected: "已拒绝" };
                    return (
                      <Badge
                        className="text-xs rounded-full"
                        style={{ backgroundColor: s[c.status], color: sc[c.status] }}
                      >
                        {sl[c.status]}
                      </Badge>
                    );
                  })()}
                </TableCell>
              )}
              <TableCell className="text-xs" style={{ color: "#9C9590" }}>
                {new Date(c.createdAt).toLocaleDateString("zh-CN")}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {c.status === "pending" && (
                    <>
                      <button
                        title="通过"
                        onClick={() => onApprove(c.id)}
                        className="p-1 rounded hover:bg-[#6B8F5E20]"
                        style={{ color: "#6B8F5E" }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        title="拒绝"
                        onClick={() => onReject(c.id)}
                        className="p-1 rounded hover:bg-[#B8545020]"
                        style={{ color: "#B85450" }}
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <button
                    title="高价值"
                    onClick={() => onToggleHighValue(c)}
                    className="p-1 rounded hover:bg-[#F5F1EB]"
                    style={{ color: c.isHighValue ? "#A67C52" : "#9C9590" }}
                  >
                    <Star size={16} fill={c.isHighValue ? "#A67C52" : "none"} />
                  </button>
                  <button
                    title="删除"
                    onClick={() => onDelete(c)}
                    className="p-1 rounded hover:bg-[#F5F1EB]"
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
  );
}
