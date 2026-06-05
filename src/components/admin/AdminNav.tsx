"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, MessageSquare, Settings, Gauge } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "仪表盘", icon: Gauge },
  { href: "/admin/articles", label: "文章", icon: FileText },
  { href: "/admin/comments", label: "评论", icon: MessageSquare },
  { href: "/admin/settings", label: "设置", icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b" style={{ borderColor: "rgba(156,149,144,0.15)", backgroundColor: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-[48px]">
        <Link
          href="/admin"
          className="text-base font-semibold mr-6 shrink-0"
          style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}
        >
          后台
        </Link>
        <div className="flex items-center gap-1 h-full">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 h-full text-sm border-b-2 transition-colors"
                style={{
                  borderColor: isActive ? "#A67C52" : "transparent",
                  color: isActive ? "#2D2A26" : "#9C9590",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
