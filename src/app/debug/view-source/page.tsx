"use client";

import { useState } from "react";

export default function ViewSourcePage() {
  const [postId, setPostId] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    if (!postId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${postId.trim()}`);
      const data = await res.json();
      setHtml(data.content || "(no content)");
    } catch {
      setHtml("Error fetching");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "monospace", fontSize: 13 }}>
      <h2>查看文章原始 HTML（检查样式是否保留）</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          placeholder="输入文章 ID（如 e250141f-...）"
          style={{ padding: 5, width: 300, marginRight: 10 }}
        />
        <button onClick={fetchContent} disabled={loading}>
          {loading ? "Loading..." : "查看源码"}
        </button>
      </div>
      {html && (
        <pre
          style={{
            background: "#f5f5f5",
            padding: 10,
            maxHeight: 600,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {html.slice(0, 10000)}
        </pre>
      )}
    </div>
  );
}
