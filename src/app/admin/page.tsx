"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FileText, MessageSquare, Settings, Home, PenLine, FileEdit, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ articles: 0, drafts: 0, comments: 0, users: 0 });
  const [recentDrafts, setRecentDrafts] = useState<Array<{ id: string; title: string; updatedAt: string }>>([]);

  useEffect(() => {
    fetch("/api/articles?limit=5")
      .then(r => r.json())
      .then(d => setRecentDrafts(d.items?.filter((a: { status: string }) => a.status !== "published") ?? []))
      .catch(() => {});
    fetch("/api/articles?limit=100")
      .then(r => r.json())
      .then(d => setStats(s => ({ ...s, articles: d.total ?? 0, drafts: d.items?.filter((a: { status: string }) => a.status !== "published").length ?? 0 })))
      .catch(() => {});
    fetch("/api/comments?status=pending")
      .then(r => r.json())
      .then(d => setStats(s => ({ ...s, comments: d.items?.length ?? 0 })))
      .catch(() => {});
    fetch("/api/users")
      .then(r => r.json())
      .then(d => setStats(s => ({ ...s, users: Array.isArray(d) ? d.length : 0 })))
      .catch(() => {});
  }, []);

  const userName = session?.user?.name || "创作者";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "上午好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-1" style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}>
          {greeting}，{userName}
        </h1>
        <p className="text-base" style={{ color: "#9C9590" }}>今天想写点什么？</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatCard label="文章" value={stats.articles} />
        <StatCard label="草稿" value={stats.drafts} />
        <StatCard label="待审核" value={stats.comments} highlight />
        <StatCard label="北行者" value={stats.users} />
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-medium mb-3" style={{ color: "#9C9590" }}>快捷入口</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <QuickAction href="/admin/articles/new" icon={<PenLine size={20} />} label="写新文章" />
        <QuickAction href="/admin/articles" icon={<FileText size={20} />} label="文章管理" />
        <QuickAction href="/admin/settings" icon={<Settings size={20} />} label="编辑页面" />
        <QuickAction href="/admin/comments" icon={<MessageSquare size={20} />} label="评论审核" />
      </div>

      {/* Recent drafts */}
      {recentDrafts.length > 0 && (
        <>
          <h2 className="text-sm font-medium mb-3" style={{ color: "#9C9590" }}>最近草稿</h2>
          <div className="space-y-2 mb-8">
            {recentDrafts.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                href={`/admin/articles/${d.id}/edit`}
                className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-[#F5F1EB]"
                style={{ borderColor: "#E8E3DC" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileEdit size={16} style={{ color: "#A67C52", flexShrink: 0 }} />
                  <span className="text-sm font-medium truncate" style={{ color: "#2D2A26" }}>{d.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs" style={{ color: "#9C9590" }}>
                    {new Date(d.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                  <ArrowRight size={14} style={{ color: "#A67C52" }} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Back to site */}
      <div className="pt-6 border-t" style={{ borderColor: "#E8E3DC" }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm transition-colors hover:underline"
          style={{ color: "#A67C52" }}
        >
          <Home size={16} />
          回到前台网站
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className="p-4 sm:p-5 rounded-xl border text-center"
      style={{ borderColor: highlight ? "#A67C5220" : "#E8E3DC", backgroundColor: highlight ? "#A67C5208" : "transparent" }}
    >
      <div className="text-2xl sm:text-3xl font-semibold mb-1" style={{ fontFamily: '"Noto Serif SC", serif', color: highlight ? "#A67C52" : "#2D2A26" }}>
        {value}
      </div>
      <div className="text-xs sm:text-sm" style={{ color: "#9C9590" }}>{label}</div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors hover:bg-[#F5F1EB]"
      style={{ borderColor: "#E8E3DC" }}
    >
      <div style={{ color: "#2D2A26" }}>{icon}</div>
      <span className="text-sm" style={{ color: "#2D2A26" }}>{label}</span>
    </Link>
  );
}
