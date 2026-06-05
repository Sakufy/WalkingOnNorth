"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithCache } from "@/lib/client-cache";
import { Button } from "@/components/ui/button";
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
  const s = { pending: "#C49A3C20", approved: "#6B8F5E20", rejected: "#B8545020" };
  const sc = { pending: "#C49A3C", approved: "#6B8F5E", rejected: "#B85450" };
  const sl = { pending: "待审核", approved: "已通过", rejected: "已拒绝" };

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="rounded-lg border p-4 sm:p-5 space-y-3" style={{ borderColor: "#E8E3DC" }}>
          {/* Comment content */}
          <p className="text-sm sm:text-base line-clamp-3" style={{ color: "#2D2A26", lineHeight: 1.8 }}>{c.content}</p>
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm" style={{ color: "#9C9590" }}>
            <span>{c.userName ?? "—"}</span>
            <span>·</span>
            <span>{c.articleTitle ?? "—"}</span>
            <span>·</span>
            <span>{c.charCount || c.content.length} 字</span>
            <span>·</span>
            <span>{new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
            {showStatus && (
              <span className="text-xs px-2 py-0.5 rounded-full sm:ml-auto" style={{ backgroundColor: s[c.status], color: sc[c.status] }}>{sl[c.status]}</span>
            )}
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "#E8E3DC" }}>
            {c.status === "pending" && (
              <>
                <button onClick={() => onApprove(c.id)} className="flex-1 sm:flex-none text-sm py-2 px-4 rounded-md transition-colors hover:opacity-90" style={{ color: "#F5F1EB", backgroundColor: "#6B8F5E" }}>通过</button>
                <button onClick={() => onReject(c.id)} className="flex-1 sm:flex-none text-sm py-2 px-4 rounded-md transition-colors hover:opacity-90" style={{ color: "#F5F1EB", backgroundColor: "#B85450" }}>拒绝</button>
              </>
            )}
            <button onClick={() => onToggleHighValue(c)} className="text-sm py-2 px-4 rounded-md border transition-colors hover:bg-[#F5F1EB]" style={{ borderColor: c.isHighValue ? "#A67C52" : "#9C9590", color: c.isHighValue ? "#A67C52" : "#9C9590" }}>{c.isHighValue ? "★ 高价值" : "☆"}</button>
            <button onClick={() => onDelete(c)} className="text-sm py-2 px-4 rounded-md border transition-colors hover:bg-[#F5F1EB] ml-auto" style={{ borderColor: "#B85450", color: "#B85450" }}>删除</button>
          </div>
        </div>
      ))}
    </div>
  );
}
