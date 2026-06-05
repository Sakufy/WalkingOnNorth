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
    <nav className="border-b border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 flex items-center gap-1">
        <Link
          href="/admin"
          className="text-sm font-heading text-text-primary px-2 mr-4"
        >
          后台
        </Link>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors duration-150 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
