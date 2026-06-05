import Link from "next/link";
import { FileText, MessageSquare, Settings, Home } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1
        className="text-2xl font-semibold mb-2"
        style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}
      >
        后台仪表盘
      </h1>
      <p className="mb-8" style={{ color: "#9C9590" }}>
        管理文章、评论和站点内容
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardCard
          href="/admin/articles"
          icon={<FileText size={24} />}
          title="文章管理"
          description="新建、编辑、发布文章，管理版本历史"
        />
        <DashboardCard
          href="/admin/comments"
          icon={<MessageSquare size={24} />}
          title="评论审核"
          description="审核评论，管理高价值标记"
        />
        <DashboardCard
          href="/admin/settings"
          icon={<Settings size={24} />}
          title="站点设置"
          description="页面内容、主题管理、用户管理"
        />
        <DashboardCard
          href="/"
          icon={<Home size={24} />}
          title="回到前台"
          description="以访客视角浏览网站"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block p-6 border rounded-lg transition-colors hover:bg-[#F5F1EB]"
      style={{ borderColor: "#E8E3DC" }}
    >
      <div className="mb-3" style={{ color: "#2D2A26" }}>{icon}</div>
      <h2 className="font-medium mb-1" style={{ color: "#2D2A26" }}>{title}</h2>
      <p className="text-sm" style={{ color: "#9C9590" }}>{description}</p>
    </Link>
  );
}
