"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import TipTapEditor from "@/components/editor/TipTapEditor";

const SECTION_OPTIONS = [
  { value: "explore", label: "自我探索" },
  { value: "improve", label: "自我提升" },
  { value: "realize", label: "自我实现" },
];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topics, setTopics] = useState<Array<{ id: string; name: string; section: string }>>([]);
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [sectionTags, setSectionTags] = useState<string[]>([]);

  // Load post data
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/articles/${postId}`);
      if (res.ok) {
        const post = await res.json();
        setTitle(post.title ?? "");
        setSection(post.section ?? "");
        setTopicId(post.topicId ?? "");
        setSummary(post.summary ?? "");
        setTags(post.tags ?? "");
        setSortOrder(post.sortOrder ?? 0);
        setContent(post.content ?? "");
      }
      setLoading(false);
    }
    load();
  }, [postId]);

  // Load topics list
  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => setTopics(data));
  }, []);

  const filteredTopics = topics.filter((t) => t.section === section);

  // Load existing tags for current section
  useEffect(() => {
    if (!section) return;
    fetch(`/api/tags?section=${section}`)
      .then((r) => r.json())
      .then((data) => setSectionTags(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [section]);

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("articleId", postId);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  }, [postId]);

  const handleSave = async () => {
    if (!title.trim() || !section) {
      setError("标题和板块为必填项");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/articles/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), section, topicId: topicId || null, summary, tags, sortOrder }),
    });

    if (res.ok) {
      setSaving(false);
    } else {
      const data = await res.json();
      setError(data.error || "保存失败");
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      setError("文章内容不能为空");
      return;
    }
    setPublishing(true);
    setError("");

    // Save metadata first
    await fetch(`/api/articles/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), section, topicId: topicId || null, summary, tags, sortOrder }),
    });

    // Publish with content
    const res = await fetch(`/api/articles/${postId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, changeSummary: changeSummary.trim() || null }),
    });

    if (res.ok) {
      router.push("/admin/articles");
    } else {
      const data = await res.json();
      setError(data.error || "发布失败");
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "#9C9590" }}>
        <Loader2 className="animate-spin mr-2" size={20} />
        加载中…
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ borderColor: "#E8E3DC" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1 text-sm hover:underline"
            style={{ color: "#9C9590" }}
          >
            <ArrowLeft size={16} />
            返回
          </Link>
          <h1
            className="text-lg font-semibold"
            style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}
          >
            编辑文章
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="outline"
            className="rounded-full px-5"
            style={{ borderColor: "#9C9590", color: "#2D2A26" }}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-1" size={14} />
                保存中…
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" />
                保存草稿
              </>
            )}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="rounded-full px-6"
            style={{
              backgroundColor: "#2D2A26",
              color: "#F5F1EB",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A67C52")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2D2A26")}
          >
            {publishing ? (
              <>
                <Loader2 className="animate-spin mr-1" size={14} />
                发布中…
              </>
            ) : (
              <>
                <Send size={16} className="mr-1" />
                发布
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content: metadata + editor — scroll independently */}
      <div className="flex flex-1 overflow-hidden">
        {/* Metadata sidebar */}
        <div
          className="w-80 shrink-0 border-r overflow-y-auto p-6 space-y-5"
          style={{ borderColor: "#E8E3DC" }}
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A26" }}>
              标题
            </label>
            <Input
              placeholder="文章标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 border-b rounded-none"
              style={{
                borderColor: "#9C9590",
                backgroundColor: "transparent",
                color: "#2D2A26",
                padding: "8px 0",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomWidth = "2px";
                e.currentTarget.style.borderColor = "#A67C52";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomWidth = "1px";
                e.currentTarget.style.borderColor = "#9C9590";
              }}
            />
          </div>

          {/* Section */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A26" }}>
              板块
            </label>
            <div className="flex flex-wrap gap-2">
              {SECTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSection(opt.value)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all border"
                  style={{
                    backgroundColor: section === opt.value ? "#2D2A26" : "transparent",
                    color: section === opt.value ? "#F5F1EB" : "#9C9590",
                    borderColor: section === opt.value ? "#2D2A26" : "#9C9590",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic/Column (only shown when topics exist for this section) */}
          {filteredTopics.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A26" }}>
                主题/专栏
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-transparent"
                style={{ borderColor: "#9C9590", color: "#2D2A26" }}
              >
                <option value="">无主题</option>
                {filteredTopics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A26" }}>
              摘要
            </label>
            <textarea
              placeholder="简短描述文章内容…"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full border-0 border-b rounded-none resize-none text-sm"
              style={{
                borderColor: "#9C9590",
                backgroundColor: "transparent",
                color: "#2D2A26",
                padding: "8px 0",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomWidth = "2px";
                e.currentTarget.style.borderColor = "#A67C52";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomWidth = "1px";
                e.currentTarget.style.borderColor = "#9C9590";
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A26" }}>
              标签
            </label>
            <Input
              placeholder="用逗号分隔，如：哲学, 阅读"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="border-0 border-b rounded-none text-sm"
              style={{
                borderColor: "#9C9590",
                backgroundColor: "transparent",
                color: "#2D2A26",
                padding: "8px 0",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomWidth = "2px";
                e.currentTarget.style.borderColor = "#A67C52";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomWidth = "1px";
                e.currentTarget.style.borderColor = "#9C9590";
              }}
            />
            {/* Tag suggestions */}
            {sectionTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {sectionTags
                  .filter((t) => !tags.split(",").map((s) => s.trim()).includes(t))
                  .slice(0, 10)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const existing = tags
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setTags(existing.concat(t).join(", "));
                      }}
                      className="text-xs px-2 py-0.5 rounded-full border transition-colors"
                      style={{
                        borderColor: "#A67C52",
                        color: "#A67C52",
                        backgroundColor: "transparent",
                      }}
                    >
                      + {t}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A26" }}>
              排序号
            </label>
            <p className="text-xs mb-2" style={{ color: "#9C9590" }}>数字越小越靠前，默认 0。置顶可设为负数。</p>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="border-0 border-b rounded-none text-sm"
              style={{
                borderColor: "#9C9590",
                backgroundColor: "transparent",
                color: "#2D2A26",
                padding: "8px 0",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomWidth = "2px";
                e.currentTarget.style.borderColor = "#A67C52";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomWidth = "1px";
                e.currentTarget.style.borderColor = "#9C9590";
              }}
            />
          </div>

          {/* Change summary (version note) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#2D2A26" }}>
              本次修改说明
            </label>
            <textarea
              placeholder="简述本次修改内容（发布时保存为版本记录）"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              rows={2}
              className="w-full border rounded-md resize-none text-sm p-2"
              style={{
                borderColor: "#9C9590",
                backgroundColor: "transparent",
                color: "#2D2A26",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#A67C52";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#9C9590";
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm" style={{ color: "#B85450" }}>
              {error}
            </p>
          )}
        </div>

        {/* Editor area — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <TipTapEditor
            initialContent={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
          />
        </div>
      </div>
    </div>
  );
}
