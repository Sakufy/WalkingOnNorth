"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

type SectionKey = "thinking" | "reading" | "journey";

const DEFAULT_HOME_DATA = {
  slogan: "向内探寻，向北而行",
  philosophy: [
    "北行之路从不是被划定的人生轨道，而是一片任由自我开拓的旷野。",
    "我们拒绝世俗单一的成功规训...",
    "在这里，所有文字都是成长的沉淀...",
  ],
  audience: [
    { title: "不甘规训者", trait: "独立意志", text: "..." },
    { title: "向内求索者", trait: "深度自省", text: "..." },
    { title: "务实破局者", trait: "摒弃内耗", text: "..." },
    { title: "长期践行者", trait: "追求自洽", text: "..." },
  ],
  sections: {} as Record<string, { subtitle: string; intro: string; action: string }>,
};

const SECTION_NAMES: Record<SectionKey, string> = { thinking: "自我探索", reading: "自我提升", journey: "自我实现" };

const sectionLabel: React.CSSProperties = { fontSize: "0.8125rem", color: "#A67C52", fontFamily: '"Noto Sans SC",Inter,sans-serif', marginBottom: "4px" };

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid rgba(156,149,144,0.3)", borderRadius: "6px", fontSize: "0.9375rem", background: "#FAF8F4", outline: "none", fontFamily: '"Noto Sans SC",Inter,sans-serif' };

type HomeData = typeof DEFAULT_HOME_DATA;
type AboutSection = { heading: string; body?: string[]; concepts?: { name: string; text: string }[] };

export default function PageContentTab() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["sections"]));
  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const [homeData, setHomeData] = useState<HomeData>(DEFAULT_HOME_DATA);
  const [articlesData, setArticlesData] = useState({ headline: "长路纪行", intro: [""] });
  const [sectionsData, setSectionsData] = useState<Record<SectionKey, { headline: string; intro: string[] }>>({
    thinking: { headline: "自我探索", intro: [""] }, reading: { headline: "自我提升", intro: [""] }, journey: { headline: "自我实现", intro: [""] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [homeRes, articlesRes, aboutRes] = await Promise.all([fetch("/api/pages/home"), fetch("/api/pages/articles"), fetch("/api/pages/about")]);
        if (homeRes.ok) { const j = await homeRes.json(); if (j.content) { const p = JSON.parse(j.content); setHomeData({ ...DEFAULT_HOME_DATA, ...p, audience: p.audience || DEFAULT_HOME_DATA.audience, philosophy: p.philosophy || DEFAULT_HOME_DATA.philosophy, sections: { ...DEFAULT_HOME_DATA.sections, ...(p.sections || {}) } }); } }
        if (articlesRes.ok) { const j = await articlesRes.json(); if (j.content) { const p = JSON.parse(j.content); setArticlesData({ headline: p.headline || "长路纪行", intro: p.intro || [""] }); } }
        if (aboutRes.ok) { const j = await aboutRes.json(); if (j.content) { try { const p = JSON.parse(j.content); if (p.sections) setAboutSections(p.sections); } catch { /* */ } } }
      } catch { /* defaults */ }
      const keys: SectionKey[] = ["thinking", "reading", "journey"];
      const secData: Record<SectionKey, { headline: string; intro: string[] }> = { thinking: { headline: "自我探索", intro: [""] }, reading: { headline: "自我提升", intro: [""] }, journey: { headline: "自我实现", intro: [""] } };
      for (const key of keys) {
        try { const res = await fetch(`/api/pages/section-${key}`); if (res.ok) { const j = await res.json(); if (j.content) { const p = JSON.parse(j.content); secData[key] = { headline: p.headline || SECTION_NAMES[key], intro: p.intro || [""] }; } } } catch { /* */ }
      }
      setSectionsData(secData);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (slug: string, _title: string, data: unknown) => {
    setSaving(slug);
    await fetch(`/api/pages/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: slug, content: JSON.stringify(data) }) });
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

  return (
    <div className="space-y-3">
      <div style={{ border: "1px solid rgba(156,149,144,0.2)", borderRadius: "8px", overflow: "hidden" }}>
        {cardHead("首页（Slogan + 5 模块）", "home")}
        {expanded.has("home") && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div><div style={sectionLabel}>Slogan</div><input type="text" value={homeData.slogan} onChange={(e) => updateField("slogan", e.target.value)} style={{ ...inputStyle, fontSize: "1.125rem", fontWeight: 600 }} placeholder="向内探寻，向北而行" /></div>
              <div><div style={sectionLabel}>理念阐释（3 段）</div>{homeData.philosophy.map((t, i) => <textarea key={i} value={t} onChange={(e) => { const n = [...homeData.philosophy]; n[i] = e.target.value; updateField("philosophy", n); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginTop: i > 0 ? "12px" : "4px" }} />)}</div>
              <div className="flex justify-end mt-4"><Button onClick={() => handleSave("home", "首页", homeData)} disabled={saving === "home"} className="rounded-full px-6" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>{saving === "home" ? <Loader2 className="animate-spin mr-1" size={14} /> : <Save size={14} className="mr-1" />}保存</Button></div>
            </div>
          </div>
        )}
      </div>
      <div style={{ border: "1px solid rgba(156,149,144,0.2)", borderRadius: "8px", overflow: "hidden" }}>
        {cardHead("长路纪行（标题 + 介绍）", "articles")}
        {expanded.has("articles") && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div><div style={sectionLabel}>标题</div><input type="text" value={articlesData.headline} onChange={(e) => setArticlesData((d) => ({ ...d, headline: e.target.value }))} style={{ ...inputStyle, fontSize: "1.125rem", fontWeight: 600 }} /></div>
              <div><div style={sectionLabel}>介绍段落</div>{articlesData.intro.map((t, i) => <textarea key={i} value={t} onChange={(e) => { const n = [...articlesData.intro]; n[i] = e.target.value; setArticlesData((d) => ({ ...d, intro: n })); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginTop: i > 0 ? "12px" : "4px" }} />)}</div>
            </div>
            <div className="flex justify-end mt-4"><Button onClick={() => handleSave("articles", "长路纪行", articlesData)} disabled={saving === "articles"} className="rounded-full px-6" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>{saving === "articles" ? <Loader2 className="animate-spin mr-1" size={14} /> : <Save size={14} className="mr-1" />}保存</Button></div>
          </div>
        )}
      </div>
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
      <div style={{ border: "1px solid rgba(156,149,144,0.2)", borderRadius: "8px", overflow: "hidden" }}>
        {cardHead("关于页", "about")}
        {expanded.has("about") && (
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(156,149,144,0.1)" }}>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {aboutSections.map((sec, si) => (
                <div key={si} style={{ padding: "12px", border: "1px solid rgba(156,149,144,0.15)", borderRadius: "6px" }}>
                  <div style={{ ...sectionLabel, color: "var(--bx-tertiary)", marginBottom: "8px" }}>第 {si + 1} 段 · {sec.heading}</div>
                  <input type="text" value={sec.heading} onChange={(e) => { const n = [...aboutSections]; n[si] = { ...n[si], heading: e.target.value }; setAboutSections(n); }} style={{ ...inputStyle, fontWeight: 600 }} placeholder="段标题" />
                  {sec.concepts ? (
                    (sec.concepts ?? []).map((c, ci) => (
                      <div key={ci} style={{ padding: "8px", borderBottom: ci < (sec.concepts?.length ?? 1) - 1 ? "1px solid rgba(156,149,144,0.1)" : "none" }}>
                        <input type="text" value={c.name} onChange={(e) => { const n = [...aboutSections]; const cn = [...(n[si].concepts ?? [])]; cn[ci] = { ...cn[ci], name: e.target.value }; n[si] = { ...n[si], concepts: cn }; setAboutSections(n); }} style={{ ...inputStyle, fontSize: "0.9375rem", marginBottom: "4px" }} placeholder="概念名" />
                        <textarea value={c.text} onChange={(e) => { const n = [...aboutSections]; const cn = [...(n[si].concepts ?? [])]; cn[ci] = { ...cn[ci], text: e.target.value }; n[si] = { ...n[si], concepts: cn }; setAboutSections(n); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontSize: "0.8125rem" }} placeholder="释义" />
                      </div>
                    ))
                  ) : (
                    (sec.body ?? []).map((b, bi) => <textarea key={bi} value={b} onChange={(e) => { const n = [...aboutSections]; const bn = [...(n[si].body ?? [])]; bn[bi] = e.target.value; n[si] = { ...n[si], body: bn }; setAboutSections(n); }} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginBottom: "6px" }} />)
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
