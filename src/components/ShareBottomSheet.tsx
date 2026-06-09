"use client";

import { useState, useEffect, useCallback } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  section: string;
  url: string;
  slug: string;
};

/**
 * Share bottom sheet — shows OG preview card (小红书 style) with two actions:
 * 1. Copy image — copies the OG card image to clipboard (paste into WeChat/anywhere)
 * 2. Copy link — copies the article URL
 */
export function ShareBottomSheet({ open, onClose, title, summary, section, url, slug }: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState<"image" | "link" | null>(null);
  const [ogLoaded, setOgLoaded] = useState(false);

  // Phase 1: show DOM when open
  useEffect(() => {
    if (open) {
      setVisible(true);
      setCopied(null);
      setOgLoaded(false);
    }
  }, [open]);

  // Phase 2: animate in AFTER DOM exists (depends on visible, not open)
  useEffect(() => {
    if (!visible) return;
    const raf = requestAnimationFrame(() => {
      document.getElementById("share-backdrop")?.classList.add("s-active");
      document.getElementById("share-panel")?.classList.add("s-active");
    });
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  // Phase 3: animate out when closed
  useEffect(() => {
    if (open || !visible) return;
    // already animating out (triggered by onClose)
  }, [open, visible]);

  // onClose: animate out → unmount after transition
  const handleClose = useCallback(() => {
    document.getElementById("share-backdrop")?.classList.remove("s-active");
    document.getElementById("share-panel")?.classList.remove("s-active");
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 260);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const ogUrl = `/api/og?title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&section=${encodeURIComponent(section)}&slug=${encodeURIComponent(slug)}`;

  // Copy image to clipboard
  const handleCopyImage = useCallback(async () => {
    try {
      const res = await fetch(ogUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied("image");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback: download image
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
      setCopied("image");
      setTimeout(() => setCopied(null), 2000);
    }
  }, [ogUrl, title]);

  // Copy link
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied("link");
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {});
  }, [url]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        id="share-backdrop"
        className="s-backdrop"
        onClick={handleClose}
        role="button"
        tabIndex={-1}
        aria-label="关闭"
      />

      {/* Panel */}
      <div id="share-panel" className="s-panel">
        <div style={{
          width: "36px", height: "4px", borderRadius: "2px",
          backgroundColor: "rgba(156,149,144,0.3)", margin: "8px auto 0",
        }} />

        <div style={{ padding: "16px 20px 32px" }}>
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
            marginBottom: "20px",
            backgroundColor: "#2D2A26",
            position: "relative",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
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
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Copy image */}
            <button
              type="button"
              onClick={handleCopyImage}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                border: "none", backgroundColor: "#2D2A26",
                color: copied === "image" ? "#6B8F5E" : "var(--bx-neutral)",
                fontSize: "0.9375rem", cursor: "pointer", fontWeight: 500,
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
                transition: "color 150ms ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px",
              }}
            >
              {copied === "image" ? (
                "✓ 图片已复制"
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  复制图片
                </>
              )}
            </button>

            {/* Copy link */}
            <button
              type="button"
              onClick={handleCopyLink}
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
              {copied === "link" ? (
                "✓ 链接已复制"
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

            {/* Cancel */}
            <button
              type="button"
              onClick={handleClose}
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
        .s-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(45,42,38,0);
          transition: background 260ms ease;
          pointer-events: none;
        }
        .s-backdrop.s-active {
          background: rgba(45,42,38,0.35);
          pointer-events: auto;
        }
        .s-panel {
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
        .s-panel.s-active {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}
