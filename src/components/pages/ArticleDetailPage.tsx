"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

function VersionTimeline({
  versions,
  activeVersionId,
  onSelect,
}: {
  versions: { id: string; version: string; date: string; note: string; isCurrent: boolean }[];
  activeVersionId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      {versions.map((v, i) => (
        <button
          key={v.id}
          onClick={() => onSelect(v.id)}
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
            textAlign: "left",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            paddingBottom: i < versions.length - 1 ? "20px" : "0",
            position: "relative",
          }}
        >
          {/* Timeline line */}
          {i < versions.length - 1 && (
            <div
              style={{
                position: "absolute",
                left: "7px",
                top: "16px",
                bottom: 0,
                width: "1px",
                backgroundColor: "rgba(156,149,144,0.3)",
              }}
            />
          )}
          {/* Dot */}
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              marginTop: "3px",
              flexShrink: 0,
              backgroundColor: activeVersionId === v.id ? "var(--bx-tertiary)" : "transparent",
              border: activeVersionId === v.id ? "2px solid var(--bx-tertiary)" : "2px solid var(--bx-secondary)",
              transition: "all 150ms ease",
              zIndex: 1,
            }}
          />
          <div>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: activeVersionId === v.id ? "var(--bx-tertiary)" : "var(--bx-primary)",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                marginBottom: "2px",
                transition: "color 150ms ease",
              }}
            >
              {v.version}
              {v.isCurrent && (
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "0.75rem",
                    color: "var(--bx-tertiary)",
                    border: "1px solid rgba(166,124,82,0.4)",
                    borderRadius: "4px",
                    padding: "1px 6px",
                  }}
                >
                  当前
                </span>
              )}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--bx-secondary)",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                marginBottom: "4px",
              }}
            >
              {v.date}
            </p>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--bx-secondary)",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                lineHeight: 1.5,
              }}
            >
              {v.note}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function ParagraphCommentPanel({
  paragraphId,
  existingComments,
  onClose,
  onSubmit,
}: {
  paragraphId: string;
  existingComments: Array<{ id: string; content: string; createdAt: string; userName: string }>;
  onClose: () => void;
  onSubmit: (paragraphId: string, content: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    await onSubmit(paragraphId, value.trim());
    setSubmitted(true);
    setValue("");
    setSubmitting(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(360px, 90vw)",
        backgroundColor: "var(--bx-neutral)",
        borderRadius: "12px 12px 0 0",
        boxShadow: "0 -1px 8px rgba(45,42,38,0.06)",
        padding: "14px 20px 24px",
        zIndex: 50,
        animation: "slideUpPanel 150ms ease forwards",
      }}
      role="dialog"
      aria-label="段落评论"
    >
      <style>{`
        @keyframes slideUpPanel {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="flex items-center justify-between mb-4">
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--bx-secondary)",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
          }}
        >
          段落评论
        </p>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--bx-secondary)",
            fontSize: "1.25rem",
            lineHeight: 1,
            padding: "4px",
            minHeight: "44px",
            minWidth: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="关闭评论面板"
        >
          ×
        </button>
      </div>

      {existingComments.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          {existingComments.map((c) => (
            <div
              key={c.id}
              style={{
                paddingBottom: "12px",
                marginBottom: "12px",
                borderBottom: "1px solid rgba(156,149,144,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--bx-primary)",
                    fontFamily: '"Noto Sans SC", Inter, sans-serif',
                  }}
                >
                  {c.userName}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--bx-secondary)",
                    fontFamily: '"Noto Sans SC", Inter, sans-serif',
                  }}
                >
                  {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.7,
                  color: "var(--bx-primary)",
                }}
              >
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {submitted ? (
        <p style={{ fontSize: "0.875rem", color: "var(--bx-success)", fontFamily: '"Noto Sans SC", Inter, sans-serif' }}>
          已提交，等待审核后显示。
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="comment-input"
            style={{
              fontSize: "0.875rem",
              color: "var(--bx-secondary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
              display: "block",
              marginBottom: "8px",
            }}
          >
            留下你的想法
          </label>
          <input
            id="comment-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="写点什么…"
            style={{
              display: "block",
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--bx-secondary)",
              padding: "10px 0",
              fontSize: "1rem",
              color: "var(--bx-primary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
              outline: "none",
              transition: "border-color 150ms ease",
              marginBottom: "16px",
            }}
            onFocus={(e) => { e.target.style.borderBottomWidth = "2px"; e.target.style.borderBottomColor = "var(--bx-tertiary)"; }}
            onBlur={(e) => { e.target.style.borderBottomWidth = "1px"; e.target.style.borderBottomColor = "var(--bx-secondary)"; }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 24px",
              borderRadius: "9999px",
              backgroundColor: "var(--bx-primary)",
              color: "var(--bx-on-primary)",
              fontSize: "0.9375rem",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
              border: "none",
              cursor: "pointer",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = "var(--bx-tertiary)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = "var(--bx-primary)"; }}
          >
            {submitting ? "提交中…" : "提交"}
          </button>
        </form>
      )}
    </div>
  );
}

export function ArticleDetail({ article }: {
  article: {
    id: string; slug: string; title: string; summary: string;
    section: string; tags: string | null;
    topicId: string | null; topicName: string | null;
    readingTime: number; createdAt: string; updatedAt: string;
    content: string;
  };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { slug } = useParams<{ slug: string }>();
  const [activeVersionId, setActiveVersionId] = useState<string>("");
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [showVersionsMobile, setShowVersionsMobile] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; postId: string; userId: string; paragraphId: string | null; type: string; content: string; charCount: number; isHighValue: boolean; createdAt: string; userName: string }>>([]);
  const [versions, setVersions] = useState<Array<{ id: string; versionNumber: number; changeSummary: string | null; createdAt: string; isCurrent: boolean }>>([]);
  const [versionContent, setVersionContent] = useState<string | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const versionCache = useRef<Map<string, string>>(new Map());

  // Fetch comments
  useEffect(() => {
    if (!article.id) return;
    fetch(`/api/comments?postId=${article.id}&status=approved`)
      .then((r) => r.json())
      .then((data) => setComments(data.items ?? []))
      .catch(() => {});
  }, [article.id]);

  // Fetch versions
  useEffect(() => {
    if (!article.id) return;
    fetch(`/api/articles/${article.id}/versions`)
      .then((r) => r.json())
      .then((data) => setVersions(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [article.id]);

  // Load version content when selected (click again to reset to current)
  const handleVersionSelect = useCallback((id: string) => {
    if (id === activeVersionId) {
      setActiveVersionId("");
      setVersionContent(null);
      return;
    }
    setActiveVersionId(id);

    // Serve from cache if already fetched
    const cached = versionCache.current.get(id);
    if (cached !== undefined) {
      setVersionContent(cached || null);
      return;
    }

    fetch(`/api/articles/${article.id}/versions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const content = data.content ?? "";
        versionCache.current.set(id, content);
        setVersionContent(content || null);
      })
      .catch(() => {});
  }, [article.id, activeVersionId]);

  // Use selected version content or current article content
  const displayContent = versionContent ?? article.content;

  // Group comments by paragraph
  const commentsByParagraph = useMemo(() => {
    const map: Record<string, typeof comments> = {};
    for (const c of comments) {
      const key = c.paragraphId ?? "end";
      if (!map[key]) map[key] = [];
      map[key].push(c);
    }
    return map;
  }, [comments]);

  const handleSubmitComment = async (paragraphId: string, content: string) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: article.id, paragraphId, content }),
    });
    if (res.ok) {
      const newComment = await res.json();
      // Optimistically add to local state so user sees it immediately
      setComments((prev) => [
        {
          id: newComment.id,
          postId: article.id,
          userId: "",
          paragraphId,
          type: paragraphId ? "paragraph" : "end",
          content,
          charCount: content.length,
          isHighValue: false,
          createdAt: new Date().toISOString(),
          userName: "你",
        },
        ...prev,
      ]);
    } else {
      const err = await res.json().catch(() => ({ error: "提交失败" }));
      alert(err.error || "评论提交失败，请登录后再试");
    }
  };

  const handleSubmitEndComment = async (content: string) => {
    await handleSubmitComment("", content);
  };

  const handleParagraphClick = useCallback((paragraphId: string) => {
    setActiveParagraphId((prev) => {
      const next = prev === paragraphId ? null : paragraphId;
      if (next) {
        // Scroll clicked paragraph to upper portion of viewport
        setTimeout(() => {
          document.querySelector(`[data-p-id="${paragraphId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
      return next;
    });
  }, []);

  // Parse HTML into clickable paragraphs — deferred to client to avoid SSR hydration mismatch
  const [paragraphs, setParagraphs] = useState<Array<{ pid: string; heading: string; body: string }> | null>(null);
  const rawContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!displayContent) return;
    try {
      const styleCount = (displayContent.match(/style="/g) || []).length;
      if (styleCount > 2) {
        setParagraphs(null);
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(displayContent, "text/html");
      const els = Array.from(doc.querySelectorAll("[data-p-id]"));
      if (els.length === 0) { setParagraphs(null); return; }
      setParagraphs(els.map((el) => ({
        pid: el.getAttribute("data-p-id")!,
        heading: el.querySelector("h1, h2, h3")?.outerHTML ?? "",
        body: (() => {
          const h = el.querySelector("h1, h2, h3");
          return h ? el.innerHTML.replace(h.outerHTML, "") : el.innerHTML;
        })(),
      })));
    } catch {
      setParagraphs(null);
    }
  }, [displayContent]);

  // Attach paragraph click events on raw rendered content (event delegation)
  useEffect(() => {
    if (paragraphs !== null) return;
    const el = rawContentRef.current;
    if (!el) return;

    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-p-id]") as HTMLElement | null;
      if (target) {
        const pid = target.getAttribute("data-p-id");
        if (pid) handleParagraphClick(pid);
      }
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [paragraphs]);

  // Highlight active paragraph in raw content (via CSS class, preserves knb inline styles)
  useEffect(() => {
    const el = rawContentRef.current;
    if (!el) return;
    // Clear previous active
    el.querySelectorAll("[data-p-id].bx-paragraph-active").forEach((n) => {
      n.classList.remove("bx-paragraph-active");
    });
    // Set new active
    if (activeParagraphId) {
      const active = el.querySelector(`[data-p-id="${activeParagraphId}"]`);
      if (active) active.classList.add("bx-paragraph-active");
    }
  }, [activeParagraphId]);

  const sectionLabels: Record<string, string> = {
    explore: "自我探索", improve: "自我提升", realize: "自我实现",
  };
  const sectionToSlug: Record<string, string> = {
    explore: "thinking", improve: "reading", realize: "journey",
  };

  return (
    <main id="main-content" className="pb-20 sm:pb-0">
      {/* Article header — compact, title-first */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "clamp(32px, 6vh, 64px) 24px 0" }}>
        {/* Back button */}
        <button onClick={() => router.back()} style={{
          fontSize: "0.8125rem", color: "var(--bx-secondary)",
          fontFamily: '"Noto Sans SC",Inter,sans-serif',
          background: "none", border: "none", cursor: "pointer", padding: 0,
          minHeight: "44px", minWidth: "44px",
          marginBottom: "clamp(16px, 3vh, 32px)", display: "inline-flex", alignItems: "center",
        }}>← 返回</button>

        {/* Title first — first visual anchor */}
        <h1
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            color: "var(--bx-primary)",
            marginBottom: "12px",
          }}
        >
          {article.title}
        </h1>

        {/* Meta below title — subdued, not competing with title */}
        <div className="flex items-center gap-2" style={{ marginBottom: article.summary ? "20px" : "clamp(20px, 3vh, 32px)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", opacity: 0.7, fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
            {sectionLabels[article.section] ?? article.section}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", opacity: 0.4 }}>·</span>
          <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", opacity: 0.7, fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
            {new Date(article.createdAt).toLocaleDateString("zh-CN")}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", opacity: 0.4 }}>·</span>
          <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", opacity: 0.7, fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
            {article.readingTime} 分钟阅读
          </span>
        </div>

        {/* Summary — whispers, doesn't shout */}
        {article.summary && (
          <p
            style={{
              fontFamily: '"LXGW WenKai","Noto Serif SC", "Source Serif 4", Georgia, serif',
              fontSize: "clamp(0.875rem, 1.8vw, 0.9375rem)",
              lineHeight: 1.8,
              color: "var(--bx-primary)",
              opacity: 0.55,
              marginBottom: "12px",
            }}
          >
            {article.summary}
          </p>
        )}

        {/* Whisper separator */}
        {article.summary && (
          <div style={{ textAlign: "center", margin: "4px 0 28px" }}>
            <span style={{ fontSize: "1rem", color: "var(--bx-secondary)", opacity: 0.2, letterSpacing: "0.4em" }}>···</span>
          </div>
        )}
      </div>

      {/* Content area — centered, version sidebar on right */}
      <div style={{ position: "relative", padding: "0 24px 80px" }}>
        {/* Reading area — centered */}
        <div ref={readingRef} style={{ maxWidth: "720px", margin: "0 auto" }}>
          {/* Version history indicator */}
          {versionContent && (
            <div
              style={{
                padding: "8px 16px",
                marginBottom: "16px",
                backgroundColor: "rgba(166,124,82,0.1)",
                borderRadius: "8px",
                fontSize: "0.875rem",
                color: "#8c5f32",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>正在查看历史版本</span>
              <button
                onClick={() => { setActiveVersionId(""); setVersionContent(null); }}
                style={{
                  marginLeft: "auto",
                  fontSize: "0.8rem",
                  color: "#A67C52",
                  background: "none",
                  border: "1px solid #A67C52",
                  borderRadius: "9999px",
                  padding: "2px 12px",
                  cursor: "pointer",
                }}
              >
                回到最新
              </button>
            </div>
          )}
          {paragraphs ? (
            paragraphs.map(({ pid, heading, body }) => {
              const isActive = activeParagraphId === pid;
              return (
                <div
                  key={pid}
                  onClick={() => handleParagraphClick(pid)}
                  style={{
                    position: "relative",
                    padding: "12px 16px",
                    marginBottom: "4px",
                    borderRadius: "8px",
                    backgroundColor: isActive ? "rgba(166,124,82,0.08)" : "transparent",
                    cursor: "pointer",
                    transition: "background-color 150ms ease",
                  }}
                  title="点击查看或添加段落评论"
                >
                  {heading && (
                    <h3
                      style={{
                        fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
                        fontWeight: 600,
                        fontSize: "1.375rem",
                        lineHeight: 1.4,
                        color: "var(--bx-primary)",
                        marginBottom: "16px",
                        marginTop: "8px",
                      }}
                      dangerouslySetInnerHTML={{ __html: heading }}
                    />
                  )}
              <div
                style={{
                  fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
                  fontSize: "1.0625rem",
                  lineHeight: 2.0,
                  color: "var(--bx-primary)",
                }}
                className="article-content"
                dangerouslySetInnerHTML={{ __html: body }}
              />
                </div>
              );
            })
          ) : displayContent ? (
            <div
              ref={rawContentRef}
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
                lineHeight: 1.6,
                color: "inherit",
                wordWrap: "break-word",
                maxWidth: "100%",
                overflow: "hidden",
              }}
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          ) : (
            <p style={{ color: "var(--bx-secondary)" }}>暂无内容</p>
          )}

          {/* Tags + Topic section — low visual weight */}
          {(article.tags || article.topicId) && (
            <div style={{ marginTop: "36px", paddingTop: "16px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
              {article.tags && (
                <div style={{ marginBottom: article.topicId ? "16px" : "0" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif', letterSpacing: "0.06em", marginBottom: "10px" }}>标签</p>
                  <div className="flex flex-wrap gap-2" style={{ justifyContent: "flex-start" }}>
                    {article.tags.split(",").filter(Boolean).map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag.trim())}`}
                        style={{
                          fontSize: "0.8125rem", color: "var(--bx-secondary)",
                          border: "1px solid rgba(156,149,144,0.35)", borderRadius: "9999px",
                          padding: "2px 10px", fontFamily: '"Noto Sans SC",Inter,sans-serif',
                          textDecoration: "none", transition: "color 150ms ease",
                        }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--bx-tertiary)"; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--bx-secondary)"; }}
                      >
                        {tag.trim()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {article.topicId && article.topicName && (
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif', letterSpacing: "0.06em", marginBottom: "10px" }}>专栏</p>
                  <Link href={`/articles/${sectionToSlug[article.section] ?? ""}/topic/${article.topicId}`}
                    style={{
                      fontSize: "0.9375rem", color: "var(--bx-primary)",
                      fontFamily: '"Noto Serif SC",serif', textDecoration: "none",
                    }}>
                    {article.topicName}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile: version toggle */}
          <div className="sm:hidden mt-12">
            <button
              onClick={() => setShowVersionsMobile(!showVersionsMobile)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.9375rem",
                color: "var(--bx-secondary)",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                backgroundColor: "transparent",
                border: "1px solid rgba(156,149,144,0.35)",
                borderRadius: "4px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              版本历史（{versions.length}）
              <span>{showVersionsMobile ? "▲" : "▼"}</span>
            </button>

            {showVersionsMobile && (
              <div style={{ marginTop: "16px", padding: "20px 0" }}>
                <VersionTimeline
                  versions={versions.map((v) => ({
                    id: v.id,
                    version: `v${v.versionNumber}`,
                    date: new Date(v.createdAt).toLocaleDateString("zh-CN"),
                    note: v.changeSummary ?? "",
                    isCurrent: v.isCurrent,
                  }))}
                  activeVersionId={activeVersionId}
                  onSelect={handleVersionSelect}
                />
              </div>
            )}
          </div>

          {/* Share button — native sheet on supported browsers, copy-link fallback otherwise */}
          <div style={{ marginTop: "48px" }}>
            <div style={{ height: "1px", backgroundColor: "rgba(156,149,144,0.12)", marginBottom: "20px" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative" }}>
              <button
                type="button"
                onClick={async () => {
                  // Try native Web Share API (Chrome/Safari/Firefox mobile)
                  if (typeof navigator !== "undefined" && "share" in navigator) {
                    try {
                      await navigator.share({
                        title: article.title,
                        text: article.summary ?? undefined,
                        url: window.location.href,
                      });
                      return;
                    } catch { /* user cancelled → show copy hint below */ }
                  }
                  // Fallback: copy link with visible feedback
                  navigator.clipboard.writeText(window.location.href).catch(() => {});
                  const el = document.getElementById("share-copied-hint");
                  if (el) { el.style.opacity = "1"; setTimeout(() => { el.style.opacity = "0"; }, 2000); }
                }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  fontSize: "0.8125rem", color: "var(--bx-secondary)",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "8px 16px", borderRadius: "9999px",
                  fontFamily: '"Noto Sans SC", Inter, sans-serif',
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bx-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bx-secondary)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                分享
              </button>
              <span id="share-copied-hint" style={{ fontSize: "0.75rem", color: "#A67C52", opacity: 0, transition: "opacity 200ms ease", pointerEvents: "none" }} aria-hidden="true">
                链接已复制，可粘贴分享
              </span>
            </div>
          </div>

          {/* Comments section — muted divider, not competing with content */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ height: "1px", backgroundColor: "rgba(156,149,144,0.12)", marginBottom: "24px" }} />
            <h2 style={{ fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif', fontWeight: 600, fontSize: "1.125rem", color: "var(--bx-primary)", marginBottom: "20px", opacity: 0.85 }}>评论</h2>

            {/* End-of-article comment form — or login prompt */}
            {session?.user ? (
              <EndCommentForm onSubmit={handleSubmitEndComment} />
            ) : (
              <LoginPrompt />
            )}

            {/* Approved comments */}
            {comments.filter((c) => c.paragraphId === null || c.type === "end").filter((c) => c.userName !== "你").length > 0 ? (
              comments.filter((c) => c.paragraphId === null || c.type === "end").filter((c) => c.userName !== "你").map((c) => (
                <div key={c.id} style={{ paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid rgba(156,149,144,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--bx-primary)" }}>{c.userName}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)" }}>{new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <p style={{ fontSize: "1.0625rem", lineHeight: 1.8, color: "var(--bx-primary)", opacity: 0.85 }}>{c.content}</p>
                </div>
              ))
            ) : (
              comments.filter((c) => c.paragraphId === null || c.type === "end").filter((c) => c.userName === "你").length === 0 && (
                <p style={{ color: "var(--bx-secondary)" }}>暂无评论，成为第一个留言的人。</p>
              )
            )}

            {/* Pending/personal comments */}
            {comments.filter((c) => c.paragraphId === null || c.type === "end").filter((c) => c.userName === "你").map((c) => (
              <div key={c.id} style={{ paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid rgba(156,149,144,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--bx-primary)" }}>你</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)" }}>{new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#A67C5220", color: "#A67C52" }}>审核中</span>
                </div>
                <p style={{ fontSize: "1.0625rem", lineHeight: 1.8, color: "var(--bx-primary)", opacity: 0.85 }}>{c.content}</p>
              </div>
            ))}
            {/* Bottom navigation — quiet exit */}
            <div style={{ marginTop: "32px", paddingTop: "12px", borderTop: "1px solid rgba(156,149,144,0.08)", textAlign: "center" }}>
              <button onClick={() => router.back()} style={{
                fontSize: "0.8125rem", color: "var(--bx-secondary)", opacity: 0.6,
                fontFamily: '"Noto Sans SC",Inter,sans-serif',
                background: "none", border: "none", cursor: "pointer",
              }}>← 返回</button>
            </div>
          </div>

        </div>

        {/* PC version sidebar — muted, focus stays on content */}
        <aside
          className="hidden lg:block"
          style={{
            width: "200px", position: "fixed", left: "calc(50% + 380px)",
            top: "80px", maxHeight: "calc(100vh - 100px)", overflowY: "auto",
            opacity: 0.5, transition: "opacity 200ms ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; }}
          aria-label="版本历史"
        >
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--bx-secondary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
              letterSpacing: "0.05em",
              marginBottom: "12px",
            }}
          >
            版本历史
          </p>
          <VersionTimeline
            versions={versions.map((v) => ({
              id: v.id,
              version: `v${v.versionNumber}`,
              date: new Date(v.createdAt).toLocaleDateString("zh-CN"),
              note: v.changeSummary ?? "",
              isCurrent: v.isCurrent,
            }))}
            activeVersionId={activeVersionId}
            onSelect={handleVersionSelect}
          />
        </aside>
      </div>

      {/* Paragraph comment panel — or login prompt */}
      {activeParagraphId !== null && (
        session?.user ? (
          <ParagraphCommentPanel
            paragraphId={activeParagraphId}
            existingComments={(commentsByParagraph[activeParagraphId] ?? []).map((c) => ({
              id: c.id, content: c.content, createdAt: c.createdAt, userName: c.userName,
            }))}
            onClose={() => setActiveParagraphId(null)}
            onSubmit={handleSubmitComment}
          />
        ) : (
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "min(360px, 90vw)", backgroundColor: "var(--bx-neutral)",
            borderRadius: "12px 12px 0 0", boxShadow: "0 2px 8px rgba(45,42,38,0.08)",
            padding: "20px 24px 32px", zIndex: 50, textAlign: "center",
          }}>
            <p style={{ fontSize: "0.9375rem", color: "var(--bx-secondary)", marginBottom: "12px", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
              登录后即可留下想法
            </p>
            <Link href="/auth/login" style={{
              display: "inline-block", padding: "8px 24px", borderRadius: "9999px",
              backgroundColor: "var(--bx-primary)", color: "var(--bx-on-primary)",
              fontSize: "0.9375rem", fontFamily: '"Noto Sans SC",Inter,sans-serif',
              textDecoration: "none", marginRight: "8px",
            }}>登录</Link>
            <Link href="/auth/register" style={{
              display: "inline-block", padding: "8px 24px", borderRadius: "9999px",
              border: "1px solid var(--bx-primary)", color: "var(--bx-primary)",
              fontSize: "0.9375rem", fontFamily: '"Noto Sans SC",Inter,sans-serif',
              textDecoration: "none",
            }}>注册</Link>
            <button onClick={() => setActiveParagraphId(null)} style={{
              display: "block", margin: "12px auto 0", background: "none", border: "none",
              color: "var(--bx-secondary)", fontSize: "0.8125rem", cursor: "pointer",
            }}>关闭</button>
          </div>
        )
      )}
    </main>
  );
}

/* ============================================
 * Login prompt (shown when not authenticated)
 * ============================================ */
function LoginPrompt() {
  return (
    <div style={{
      padding: "24px", border: "1px solid rgba(156,149,144,0.2)", borderRadius: "8px",
      textAlign: "center", marginBottom: "24px",
    }}>
      <p style={{
        fontSize: "0.9375rem", color: "var(--bx-secondary)", marginBottom: "16px",
        fontFamily: '"Noto Sans SC",Inter,sans-serif',
      }}>
        登录后即可留下评论
      </p>
      <Link href="/auth/login" style={{
        display: "inline-block", padding: "10px 28px", borderRadius: "9999px",
        backgroundColor: "var(--bx-primary)", color: "var(--bx-on-primary)",
        fontSize: "0.9375rem", fontFamily: '"Noto Sans SC",Inter,sans-serif',
        textDecoration: "none", marginRight: "10px",
      }}>登录</Link>
      <Link href="/auth/register" style={{
        display: "inline-block", padding: "10px 28px", borderRadius: "9999px",
        border: "1px solid var(--bx-primary)", color: "var(--bx-primary)",
        fontSize: "0.9375rem", fontFamily: '"Noto Sans SC",Inter,sans-serif',
        textDecoration: "none",
      }}>注册</Link>
    </div>
  );
}

/* ============================================
 * End-of-article comment form
 * ============================================ */
function EndCommentForm({ onSubmit }: { onSubmit: (content: string) => Promise<void> }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    await onSubmit(value.trim());
    setValue("");
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "32px" }}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="写下你的想法…"
        rows={3}
        style={{
          width: "100%",
          border: "1px solid rgba(156,149,144,0.35)",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "16px",
          lineHeight: 1.6,
          color: "var(--bx-primary)",
          backgroundColor: "transparent",
          fontFamily: '"Noto Sans SC", Inter, sans-serif',
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <button
          type="submit"
          disabled={submitting || !value.trim()}
          className="rounded-full px-5 py-2 text-sm transition-colors duration-150"
          style={{
            backgroundColor: value.trim() ? "#2D2A26" : "#E8E3DC",
            color: value.trim() ? "#F5F1EB" : "#9C9590",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
            cursor: value.trim() ? "pointer" : "default",
            border: "none",
          }}
        >
          {submitting ? "提交中…" : "发表评论"}
        </button>
      </div>
    </form>
  );
}
