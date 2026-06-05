"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Pencil, Trash2, Loader2, Plus, Save } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

const SECTION_ORDER = ["explore", "improve", "realize"];

/* ============================================
 * Default homepage JSON (mirrors frontend)
 * ============================================ */

const DEFAULT_HOME_DATA = {
  slogan: "向内探寻，向北而行",
  philosophy: [
    "北行之路从不是被划定的人生轨道，而是一片任由自我开拓的旷野。",
    "我们拒绝世俗单一的成功规训，以自我探索、自我提升、自我实现为完整成长闭环；依托亲身实战沉淀学习方法论，借持续创作沉淀思想，用内容联结同频、交换价值。",
    "在这里，所有文字都是成长的沉淀，每一次分享都是双向的成长迭代。",
  ],
  audience: [
    { title: "不甘规训者", trait: "独立意志，拒绝从众", text: "不盲从世俗的标准答案，不被流水线人生裹挟。拥有自己的判断体系，愿意为内心的选择，承受独行的代价。" },
    { title: "向内求索者", trait: "深度自省，探寻本心", text: "不满足表层生活，长期思考自我、价值与人生意义。愿意直面迷茫，把困惑当作自我迭代、向内扎根的契机。" },
    { title: "务实破局者", trait: "摒弃内耗，行动至上", text: "厌恶空想与精神内耗，不信抱怨、只信迭代。接纳现实的不完美，始终以行动破局，以精进对抗焦虑。" },
    { title: "长期践行者", trait: "追求自洽，实现自我", text: "不屑短期功利的泡沫价值，追求长久的内心自洽与成长复利。渴望搭建属于自己的人生体系，最终完成自我价值的创造与落地。" },
  ],
  sections: {
    thinking: { subtitle: "向内求索，确立本心", intro: "收录北行世界观、价值观、人生观、能量价值理论，拆解精神内耗与自我觉醒，理清人生选择底层逻辑。", action: "进入探索" },
    reading: { subtitle: "打磨能力，精进成长", intro: "分享高考自学、大学专业课、身心能量管理全套落地方法论，所有方法均来自亲身实践验证。", action: "查看干货" },
    journey: { subtitle: "落地价值，向外输出", intro: "记录付费咨询、北行者同行计划筹备、个人项目与软件开发全流程，见证能力落地与价值变现。", action: "了解实践" },
  },
};

type HomeData = typeof DEFAULT_HOME_DATA;

/* ============================================
 * Shared input style
 * ============================================ */

const inputStyle: React.CSSProperties = {
  border: "none",
  borderBottom: "1px solid rgba(156, 149, 144, 0.3)",
  padding: "6px 0",
  color: "var(--bx-primary)",
  backgroundColor: "transparent",
  outline: "none",
  fontFamily: '"Noto Serif SC", serif',
  fontSize: "0.9375rem",
  borderRadius: 0,
  width: "100%",
};

const sectionCard: React.CSSProperties = {
  border: "1px solid rgba(156, 149, 144, 0.2)",
  borderRadius: "8px",
  padding: "20px 24px",
  backgroundColor: "transparent",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--bx-secondary)",
  marginBottom: "4px",
  fontFamily: '"Noto Sans SC", Inter, sans-serif',
  letterSpacing: "0.02em",
};

/* ============================================
 * Tab 1: Page Content — Fixed-form editor
 * ============================================ */

type SectionKey = "thinking" | "reading" | "journey";
type AboutSection = { heading: string; body?: string[]; concepts?: { name: string; text: string }[] };

const SECTION_NAMES: Record<SectionKey, string> = { thinking: "自我探索", reading: "自我提升", journey: "自我实现" };

function PageContentTab() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["sections"]));
  const toggle = (id: string) => setExpanded((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const [homeData, setHomeData] = useState<HomeData>(DEFAULT_HOME_DATA);
  const [articlesData, setArticlesData] = useState({ headline: "长路纪行", intro: [""] });
  const [sectionsData, setSectionsData] = useState<Record<SectionKey, { headline: string; intro: string[] }>>({
    thinking: { headline: "自我探索", intro: [""] },
    reading: { headline: "自我提升", intro: [""] },
    journey: { headline: "自我实现", intro: [""] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const loadAbout = async () => {
    const res = await fetch("/api/pages/about");
    if (res.ok) {
      const j = await res.json();
      if (j.content) { try { const p = JSON.parse(j.content); if (p.sections) setAboutSections(p.sections); } catch { /* */ } }
    }
  };
  /* Load all data */
  useEffect(() => { (async () => {
    setLoading(true);
    try {
      const [homeRes, articlesRes, aboutRes] = await Promise.all([fetch("/api/pages/home"), fetch("/api/pages/articles"), fetch("/api/pages/about")]);
      if (homeRes.ok) { const j = await homeRes.json(); if (j.content) { const p = JSON.parse(j.content); setHomeData({ ...DEFAULT_HOME_DATA, ...p, audience: p.audience || DEFAULT_HOME_DATA.audience, philosophy: p.philosophy || DEFAULT_HOME_DATA.philosophy, sections: { ...DEFAULT_HOME_DATA.sections, ...(p.sections || {}) } }); } }
      if (articlesRes.ok) { const j = await articlesRes.json(); if (j.content) { const p = JSON.parse(j.content); setArticlesData({ headline: p.headline || "长路纪行", intro: p.intro || [""] }); } }
      if (aboutRes.ok) { const j = await aboutRes.json(); if (j.content) { try { const p = JSON.parse(j.content); if (p.sections) setAboutSections(p.sections); } catch { /* */ } } }
    } catch { /* defaults */ }
    // Load all 3 sections
    const keys: SectionKey[] = ["thinking", "reading", "journey"];
    const secData: Record<SectionKey, { headline: string; intro: string[] }> = { thinking: { headline: "自我探索", intro: [""] }, reading: { headline: "自我提升", intro: [""] }, journey: { headline: "自我实现", intro: [""] } };
    for (const key of keys) {
      try { const res = await fetch(`/api/pages/section-${key}`); if (res.ok) { const j = await res.json(); if (j.content) { const p = JSON.parse(j.content); secData[key] = { headline: p.headline || SECTION_NAMES[key], intro: p.intro || [""] }; } } } catch { /* */ }
    }
    setSectionsData(secData);
    setLoading(false);
  })(); }, []);

  const handleSave = async (slug: string, title: string, data: unknown) => {
    setSaving(slug);
    await fetch(`/api/pages/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content: JSON.stringify(data) }) });
    setSaving(null);
  };

  const updateField = <T extends keyof HomeData>(key: T, value: HomeData[T]) => setHomeData((prev) => ({ ...prev, [key]: value }));

  if (loading) return <div className="text-center py-12" style={{ color: "#9C9590" }}>加载中…</div>;

  const cardHead = (title: string, id: string) => (
    <button onClick={() => toggle(id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", fontFamily: '"Noto Serif SC",serif', fontSize: "1.0625rem", fontWeight: 600, color: "var(--bx-primary)" }}>
      {title}
      <span style={{ fontSize: "0.75rem", color: "var(--bx-secondary)", transition: "transform 200ms ease", transform: expanded.has(id) ? "rotate(90deg)" : "none" }}>▸</span>
    </button>
  );

  const saveBtn = (slug: string, label: string) => (
    <div className="flex justify-end mt-4"><Button onClick={() => handleSave(slug, label, slug === "home" ? homeData : slug === "articles" ? articlesData : sectionsData)} disabled={saving === slug} className="rounded-full px-6" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>{saving === slug ? <Loader2 className="animate-spin mr-1" size={14} /> : <Save size={14} className="mr-1" />}保存</Button></div>
  );

  return (
    <div className="space-y-3">
      {/* ---- HOME ---- */}
      <div style={{ border: "1px solid rgba(156,149,144,0.2)", borderRadius: "8px", overflow: "hidden" }}>
        {cardHead("首页（Slogan + 5 模块）", "home")}
        {expanded.has("home") && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div><div style={sectionLabel}>Slogan</div><input type="text" value={homeData.slogan} onChange={(e) => updateField("slogan", e.target.value)} style={{ ...inputStyle, fontSize: "1.125rem", fontWeight: 600 }} placeholder="向内探寻，向北而行" /></div>
              <div><div style={sectionLabel}>理念阐释（3 段）</div>{homeData.philosophy.map((t, i) => <textarea key={i} value={t} onChange={(e) => { const n = [...homeData.philosophy]; n[i] = e.target.value; updateField("philosophy", n); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginTop: i > 0 ? "12px" : "4px" }} />)}</div>
              <div><div style={sectionLabel}>人群卡片（4 张）</div>{homeData.audience.map((c, i) => <div key={i} style={{ marginTop: i > 0 ? "12px" : "4px", padding: "12px", border: "1px solid rgba(156,149,144,0.15)", borderRadius: "6px" }}><div style={{ ...sectionLabel, display: "inline-block" }}>卡片 {i + 1}</div><input type="text" value={c.title} onChange={(e) => { const n = [...homeData.audience]; n[i] = { ...n[i], title: e.target.value }; updateField("audience", n); }} style={{ ...inputStyle, marginTop: "4px" }} placeholder="标题" /><input type="text" value={c.trait} onChange={(e) => { const n = [...homeData.audience]; n[i] = { ...n[i], trait: e.target.value }; updateField("audience", n); }} style={{ ...inputStyle, fontSize: "0.8125rem", marginTop: "6px" }} placeholder="核心特质" /><textarea value={c.text} onChange={(e) => { const n = [...homeData.audience]; n[i] = { ...n[i], text: e.target.value }; updateField("audience", n); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, marginTop: "6px" }} placeholder="描述" /></div>)}</div>
              <div><div style={sectionLabel}>板块导引（3 张卡片）</div>{(Object.keys(homeData.sections) as Array<"thinking"|"reading"|"journey">).map((k) => <div key={k} style={{ marginTop: "8px", padding: "12px", border: "1px solid rgba(156,149,144,0.15)", borderRadius: "6px" }}><div style={{ ...sectionLabel, display: "inline-block" }}>{k === "thinking" ? "自我探索" : k === "reading" ? "自我提升" : "自我实现"}</div><input type="text" value={homeData.sections[k].subtitle} onChange={(e) => { const n = { ...homeData.sections }; n[k] = { ...n[k], subtitle: e.target.value }; updateField("sections", n); }} style={{ ...inputStyle, marginTop: "4px" }} placeholder="副标题" /><textarea value={homeData.sections[k].intro} onChange={(e) => { const n = { ...homeData.sections }; n[k] = { ...n[k], intro: e.target.value }; updateField("sections", n); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, marginTop: "6px" }} placeholder="简介" /><input type="text" value={homeData.sections[k].action} onChange={(e) => { const n = { ...homeData.sections }; n[k] = { ...n[k], action: e.target.value }; updateField("sections", n); }} style={{ ...inputStyle, fontSize: "0.875rem", marginTop: "6px" }} placeholder="按钮文字" /></div>)}</div>
              <p style={{ fontSize: "0.8125rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>模块 4（精选文章）由文章管理页的精选标记控制。</p>
            </div>
            {saveBtn("home", "首页")}
          </div>
        )}
      </div>

      {/* ---- ARTICLES ---- */}
      <div style={{ border: "1px solid rgba(156,149,144,0.2)", borderRadius: "8px", overflow: "hidden" }}>
        {cardHead("长路纪行（标题 + 介绍）", "articles")}
        {expanded.has("articles") && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div><div style={sectionLabel}>标题</div><input type="text" value={articlesData.headline} onChange={(e) => setArticlesData((d) => ({ ...d, headline: e.target.value }))} style={{ ...inputStyle, fontSize: "1.125rem", fontWeight: 600 }} /></div>
              <div><div style={sectionLabel}>介绍段落（3 段）</div>{articlesData.intro.map((t, i) => <textarea key={i} value={t} onChange={(e) => { const n = [...articlesData.intro]; n[i] = e.target.value; setArticlesData((d) => ({ ...d, intro: n })); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginTop: i > 0 ? "12px" : "4px" }} />)}</div>
            </div>
            {saveBtn("articles", "长路纪行")}
          </div>
        )}
      </div>

      {/* ---- SECTIONS (3-col) ---- */}
      <div style={{ border: "1px solid rgba(156,149,144,0.2)", borderRadius: "8px", overflow: "hidden" }}>
        {cardHead("板块介绍（3 板块并排）", "sections")}
        {expanded.has("sections") && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: "16px" }}>
              {(Object.keys(SECTION_NAMES) as SectionKey[]).map((key) => (
                <div key={key} style={{ padding: "12px", border: "1px solid rgba(156,149,144,0.15)", borderRadius: "6px" }}>
                  <div style={{ ...sectionLabel, color: "var(--bx-tertiary)" }}>{SECTION_NAMES[key]}</div>
                  <input type="text" value={sectionsData[key].headline} onChange={(e) => setSectionsData((d) => ({ ...d, [key]: { ...d[key], headline: e.target.value } }))} style={{ ...inputStyle, fontWeight: 600, marginTop: "4px" }} placeholder="标题" />
                  {sectionsData[key].intro.map((t, i) => <textarea key={i} value={t} onChange={(e) => { const n = [...sectionsData[key].intro]; n[i] = e.target.value; setSectionsData((d) => ({ ...d, [key]: { ...d[key], intro: n } })); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, marginTop: i > 0 ? "8px" : "6px" }} />)}
                  <div className="flex justify-end mt-3">
                    <Button onClick={() => handleSave(`section-${key}`, SECTION_NAMES[key], sectionsData[key])} disabled={saving === `section-${key}`} size="sm" className="rounded-full px-4" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>{saving === `section-${key}` ? "…" : "保存"}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- ABOUT ---- */}
      <div style={{ border: "1px solid rgba(156,149,144,0.2)", borderRadius: "8px", overflow: "hidden" }}>
        {cardHead("关于页（4 段结构）", "about")}
        {expanded.has("about") && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {aboutSections.map((sec, si) => (
                <div key={si} style={{ padding: "12px", border: "1px solid rgba(156,149,144,0.15)", borderRadius: "6px" }}>
                  <div style={{ ...sectionLabel, color: "var(--bx-tertiary)", marginBottom: "8px" }}>第 {si + 1} 段 · {sec.heading}</div>
                  <input type="text" value={sec.heading} onChange={(e) => { const n = [...aboutSections]; n[si] = { ...n[si], heading: e.target.value }; setAboutSections(n); }} style={{ ...inputStyle, fontWeight: 600 }} placeholder="段标题" />
                  {sec.concepts ? (
                    <div style={{ marginTop: "12px" }}>
                      <div style={{ ...sectionLabel, marginBottom: "8px" }}>概念卡片</div>
                      {(sec.concepts ?? []).map((c, ci) => (
                        <div key={ci} style={{ padding: "8px", borderBottom: ci < (sec.concepts?.length ?? 1) - 1 ? "1px solid rgba(156,149,144,0.1)" : "none" }}>
                          <input type="text" value={c.name} onChange={(e) => { const n = [...aboutSections]; const cn = [...(n[si].concepts ?? [])]; cn[ci] = { ...cn[ci], name: e.target.value }; n[si] = { ...n[si], concepts: cn }; setAboutSections(n); }} style={{ ...inputStyle, fontSize: "0.9375rem", marginBottom: "4px" }} placeholder="概念名" />
                          <textarea value={c.text} onChange={(e) => { const n = [...aboutSections]; const cn = [...(n[si].concepts ?? [])]; cn[ci] = { ...cn[ci], text: e.target.value }; n[si] = { ...n[si], concepts: cn }; setAboutSections(n); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontSize: "0.8125rem" }} placeholder="释义" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: "8px" }}>
                      {(sec.body ?? []).map((b, bi) => (
                        <textarea key={bi} value={b} onChange={(e) => { const n = [...aboutSections]; const bn = [...(n[si].body ?? [])]; bn[bi] = e.target.value; n[si] = { ...n[si], body: bn }; setAboutSections(n); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginBottom: "6px" }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={async () => { setSaving("about"); await fetch("/api/pages/about", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "关于", content: JSON.stringify({ sections: aboutSections }) }) }); setSaving(null); }} disabled={saving === "about"} className="rounded-full px-6" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>{saving === "about" ? <Loader2 className="animate-spin mr-1" size={14} /> : <Save size={14} className="mr-1" />}保存</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================
 * Tab 2: Topic Management
 * ============================================ */
function TopicsTab() {
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
    setEditTarget(null);
    setName("");
    setDescription("");
    setSection("explore");
    setDialogOpen(true);
  };

  const openEdit = (t: typeof topics[0]) => {
    setEditTarget(t);
    setName(t.name);
    setDescription(t.description ?? "");
    setSection(t.section);
    setDialogOpen(true);
  };

  const handleSaveTopic = async () => {
    if (!name.trim()) return;

    if (editTarget) {
      await fetch(`/api/topics/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, section }),
      });
    } else {
      await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, section }),
      });
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
              <h3 className="text-sm font-medium mb-2" style={{ color: "#9C9590" }}>
                {SECTION_LABELS[sec]}
              </h3>
              <div className="space-y-2">
                {sectionTopics.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderColor: "#E8E3DC" }}
                  >
                    <div>
                      <span className="font-medium text-sm" style={{ color: "#2D2A26" }}>{t.name}</span>
                      {t.description && <p className="text-xs mt-0.5" style={{ color: "#9C9590" }}>{t.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-[#F5F1EB]" style={{ color: "#9C9590" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(t)} className="p-1 rounded hover:bg-[#F5F1EB]" style={{ color: "#9C9590" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {topics.length === 0 && (
          <p className="text-center py-8" style={{ color: "#9C9590" }}>暂无主题</p>
        )}
      </div>

      {/* Topic dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "编辑主题" : "新建主题"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="主题名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ borderColor: "#9C9590" }}
            />
            <Input
              placeholder="描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ borderColor: "#9C9590" }}
            />
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              style={{ borderColor: "#9C9590", color: "#2D2A26" }}
            >
              {SECTION_ORDER.map((s) => (
                <option key={s} value={s}>{SECTION_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">取消</Button>
            <Button onClick={handleSaveTopic} className="rounded-full" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm" style={{ color: "#9C9590" }}>确定要删除「{deleteTarget?.name}」吗？该主题下的文章将变为无主题。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-full">取消</Button>
            <Button onClick={handleDelete} className="rounded-full" style={{ backgroundColor: "#B85450", color: "#F5F1EB" }}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================
 * Tab 3: User Management
 * ============================================ */
function UsersTab() {
  const [users, setUsers] = useState<Array<{ id: string; nickname: string; email: string; role: string; isHighValue: boolean; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleHighValue = async (user: typeof users[0]) => {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHighValue: !user.isHighValue }),
    });
    fetchUsers();
  };

  if (loading) return <div className="text-center py-12" style={{ color: "#9C9590" }}>加载中…</div>;

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#E8E3DC" }}>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "#E8E3DC" }}>
            <TableHead style={{ color: "#2D2A26" }}>昵称</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>邮箱</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>角色</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>注册时间</TableHead>
            <TableHead style={{ color: "#2D2A26" }}>高价值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} style={{ borderColor: "#E8E3DC" }}>
              <TableCell style={{ color: "#2D2A26" }}>{u.nickname}</TableCell>
              <TableCell className="text-sm" style={{ color: "#9C9590" }}>{u.email}</TableCell>
              <TableCell>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: u.role === "admin" ? "#A67C5220" : "#9C959020", color: u.role === "admin" ? "#A67C52" : "#9C9590" }}>
                  {u.role === "admin" ? "管理员" : "用户"}
                </span>
              </TableCell>
              <TableCell className="text-xs" style={{ color: "#9C9590" }}>
                {new Date(u.createdAt).toLocaleDateString("zh-CN")}
              </TableCell>
              <TableCell>
                <button onClick={() => toggleHighValue(u)} style={{ color: u.isHighValue ? "#A67C52" : "#9C9590" }}>
                  <Star size={16} fill={u.isHighValue ? "#A67C52" : "none"} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {users.length === 0 && (
        <p className="text-center py-8" style={{ color: "#9C9590" }}>暂无用户</p>
      )}
    </div>
  );
}

/* ============================================
 * Settings Page
 * ============================================ */
export default function AdminSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1
        className="text-2xl font-semibold mb-8"
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
