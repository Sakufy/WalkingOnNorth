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
 * Custom share panel — shown when Web Share API is unsupported
 * (Xiaomi browsers, WeChat WebView, desktop, etc.).
 *
 * Shows a share preview card (generated via /api/og) plus copy-link
 * and platform-specific guidance (WeChat: tap top-right ···).
 */
export function ShareBottomSheet({ open, onClose, title, summary, section, url }: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Animate in/out via a single render + opacity toggle
  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById("share-sheet-backdrop")?.classList.add("share-sheet--active");
          document.getElementById("share-sheet-panel")?.classList.add("share-sheet--active");
        });
      });
    } else {
      document.getElementById("share-sheet-backdrop")?.classList.remove("share-sheet--active");
      document.getElementById("share-sheet-panel")?.classList.remove("share-sheet--active");
      const t = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [url]);

  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&section=${encodeURIComponent(section)}`;

  if (!visible) return null;

  const isWeChat = typeof navigator !== "undefined" && /micromessenger/i.test(navigator.userAgent);

  return (
    <>
      {/* Backdrop */}
      <div
        id="share-sheet-backdrop"
        className="share-sheet-backdrop"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="关闭分享面板"
      />

      {/* Panel */}
      <div id="share-sheet-panel" className="share-sheet-panel">
        {/* Drag handle */}
        <div style={{
          width: "36px", height: "4px", borderRadius: "2px",
          backgroundColor: "rgba(156,149,144,0.3)", margin: "8px auto 0",
        }} />

        <div style={{ padding: "20px 20px 32px" }}>
          {/* Title */}
          <p style={{
            textAlign: "center", fontSize: "0.9375rem", fontWeight: 500,
            color: "var(--bx-primary)", marginBottom: "16px",
            fontFamily: '"Noto Sans SC", Inter, sans-serif',
          }}>
            分享文章
          </p>

          {/* WeChat guidance */}
          {isWeChat && (
            <div style={{
              backgroundColor: "rgba(7,193,96,0.08)", borderRadius: "8px",
              padding: "12px 16px", marginBottom: "16px",
              fontSize: "0.8125rem", color: "var(--bx-primary)", lineHeight: 1.6,
              textAlign: "center",
            }}>
              点击右上角 <span style={{ fontWeight: 600 }}>···</span> 选择「发送给朋友」或「分享到朋友圈」
            </div>
          )}

          {/* Share preview card */}
          <div style={{
            borderRadius: "10px", overflow: "hidden",
            border: "1px solid rgba(156,149,144,0.15)",
            backgroundColor: "#F5F1EB", marginBottom: "20px",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogImageUrl}
              alt={title}
              style={{ width: "100%", display: "block" }}
              loading="lazy"
            />
            <div style={{
              padding: "12px 16px", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "8px",
            }}>
              <span style={{
                fontSize: "0.8125rem", color: "var(--bx-primary)",
                fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", flex: 1,
              }}>
                {title}
              </span>
              <span style={{
                fontSize: "0.75rem", color: "var(--bx-secondary)",
                whiteSpace: "nowrap",
              }}>
                northwalking.cn
              </span>
            </div>
          </div>

          {/* Copy link button */}
          <button
            type="button"
            onClick={handleCopy}
            style={{
              width: "100%", padding: "12px", borderRadius: "8px",
              border: "1px solid rgba(156,149,144,0.25)",
              backgroundColor: "var(--bx-neutral)",
              fontSize: "0.9375rem", color: copied ? "#6B8F5E" : "var(--bx-primary)",
              cursor: "pointer", fontFamily: '"Noto Sans SC", Inter, sans-serif',
              transition: "border-color 150ms ease, color 150ms ease",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", marginBottom: "8px",
            }}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                已复制
              </>
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

          {/* Close */}
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

      <style>{`
        .share-sheet-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(45,42,38,0);
          transition: background 250ms ease;
          pointer-events: none;
        }
        .share-sheet-backdrop.share-sheet--active {
          background: rgba(45,42,38,0.35);
          pointer-events: auto;
        }
        .share-sheet-panel {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 101;
          background: var(--bx-neutral);
          border-radius: 16px 16px 0 0;
          transform: translateY(100%);
          transition: transform 250ms cubic-bezier(0.32, 0.72, 0, 1);
          max-height: 85dvh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 -2px 20px rgba(45,42,38,0.08);
        }
        .share-sheet-panel.share-sheet--active {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}
