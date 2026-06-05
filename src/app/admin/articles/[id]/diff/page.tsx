"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitCompare } from "lucide-react";

interface VersionItem {
  id: string;
  versionNumber: number;
  changeSummary: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export default function DiffPage() {
  const params = useParams();
  const postId = params.id as string;

  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [diffResult, setDiffResult] = useState("");

  useEffect(() => {
    fetch(`/api/articles/${postId}/versions`)
      .then((r) => r.json())
      .then((data) => {
        setVersions(Array.isArray(data) ? data : []);
        if (data.length >= 2) {
          setV1(data[1].id); // older
          setV2(data[0].id); // newer (current)
        }
      })
      .catch(() => {});
  }, [postId]);

  // Auto-load when both versions selected
  useEffect(() => {
    if (!v1 || !v2 || v1 === v2) return;
    Promise.all([
      fetch(`/api/articles/${postId}/versions/${v1}`).then((r) => r.json()),
      fetch(`/api/articles/${postId}/versions/${v2}`).then((r) => r.json()),
    ]).then(([d1, d2]) => {
      setContent1(stripHtml(d1.content ?? ""));
      setContent2(stripHtml(d2.content ?? ""));
    });
  }, [v1, v2, postId]);

  const handleCompare = () => {
    if (!content1 || !content2) return;
    const lines1 = content1.split("\n");
    const lines2 = content2.split("\n");
    const result = buildDiff(lines1, lines2);
    setDiffResult(result);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1EB" }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/articles"
            style={{ color: "#9C9590" }}
            className="hover:underline text-sm inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            返回
          </Link>
          <h1
            style={{
              fontFamily: '"Noto Serif SC", serif',
              color: "#2D2A26",
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            版本对比
          </h1>
        </div>

        {/* Version selectors */}
        <div
          className="grid grid-cols-2 gap-6 mb-6 p-6 rounded-lg border"
          style={{ borderColor: "#E8E3DC", backgroundColor: "#fff" }}
        >
          {(["旧版本", "新版本"] as const).map((label, i) => {
            const val = i === 0 ? v1 : v2;
            const setVal = i === 0 ? setV1 : setV2;
            return (
              <div key={label}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#2D2A26" }}
                >
                  {label}
                </label>
                <select
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  style={{ borderColor: "#9C9590", color: "#2D2A26", backgroundColor: "#fff" }}
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.versionNumber}
                      {v.isCurrent ? " (当前)" : ""}
                      {" — "}
                      {v.changeSummary || new Date(v.createdAt).toLocaleDateString("zh-CN")}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          <div className="col-span-2">
            <button
              onClick={handleCompare}
              disabled={!v1 || !v2 || v1 === v2}
              className="rounded-full px-6 py-2 text-sm inline-flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: v1 && v2 && v1 !== v2 ? "#2D2A26" : "#E8E3DC",
                color: v1 && v2 && v1 !== v2 ? "#F5F1EB" : "#9C9590",
                cursor: v1 && v2 && v1 !== v2 ? "pointer" : "default",
              }}
            >
              <GitCompare size={16} />
              对比
            </button>
          </div>
        </div>

        {/* Diff result */}
        {diffResult && (
          <div
            className="rounded-lg border p-6"
            style={{
              borderColor: "#E8E3DC",
              backgroundColor: "#fff",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
              fontSize: "14px",
              lineHeight: 1.8,
              color: "#2D2A26",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
            dangerouslySetInnerHTML={{ __html: diffResult }}
          />
        )}
      </div>
    </div>
  );
}

/** Strip HTML tags to get plain text for diff */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/** Line-by-line diff with inline highlights */
function buildDiff(oldLines: string[], newLines: string[]): string {
  // Simple LCS-based diff
  const lcs = longestCommonSubsequence(oldLines, newLines);
  const result: string[] = [];
  let o = 0,
    n = 0,
    l = 0;

  while (o < oldLines.length || n < newLines.length) {
    if (l < lcs.length && o < oldLines.length && n < newLines.length && oldLines[o] === lcs[l] && newLines[n] === lcs[l]) {
      result.push(` ${escapeHtml(oldLines[o])}`);
      o++;
      n++;
      l++;
    } else if (o < oldLines.length && (l >= lcs.length || oldLines[o] !== lcs[l])) {
      result.push(`<span style="background:rgba(184,84,80,0.15);color:#B85450">-${escapeHtml(oldLines[o])}</span>`);
      o++;
    } else if (n < newLines.length && (l >= lcs.length || newLines[n] !== lcs[l])) {
      result.push(`<span style="background:rgba(82,168,82,0.15);color:#52a852">+${escapeHtml(newLines[n])}</span>`);
      n++;
    } else {
      o++;
      n++;
    }
  }

  return result.join("\n");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function longestCommonSubsequence(a: string[], b: string[]): string[] {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const result: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) i--;
    else j--;
  }
  return result;
}
