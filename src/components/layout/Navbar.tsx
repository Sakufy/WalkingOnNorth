"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

/* ============================================
 * Search Dialog
 * ============================================ */

function SearchDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Array<{ slug: string; title: string; section: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setQ(""); setResults([]); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) setResults(await res.json());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(q), 200);
    return () => clearTimeout(t);
  }, [q, doSearch]);

  if (!open) return null;

  const sectionNames: Record<string, string> = { explore: "自我探索", improve: "自我提升", realize: "自我实现" };

  return (
    <>
      {/* Click-outside layer */}
      <div style={{ position: "fixed", inset: 0, zIndex: 59 }} onClick={onClose} />
      {/* Dropdown */}
      <div style={{
        position: "absolute", top: "100%", right: "16px", zIndex: 60,
        width: "min(320px, calc(100vw - 32px))", maxHeight: "320px",
        backgroundColor: "var(--bx-neutral)", borderRadius: "6px",
        boxShadow: "0 2px 12px rgba(45,42,38,0.1)", overflow: "hidden",
        border: "1px solid rgba(156,149,144,0.12)",
      }}>
        <div style={{ padding: "8px 12px" }}>
            <input ref={inputRef} type="text" value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索文章…"
            style={{
              width: "100%", border: "none", outline: "none", fontSize: "16px",
              fontFamily: '"Noto Sans SC",Inter,sans-serif', color: "var(--bx-primary)",
              backgroundColor: "transparent", padding: "2px 0",
            }} />
        </div>
        {q && (
          <div style={{ overflowY: "auto", maxHeight: "280px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
            {results.length === 0 ? (
              <p style={{ padding: "14px 12px", color: "var(--bx-secondary)", fontSize: "0.8125rem", textAlign: "center" }}>无结果</p>
            ) : (
              results.map((r) => (
                <Link key={r.slug} href={`/posts/${r.slug}`} onClick={onClose}
                  style={{ textDecoration: "none", display: "block", padding: "8px 12px", borderBottom: "1px solid rgba(156,149,144,0.06)" }}>
                  <span style={{ fontSize: "0.6875rem", color: "var(--bx-tertiary)" }}>
                    {sectionNames[r.section] ?? r.section}
                  </span>
                  <div style={{ fontFamily: '"Noto Serif SC",serif', fontWeight: 600, fontSize: "0.875rem", color: "var(--bx-primary)", lineHeight: 1.3 }}>{r.title}</div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================
 * Navbar
 * ============================================ */

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        backgroundColor: "var(--bx-neutral)", borderBottom: "1px solid rgba(156,149,144,0.2)",
      }}>
        <div style={{
          maxWidth: "800px", margin: "0 auto", height: "44px",
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
        }}>
          {/* Left: site name = home */}
          <Link href="/" style={{
            fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
            fontSize: "1rem", color: "var(--bx-primary)", textDecoration: "none", letterSpacing: "-0.01em",
          }}>北行之路</Link>

          {/* Center: 长路纪行 */}
          <Link href="/articles" style={{
            fontSize: "0.9375rem",
            color: pathname.startsWith("/articles") ? "var(--bx-tertiary)" : "var(--bx-primary)",
            fontFamily: '"Noto Sans SC",Inter,sans-serif', textDecoration: "none",
          }}>长路纪行</Link>

          {/* Right: hamburger only */}
          <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <SearchDropdown open={searchOpen} onClose={() => setSearchOpen(false)} />

            {/* Hamburger */}
            <button type="button" aria-label="菜单"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              style={{
                width: "44px", height: "44px", display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center", gap: "4px",
                padding: 0, margin: 0, border: "none", background: "transparent",
                cursor: "pointer", touchAction: "manipulation", zIndex: 50, outline: "none",
              }}>
              <span style={{ display: "block", width: "18px", height: "2px", backgroundColor: "var(--bx-primary)", transition: "transform 200ms ease", transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
              <span style={{ display: "block", width: "18px", height: "2px", backgroundColor: "var(--bx-primary)", transition: "opacity 200ms ease", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: "18px", height: "2px", backgroundColor: "var(--bx-primary)", transition: "transform 200ms ease", transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Popover menu */}
        {menuOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 38 }} onClick={() => setMenuOpen(false)} />
            <div style={{
              position: "absolute", top: "100%", right: "8px", zIndex: 39,
              width: "200px", backgroundColor: "var(--bx-neutral)",
              borderRadius: "6px", boxShadow: "0 2px 12px rgba(45,42,38,0.1)",
              border: "1px solid rgba(156,149,144,0.12)", padding: "8px 0",
            }}>
              <button onClick={() => { setMenuOpen(false); setSearchOpen(true); }} style={{
                display: "block", width: "100%", textAlign: "left", padding: "8px 16px",
                fontSize: "0.9375rem", color: "var(--bx-primary)", fontFamily: '"Noto Sans SC",Inter,sans-serif',
                background: "none", border: "none", cursor: "pointer",
              }}>搜索</button>
              <Link href="/about" onClick={() => setMenuOpen(false)} style={{
                display: "block", padding: "8px 16px", fontSize: "0.9375rem",
                color: pathname === "/about" ? "var(--bx-tertiary)" : "var(--bx-primary)",
                fontFamily: '"Noto Sans SC",Inter,sans-serif', textDecoration: "none",
              }}>关于</Link>
              <div style={{ margin: "4px 0", borderTop: "1px solid rgba(156,149,144,0.1)" }} />
              {session?.user ? (
                <>
                  <div style={{ padding: "4px 16px", fontSize: "0.8125rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>{session.user.name}</div>
                  {session.user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} style={{
                      display: "block", padding: "6px 16px", fontSize: "0.875rem", color: "var(--bx-secondary)",
                      fontFamily: '"Noto Sans SC",Inter,sans-serif', textDecoration: "none",
                    }}>后台</Link>
                  )}
                  <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 16px", fontSize: "0.875rem", color: "var(--bx-secondary)", border: "none", background: "none", cursor: "pointer" }}>
                    退出
                  </button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{
                  display: "block", padding: "8px 16px", fontSize: "0.9375rem", color: "var(--bx-tertiary)",
                  fontFamily: '"Noto Sans SC",Inter,sans-serif', textDecoration: "none",
                }}>登录</Link>
              )}
            </div>
          </>
        )}
      </header>
    </>
  );
}
