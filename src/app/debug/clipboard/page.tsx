"use client";

import { useState } from "react";

export default function ClipboardDebugPage() {
  const [htmlContent, setHtmlContent] = useState("");
  const [plainContent, setPlainContent] = useState("");
  const [hasHtml, setHasHtml] = useState(false);

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");

    setHasHtml(!!html);
    setHtmlContent(html ? html.slice(0, 5000) : "(无 text/html)");
    setPlainContent(plain ? plain.slice(0, 5000) : "(无 text/plain)");
  };

  return (
    <div style={{ padding: 20, fontFamily: "monospace", fontSize: 14 }}>
      <h2>剪贴板调试 - 查看 knb.im 复制的内容</h2>
      <ol style={{ marginBottom: 20 }}>
        <li>到 knb.im 点「复制」按钮</li>
        <li>回到此页面，在下方文本框中 Ctrl+V</li>
        <li>查看 text/html 和 text/plain 内容</li>
      </ol>

      <textarea
        onPaste={handlePaste}
        placeholder="在此按 Ctrl+V 粘贴"
        rows={4}
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />

      {hasHtml !== undefined && (
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 10 }}>
            <strong>text/html {hasHtml ? "✅ 有内容" : "❌ 无内容"}</strong>
          </div>

          <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <h4>text/html（渲染预览）:</h4>
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
              style={{
                border: "1px dashed #999",
                padding: 10,
                minHeight: 100,
              }}
            />
          </div>

          <div>
            <h4>text/html（源码）:</h4>
            <pre style={{
              background: "#f5f5f5",
              padding: 10,
              overflow: "auto",
              maxHeight: 400,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}>
              {htmlContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
