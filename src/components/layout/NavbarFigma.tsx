"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", label: "首页" },
  { to: "/articles", label: "长路纪行" },
  { to: "/about", label: "关于" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name || "用户";
  const initial = userName.charAt(0);

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full"
        style={{ backgroundColor: "var(--bx-primary)", color: "var(--bx-on-primary)" }}
      >
        跳至正文
      </a>

      {/* Desktop nav */}
      <nav
        className="hidden sm:flex sticky top-0 z-40 w-full items-center justify-between px-8 h-16"
        style={{
          backgroundColor: "var(--bx-neutral)",
          borderBottom: "1px solid rgba(156, 149, 144, 0.25)",
        }}
        aria-label="主导航"
      >
        <Link
          href="/"
          style={{
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            fontWeight: 600,
            fontSize: "1.125rem",
            color: "var(--bx-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          北行之路
        </Link>

        <div className="flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              style={{
                fontSize: "0.9375rem",
                color: pathname === to ? "var(--bx-tertiary)" : "var(--bx-primary)",
                transition: "color 150ms ease",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--bx-tertiary)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = pathname === to ? "var(--bx-tertiary)" : "var(--bx-primary)"; }}
            >
              {label}
            </Link>
          ))}

          {/* Auth section */}
          {status !== "loading" && (
            isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-opacity duration-150 hover:opacity-85"
                    style={{
                      backgroundColor: "var(--bx-primary)",
                      color: "var(--bx-on-primary)",
                      fontFamily: '"Noto Sans SC", Inter, sans-serif',
                    }}
                    aria-label="用户菜单"
                  >
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40"
                  style={{
                    backgroundColor: "var(--bx-neutral)",
                    borderColor: "rgba(156, 149, 144, 0.25)",
                  }}
                >
                  <div
                    className="px-2 py-1.5 text-sm"
                    style={{
                      color: "var(--bx-secondary)",
                      fontFamily: '"Noto Sans SC", Inter, sans-serif',
                    }}
                  >
                    {userName}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="cursor-pointer"
                        style={{
                          color: "var(--bx-primary)",
                          fontFamily: '"Noto Sans SC", Inter, sans-serif',
                        }}
                      >
                        后台管理
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer"
                    style={{
                      color: "var(--bx-primary)",
                      fontFamily: '"Noto Sans SC", Inter, sans-serif',
                    }}
                  >
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/login"
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--bx-primary)",
                  fontFamily: '"Noto Sans SC", Inter, sans-serif',
                  padding: "0.375rem 1.25rem",
                  border: "1px solid var(--bx-primary)",
                  borderRadius: "9999px",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--bx-tertiary)";
                  e.currentTarget.style.borderColor = "var(--bx-tertiary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--bx-primary)";
                  e.currentTarget.style.borderColor = "var(--bx-primary)";
                }}
              >
                登录
              </Link>
            )
          )}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-14"
        style={{
          backgroundColor: "var(--bx-neutral)",
          borderTop: "1px solid rgba(156, 149, 144, 0.25)",
        }}
        aria-label="底部导航"
      >
        {[
          { to: "/", label: "首页" },
          { to: "/articles", label: "长路纪行" },
          { to: "/about", label: "关于" },
        ].map(({ to, label }) => (
          <Link
            key={to}
            href={to}
            className="flex flex-col items-center gap-0.5 px-4 py-1"
            style={{
              fontSize: "0.75rem",
              color: pathname === to ? "var(--bx-tertiary)" : "var(--bx-secondary)",
              fontFamily: '"Noto Sans SC", Inter, sans-serif',
            }}
          >
            {label}
          </Link>
        ))}

        {/* Mobile auth */}
        {status !== "loading" && (
          isLoggedIn ? (
            <Link
              href={isAdmin ? "/admin" : "/"}
              className="flex flex-col items-center gap-0.5 px-4 py-1"
              style={{
                fontSize: "0.75rem",
                color: "var(--bx-secondary)",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
              }}
            >
              <span
                className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium leading-none"
                style={{
                  backgroundColor: "var(--bx-primary)",
                  color: "var(--bx-on-primary)",
                }}
              >
                {initial}
              </span>
              我的
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="flex flex-col items-center gap-0.5 px-4 py-1"
              style={{
                fontSize: "0.75rem",
                color: "var(--bx-secondary)",
                fontFamily: '"Noto Sans SC", Inter, sans-serif',
              }}
            >
              登录
            </Link>
          )
        )}
      </nav>
    </>
  );
}
