"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

const SECTION_LABELS: Record<string, string> = { explore: "自我探索", improve: "自我提升", realize: "自我实现" };
const SECTION_ORDER = ["explore", "improve", "realize"];

type Topic = { id: string; name: string; description: string | null; section: string };

export default function TopicsTab() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSection, setEditSection] = useState("explore");
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSection, setNewSection] = useState("explore");
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/topics");
    if (res.ok) setTopics(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const startEdit = (t: Topic) => { setEditing(t); setEditName(t.name); setEditDesc(t.description ?? ""); setEditSection(t.section); };
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editName.trim() || !editing) return;
    await fetch(`/api/topics/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName, description: editDesc, section: editSection }) });
    setEditing(null);
    fetchTopics();
  };

  const createTopic = async () => {
    if (!newName.trim()) return;
    await fetch("/api/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName, description: newDesc, section: newSection }) });
    setNewOpen(false); setNewName(""); setNewDesc("");
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
        <Button onClick={() => setNewOpen(true)} className="rounded-full px-5 py-2 text-sm" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>
          <Plus size={16} className="mr-1" /> 新建主题
        </Button>
      </div>

      {SECTION_ORDER.map((sec) => {
        const sectionTopics = topics.filter((t) => t.section === sec);
        return (
          <div key={sec} className="mb-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: "#9C9590" }}>{SECTION_LABELS[sec]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectionTopics.map((t) =>
                editing?.id === t.id ? (
                  /* Inline edit card */
                  <div key={t.id} className="p-4 border rounded-lg space-y-3" style={{ borderColor: "#A67C52", borderWidth: "2px" }}>
                    <Input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border-0 border-b rounded-none font-semibold text-base"
                      style={{ borderColor: "#9C9590", backgroundColor: "transparent", color: "#2D2A26", padding: "6px 0" }}
                    />
                    <Input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="border-0 border-b rounded-none text-sm"
                      style={{ borderColor: "#9C9590", backgroundColor: "transparent", color: "#2D2A26", padding: "4px 0" }}
                      placeholder="描述（可选）"
                    />
                    <select value={editSection} onChange={(e) => setEditSection(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded text-sm bg-transparent" style={{ borderColor: "#9C9590", color: "#2D2A26" }}>
                      {SECTION_ORDER.map((s) => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <button onClick={cancelEdit} className="p-2 rounded hover:bg-[#F5F1EB]" style={{ color: "#9C9590" }}><X size={16} /></button>
                      <button onClick={saveEdit} className="p-2 rounded" style={{ color: "#F5F1EB", backgroundColor: "#2D2A26" }}><Check size={16} /></button>
                    </div>
                  </div>
                ) : (
                  /* Display card */
                  <div key={t.id} className="p-4 border rounded-lg space-y-2 group transition-colors hover:border-[#A67C5240]" style={{ borderColor: "#E8E3DC" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm" style={{ color: "#2D2A26" }}>{t.name}</span>
                        {t.description && <p className="text-xs mt-1" style={{ color: "#9C9590" }}>{t.description}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(t)} className="p-1.5 rounded hover:bg-[#F5F1EB]" style={{ color: "#9C9590" }}><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded hover:bg-[#F5F1EB]" style={{ color: "#9C9590" }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                )
              )}
              {/* New card (only for this section in newOpen mode) */}
              {newOpen && newSection === sec && (
                <div className="p-4 border rounded-lg space-y-3" style={{ borderColor: "#A67C52", borderWidth: "2px" }}>
                  <Input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border-0 border-b rounded-none font-semibold text-base"
                    style={{ borderColor: "#9C9590", backgroundColor: "transparent", color: "#2D2A26", padding: "6px 0" }}
                    placeholder="主题名称"
                  />
                  <Input
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="border-0 border-b rounded-none text-sm"
                    style={{ borderColor: "#9C9590", backgroundColor: "transparent", color: "#2D2A26", padding: "4px 0" }}
                    placeholder="描述（可选）"
                  />
                  <select value={newSection} onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded text-sm bg-transparent" style={{ borderColor: "#9C9590", color: "#2D2A26" }}>
                    {SECTION_ORDER.map((s) => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
                  </select>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setNewOpen(false); setNewName(""); setNewDesc(""); }} className="p-2 rounded hover:bg-[#F5F1EB]" style={{ color: "#9C9590" }}><X size={16} /></button>
                    <button onClick={createTopic} className="p-2 rounded" style={{ color: "#F5F1EB", backgroundColor: "#2D2A26" }}><Check size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {topics.length === 0 && !newOpen && <p className="text-center py-8" style={{ color: "#9C9590" }}>暂无主题，点击上方按钮新建</p>}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold" style={{ color: "#2D2A26" }}>确认删除</h3>
            <p className="text-sm" style={{ color: "#9C9590" }}>确定要删除「{deleteTarget.name}」吗？</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-full">取消</Button>
              <Button onClick={handleDelete} className="rounded-full" style={{ backgroundColor: "#B85450", color: "#F5F1EB" }}>删除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
