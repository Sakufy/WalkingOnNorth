"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  section: string;
  url: string;
};

/**
 * Custom share panel — shows OG preview card + share options.
 *
 * Strategy:
 * 1. Try Web Share API with URL (browsers that support it)
 *    → platform fetches our og:image meta tag → renders rich card
 * 2. Fallback: custom bottom sheet with:
 *    - OG card preview (fetched from /api/og)
 *    - Copy link (paste into WeChat/etc. → platform fetches og:image → card)
 *    - Save image (manual share)
 *    - WeChat guidance when applicable
 */
export function ShareBottomSheet({ open, onClose, title, summary, section, url }: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ogLoaded, setOgLoaded] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const ogImgRef = useRef<HTMLElement | null>(null);

  // Animate in/out
  useEffect(() => {
    if (open) {
      setVisible(true);
      setShareFailed(false);
      setCopied(false);
      setOgLoaded(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById("share-backdrop")?.classList.add("share--active");
          document.getElementById("share-panel")?.classList.add("share--active");
        });
      });
    } else {
      document.getElementById("share-backdrop")?.classList.remove("share--active");
      document.getElementById("share-panel")?.classList.remove("share--active");
      const t = setTimeout(() => setVisible(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Try native share (URL-based → platform renders OG card)
  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      setShareFailed(true);
      return;
    }
    try {
      await navigator.share({ title, text: summary || undefined, url });
      onClose();
    } catch {
      setShareFailed(true); // user cancelled or unsupported
    }
  }, [title, summary, url, onClose]);

  // Copy URL (paste into WeChat → platform fetches og:image → renders card)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [url]);

  // Save OG image to device
  const handleSaveImage = useCallback(async () => {
    const ogUrl = `/api/og?title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&section=${encodeURIComponent(section)}`;
    try {
      const res = await fetch(ogUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${title.slice(0, 20)}-北行之路.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch { /* download failed */ }
  }, [title, summary, section]);

  // Auto-try native share on open (for supported browsers)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => handleNativeShare(), 100);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  const ogUrl = `/api/og?title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&section=${encodeURIComponent(section)}`;
  const isWeChat = typeof navigator !== "undefined" && /micromessenger/i.test(navigator.userAgent);

  return (
    <>
      {/* Backdrop */}
      <div
        id="share-backdrop"
        className="share-backdrop"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="关闭分享面板"
      />

      {/* Panel */}
      <div id="share-panel" className="share-panel">
        {/* Drag handle */}
        <div style={{
          width: "36px", height: "4px", borderRadius: "2px",
          backgroundColor: "rgba(156,149,144,0.3)", margin: "8px auto 0",
        }} />

        <div style={{ padding: "16px 20px 32px" }}>
          {/* Header */}
          <p style={{
            textAlign: "center", fontSize: "0.9375rem", fontWeight: 500,
            color: "var(--bx-primary)", marginBottom: "16px",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
          }}>
            分享文章
          </p>

          {/* OG Preview Card */}
          <div style={{
            borderRadius: "10px", overflow: "hidden",
            border: "1px solid rgba(156,149,144,0.15)",
            backgroundColor: "#2D2A26", marginBottom: "20px",
            position: "relative",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => { ogImgRef.current = el; }}
              src={ogUrl}
              alt={title}
              style={{
                width: "100%", display: ogLoaded ? "block" : "none",
              }}
              onLoad={() => setOgLoaded(true)}
            />
            {!ogLoaded && (
              <div style={{
                width: "100%", aspectRatio: "1200/630",
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "#2D2A26",
              }}>
                <p style={{ color: "#9C9590", fontSize: "0.8125rem" }}>加载中…</p>
              </div>
            )}
            {/* Card footer overlay */}
            <div style={{
              padding: "10px 14px", display: "flex", alignItems: "center",
              justifyContent: "space-between", backgroundColor: "#2D2A26",
              borderTop: "1px solid rgba(156,149,144,0.1)",
            }}>
              <span style={{ fontSize: "0.75rem", color: "#9C9590", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {title}
              </span>
              <span style={{ fontSize: "0.6875rem", color: "#9C9590", opacity: 0.6, whiteSpace: "nowrap", marginLeft: "8px" }}>
                northwalking.cn
              </span>
            </div>
          </div>

          {/* WeChat guidance */}
          {isWeChat && (
            <div style={{
              backgroundColor: "rgba(7,193,96,0.08)", borderRadius: "8px",
              padding: "10px 14px", marginBottom: "16px",
              fontSize: "0.8125rem", color: "var(--bx-primary)", lineHeight: 1.6,
              textAlign: "center",
            }}>
              点击右上角 <span style={{ fontWeight: 600 }}>···</span> 选择「发送给朋友」或「分享到朋友圈」
            </div>
          )}

          {/* Share hint */}
          {shareFailed && !isWeChat && (
            <p style={{
              textAlign: "center", fontSize: "0.75rem", color: "var(--bx-secondary)",
              marginBottom: "12px", lineHeight: 1.5,
            }}>
              复制链接，贴到微信即可显示上方卡片
            </p>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Copy link — primary action */}
            <button
              type="button"
              onClick={handleCopy}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                border: "none", backgroundColor: "#2D2A26",
                color: copied ? "#6B8F5E" : "var(--bx-neutral)",
                fontSize: "0.9375rem", cursor: "pointer",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                transition: "color 150ms ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px", fontWeight: 500,
              }}
            >
              {copied ? (
                <>✓ 已复制，可粘贴分享</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  复制链接
                </>
              )}
            </button>

            {/* Save image */}
            <button
              type="button"
              onClick={handleSaveImage}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                border: "1px solid rgba(156,149,144,0.25)",
                backgroundColor: "transparent",
                color: "var(--bx-primary)",
                fontSize: "0.9375rem", cursor: "pointer",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              保存图片
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                border: "none", backgroundColor: "transparent",
                fontSize: "0.9375rem", color: "var(--bx-secondary)",
                cursor: "pointer", fontFamily: '"Noto Sans SC", Inter, sans-serif',
              }}
            >
              取消
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .share-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(45,42,38,0);
          transition: background 260ms ease;
          pointer-events: none;
        }
        .share-backdrop.share--active {
          background: rgba(45,42,38,0.35);
          pointer-events: auto;
        }
        .share-panel {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 101;
          background: var(--bx-neutral);
          border-radius: 16px 16px 0 0;
          transform: translateY(100%);
          transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
          max-height: 85dvh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 -2px 20px rgba(45,42,38,0.08);
        }
        .share-panel.share--active {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}
