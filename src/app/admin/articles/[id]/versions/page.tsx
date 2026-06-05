"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Version = {
  id: string;
  versionNumber: number;
  changeSummary: string | null;
  createdAt: string;
};

export default function VersionsPage() {
  const params = useParams();
  const postId = params.id as string;

  const [versions, setVersions] = useState<Version[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [versionContent, setVersionContent] = useState("");

  useEffect(() => {
    async function load() {
      // Load post title
      const postRes = await fetch(`/api/articles/${postId}`);
      if (postRes.ok) {
        const post = await postRes.json();
        setTitle(post.title);
      }

      // Load versions
      const versionsRes = await fetch(`/api/articles/${postId}/versions`);
      if (versionsRes.ok) {
        const data = await versionsRes.json();
        setVersions(data);
      }
      setLoading(false);
    }
    load();
  }, [postId]);

  const handleViewVersion = async (version: Version) => {
    if (selectedVersion?.id === version.id) {
      setSelectedVersion(null);
      setVersionContent("");
      return;
    }
    setSelectedVersion(version);

    // Fetch version content from correct API
    const res = await fetch(`/api/articles/${postId}/versions/${version.id}`);
    if (res.ok) {
      const data = await res.json();
      setVersionContent(data.content ?? "");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "#9C9590" }}>
        加载中…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link
        href={`/admin/articles/${postId}/edit`}
        className="inline-flex items-center gap-1 mb-6 text-sm hover:underline"
        style={{ color: "#A67C52" }}
      >
        <ArrowLeft size={16} />
        返回编辑
      </Link>

      <h1
        className="text-2xl font-semibold mb-2"
        style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}
      >
        版本历史
      </h1>
      <p className="text-sm mb-8" style={{ color: "#9C9590" }}>
        {title}
      </p>

      {versions.length === 0 ? (
        <p className="text-center py-16" style={{ color: "#9C9590" }}>
          暂无版本记录
        </p>
      ) : (
        <div className="relative pl-8 border-l-2" style={{ borderColor: "#E8E3DC" }}>
          {versions.map((version, index) => (
            <div key={version.id} className="mb-8 relative">
              {/* Timeline dot */}
              <div
                className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2"
                style={{
                  backgroundColor: index === 0 ? "#A67C52" : "#F5F1EB",
                  borderColor: index === 0 ? "#A67C52" : "#9C9590",
                }}
              />

              {/* Version card */}
              <button
                type="button"
                onClick={() => handleViewVersion(version)}
                className="w-full text-left p-4 rounded-lg border transition-colors hover:bg-[#F5F1EB]"
                style={{
                  borderColor:
                    selectedVersion?.id === version.id ? "#A67C52" : "#E8E3DC",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-medium"
                    style={{ color: "#2D2A26" }}
                  >
                    版本 {version.versionNumber}
                  </span>
                  <span className="text-xs" style={{ color: "#9C9590" }}>
                    {new Date(version.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                {version.changeSummary ? (
                  <p className="text-sm" style={{ color: "#9C9590" }}>
                    {version.changeSummary}
                  </p>
                ) : (
                  <p className="text-sm italic" style={{ color: "#9C9590" }}>
                    无修改说明
                  </p>
                )}
                {index === 0 && (
                  <span
                    className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: "#A67C5220",
                      color: "#A67C52",
                    }}
                  >
                    当前版本
                  </span>
                )}
              </button>

              {/* Version content preview (when selected) */}
              {selectedVersion?.id === version.id && versionContent && (
                <div
                  className="mt-3 p-4 rounded-lg border overflow-auto max-h-96"
                  style={{ borderColor: "#E8E3DC", backgroundColor: "#F5F1EB" }}
                >
                  <div
                    className="prose text-sm"
                    style={{
                      fontFamily: '"Noto Serif SC", serif',
                      lineHeight: 2.0,
                      color: "#2D2A26",
                      maxWidth: "720px",
                    }}
                    dangerouslySetInnerHTML={{ __html: versionContent }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
