"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

const SECTION_OPTIONS = [
  { value: "explore", label: "自我探索" },
  { value: "improve", label: "自我提升" },
  { value: "realize", label: "自我实现" },
];

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topics, setTopics] = useState<Array<{ id: string; name: string; section: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load topics when section changes
  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => setTopics(data));
  }, []);

  const filteredTopics = topics.filter((t) => t.section === section);

  const handleCreate = async () => {
    if (!title.trim() || !section) {
      setError("标题和板块为必填项");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), section, topicId: topicId || null }),
    });

    if (res.ok) {
      const post = await res.json();
      router.push(`/admin/articles/${post.id}/edit`);
    } else {
      const data = await res.json();
      setError(data.error || "创建失败");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1 mb-8 text-sm hover:underline"
        style={{ color: "#A67C52" }}
      >
        <ArrowLeft size={16} />
        返回文章列表
      </Link>

      <h1
        className="text-2xl font-semibold mb-8"
        style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}
      >
        新建文章
      </h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#2D2A26" }}
          >
            文章标题
          </label>
          <Input
            placeholder="输入文章标题…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 border-b rounded-none text-lg"
            style={{
              borderColor: "#9C9590",
              backgroundColor: "transparent",
              color: "#2D2A26",
              padding: "12px 0",
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
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#2D2A26" }}
          >
            所属板块
          </label>
          <div className="flex gap-3">
            {SECTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSection(opt.value)}
                className="px-4 py-2 rounded-full text-sm transition-all border"
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

        {/* Topic/Column (optional, shown after section is selected) */}
        {section && filteredTopics.length > 0 && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#2D2A26" }}
            >
              所属主题/专栏（可选）
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

        {/* Error */}
        {error && (
          <p className="text-sm" style={{ color: "#B85450" }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <Button
          onClick={handleCreate}
          disabled={saving}
          className="rounded-full px-8"
          style={{
            backgroundColor: "#2D2A26",
            color: "#F5F1EB",
            transition: "background-color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A67C52")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2D2A26")}
        >
          {saving ? "创建中…" : "创建草稿"}
        </Button>
      </div>
    </div>
  );
}
