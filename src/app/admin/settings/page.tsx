"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PageContentTab = dynamic(() => import("./page-content-tab"), {
  loading: () => <div className="text-center py-12" style={{ color: "#9C9590" }}>加载中…</div>,
});

const TopicsTab = dynamic(() => import("./topics-tab"), {
  loading: () => <div className="text-center py-12" style={{ color: "#9C9590" }}>加载中…</div>,
});

const UsersTab = dynamic(() => import("./users-tab"), {
  loading: () => <div className="text-center py-12" style={{ color: "#9C9590" }}>加载中…</div>,
});

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1
        className="text-2xl font-semibold mb-6"
        style={{ fontFamily: '"Noto Serif SC", serif', color: "#2D2A26" }}
      >
        站点设置
      </h1>
      <Tabs defaultValue="pages">
        <TabsList className="mb-6">
          <TabsTrigger value="pages">页面内容</TabsTrigger>
          <TabsTrigger value="topics">主题管理</TabsTrigger>
          <TabsTrigger value="users">用户管理</TabsTrigger>
        </TabsList>
        <TabsContent value="pages"><PageContentTab /></TabsContent>
        <TabsContent value="topics"><TopicsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
      </Tabs>
    </div>
  );
}
