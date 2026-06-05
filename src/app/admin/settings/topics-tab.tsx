"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

const SECTION_ORDER = ["explore", "improve", "realize"];

export default function TopicsTab() {
  const [topics, setTopics] = useState<Array<{ id: string; name: string; description: string | null; section: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof topics[0] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<typeof topics[0] | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSection] = useState("explore");

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/topics");
    if (res.ok) setTopics(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const openNew = () => {
    setEditTarget(null); setName(""); setDescription(""); setSection("explore");
    setDialogOpen(true);
  };

  const openEdit = (t: typeof topics[0]) => {
    setEditTarget(t); setName(t.name); setDescription(t.description ?? ""); setSection(t.section);
    setDialogOpen(true);
  };

  const handleSaveTopic = async () => {
    if (!name.trim()) return;
    if (editTarget) {
      await fetch(`/api/topics/${editTarget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, section }) });
    } else {
      await fetch("/api/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, section }) });
    }
    setDialogOpen(false);
    fetchTopics();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/topics/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchTopics();
  };

  if (loading) return <div className="text-center py-12" style={{ color: "#9C9590" }}>加载中…</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="rounded-full px-4" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>
          <Plus size={14} className="mr-1" /> 新建主题
        </Button>
      </div>
      <div className="space-y-6">
        {SECTION_ORDER.map((sec) => {
          const sectionTopics = topics.filter((t) => t.section === sec);
          if (sectionTopics.length === 0) return null;
          return (
            <div key={sec}>
              <h3 className="text-sm font-medium mb-2" style={{ color: "#9C9590" }}>{SECTION_LABELS[sec]}</h3>
              <div className="space-y-2">
                {sectionTopics.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg" style={{ borderColor: "#E8E3DC" }}>
                    <div>
                      <span className="font-medium text-sm" style={{ color: "#2D2A26" }}>{t.name}</span>
                      {t.description && <p className="text-xs mt-0.5" style={{ color: "#9C9590" }}>{t.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-[#F5F1EB]" style={{ color: "#9C9590" }}><Pencil size={14} /></button>
                      <button onClick={() => setDeleteTarget(t)} className="p-1 rounded hover:bg-[#F5F1EB]" style={{ color: "#9C9590" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {topics.length === 0 && <p className="text-center py-8" style={{ color: "#9C9590" }}>暂无主题</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTarget ? "编辑主题" : "新建主题"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="主题名称" value={name} onChange={(e) => setName(e.target.value)} style={{ borderColor: "#9C9590" }} />
            <Input placeholder="描述（可选）" value={description} onChange={(e) => setDescription(e.target.value)} style={{ borderColor: "#9C9590" }} />
            <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" style={{ borderColor: "#9C9590", color: "#2D2A26" }}>
              {SECTION_ORDER.map((s) => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">取消</Button>
            <Button onClick={handleSaveTopic} className="rounded-full" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm" style={{ color: "#9C9590" }}>确定要删除「{deleteTarget?.name}」吗？</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-full">取消</Button>
            <Button onClick={handleDelete} className="rounded-full" style={{ backgroundColor: "#B85450", color: "#F5F1EB" }}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
