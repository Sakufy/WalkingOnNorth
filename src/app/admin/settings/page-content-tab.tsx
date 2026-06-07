"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, ChevronRight } from "lucide-react";

type SectionKey = "thinking" | "reading" | "journey";

const DEFAULT_HOME_DATA = {
  slogan: "向内探寻，向北而行",
  philosophy: [
    "北行之路从不是被划定的人生轨道，而是一片任由自我开拓的旷野。",
    "我们拒绝世俗单一的成功规训，坚持每个人都有自己的成长节奏。",
    "文字是思考的沉淀，分享是成长的实践。所有内容都是创作者真实的行走记录。",
  ],
  audience: [
    { title: "不甘规训者", trait: "独立意志", text: "拒绝被社会时钟和他人期待定义。" },
    { title: "向内求索者", trait: "深度自省", text: "不满足于表象答案，习惯追问「为什么」。" },
    { title: "务实破局者", trait: "摒弃内耗", text: "相信行动的力量，把思考转化为实践。" },
    { title: "长期践行者", trait: "追求自洽", text: "在持续积累中寻找内心的平衡与完整。" },
  ],
  sections: {} as Record<string, { subtitle: string; intro: string; action: string }>,
};

const SECTION_NAMES: Record<SectionKey, string> = { thinking: "自我探索", reading: "自我提升", journey: "自我实现" };

const pageLabel: React.CSSProperties = { fontSize: "0.8125rem", color: "#A67C52", fontFamily: '"Noto Sans SC",Inter,sans-serif', marginBottom: "4px" };

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 0", border: "none", borderBottom: "1px solid #9C9590", borderRadius: "0", fontSize: "1rem", background: "transparent", outline: "none", color: "#2D2A26", fontFamily: '"Noto Sans SC",Inter,sans-serif' };

type HomeData = typeof DEFAULT_HOME_DATA;
type AboutSection = { heading: string; body?: string[]; concepts?: { name: string; text: string }[] };

const PAGES = [
  { key: "home", label: "首页", sub: "Slogan · 理念 · 人群 · 板块卡片" },
  { key: "articles", label: "长路纪行", sub: "标题 · 介绍" },
  { key: "sections", label: "板块介绍", sub: "3 板块" },
  { key: "about", label: "关于页", sub: "创作者 · 理念 · 联系" },
] as const;

type PageKey = (typeof PAGES)[number]["key"];

/* ============================================
 * Sidebar
 * ============================================ */
function Sidebar({ selected, onSelect }: { selected: PageKey; onSelect: (k: PageKey) => void }) {
  return (
    <nav className="w-full sm:w-56 shrink-0 space-y-1">
      {PAGES.map((p) => (
        <button
          key={p.key}
          onClick={() => onSelect(p.key)}
          className="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between gap-3 text-base transition-colors"
          style={{
            backgroundColor: selected === p.key ? "#F5F1EB" : "transparent",
            color: selected === p.key ? "#2D2A26" : "#9C9590",
            fontWeight: selected === p.key ? 500 : 400,
          }}
        >
          <div>
            <div>{p.label}</div>
            <div className="text-sm mt-1" style={{ opacity: 0.6 }}>{p.sub}</div>
          </div>
          {selected === p.key && <ChevronRight size={16} style={{ color: "#A67C52" }} />}
        </button>
      ))}
    </nav>
  );
}

/* ============================================
 * Mobile tab bar
 * ============================================ */
function MobileTabs({ selected, onSelect }: { selected: PageKey; onSelect: (k: PageKey) => void }) {
  return (
    <div className="sm:hidden flex gap-1 overflow-x-auto pb-2 border-b" style={{ borderColor: "#E8E3DC" }}>
      {PAGES.map((p) => (
        <button
          key={p.key}
          onClick={() => onSelect(p.key)}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors"
          style={{
            backgroundColor: selected === p.key ? "#2D2A26" : "transparent",
            color: selected === p.key ? "#F5F1EB" : "#9C9590",
            border: selected === p.key ? "none" : "1px solid #E8E3DC",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================
 * Home page editor
 * ============================================ */
function HomeEditor({
  data, updateField, saving, onSave,
}: {
  data: HomeData;
  updateField: <T extends keyof HomeData>(key: T, value: HomeData[T]) => void;
  saving: string | null;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div style={{ ...pageLabel, fontSize: "0.9375rem" }}>Slogan</div>
        <input type="text" value={data.slogan} onChange={(e) => updateField("slogan", e.target.value)}
          style={{ ...inputStyle, fontSize: "1.25rem", fontWeight: 600 }} />
      </div>
      <div>
        <div style={{ ...pageLabel, fontSize: "0.9375rem" }}>理念阐释</div>
        {data.philosophy.map((t, i) => (
          <textarea key={i} value={t} onChange={(e) => { const n = [...data.philosophy]; n[i] = e.target.value; updateField("philosophy", n); }}
            rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginTop: i > 0 ? "14px" : "6px" }} />
        ))}
      </div>
      <div>
        <div style={{ ...pageLabel, fontSize: "0.9375rem" }}>适合人群</div>
        {data.audience.map((a, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < data.audience.length - 1 ? "1px solid rgba(156,149,144,0.1)" : "none" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <input type="text" value={a.title} onChange={(e) => { const n = [...data.audience]; n[i] = { ...n[i], title: e.target.value }; updateField("audience", n); }}
                style={{ ...inputStyle, flex: 1, fontWeight: 600 }} />
              <input type="text" value={a.trait} onChange={(e) => { const n = [...data.audience]; n[i] = { ...n[i], trait: e.target.value }; updateField("audience", n); }}
                style={{ ...inputStyle, flex: 1, fontSize: "0.9375rem" }} />
            </div>
            <textarea value={a.text} onChange={(e) => { const n = [...data.audience]; n[i] = { ...n[i], text: e.target.value }; updateField("audience", n); }}
              rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, marginTop: "8px", fontSize: "0.9375rem" }} />
          </div>
        ))}
      </div>
      <div>
        <div style={{ ...pageLabel, fontSize: "0.9375rem" }}>三大成长板块卡片</div>
        <p style={{ fontSize: "0.8125rem", color: "#9C9590", marginBottom: "12px" }}>每张卡片的副标题、介绍文案和行动按钮文字</p>
        {(["thinking", "reading", "journey"] as const).map((key) => {
          const s = data.sections[key] ?? { subtitle: "", intro: "", action: "" };
          const setS = (val: { subtitle?: string; intro?: string; action?: string }) => {
            updateField("sections", { ...data.sections, [key]: { ...s, ...val } });
          };
          return (
            <div key={key} style={{ padding: "12px 0", borderBottom: key !== "journey" ? "1px solid rgba(156,149,144,0.1)" : "none" }}>
              <div style={{ fontSize: "0.875rem", color: "#A67C52", fontWeight: 500, marginBottom: "8px" }}>{SECTION_NAMES[key]}</div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "6px" }}>
                <input type="text" value={s.subtitle} onChange={(e) => setS({ subtitle: e.target.value })}
                  style={{ ...inputStyle, flex: 1 }} placeholder="副标题" />
                <input type="text" value={s.action} onChange={(e) => setS({ action: e.target.value })}
                  style={{ ...inputStyle, flex: 1 }} placeholder="按钮文字 (如: 进入探索)" />
              </div>
              <textarea value={s.intro} onChange={(e) => setS({ intro: e.target.value })}
                rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} placeholder="卡片介绍文案" />
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving === "home"} className="rounded-full px-8 py-2.5 text-base" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>
          {saving === "home" ? <Loader2 className="animate-spin mr-1" size={16} /> : <Save size={16} className="mr-1" />}保存
        </Button>
      </div>
    </div>
  );
}

/* ============================================
 * Articles page editor
 * ============================================ */
function ArticlesEditor({
  data, setData, saving, onSave,
}: {
  data: { headline: string; intro: string[] };
  setData: React.Dispatch<React.SetStateAction<{ headline: string; intro: string[] }>>;
  saving: string | null;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div style={{ ...pageLabel, fontSize: "0.9375rem" }}>标题</div>
        <input type="text" value={data.headline}
          onChange={(e) => setData((d) => ({ ...d, headline: e.target.value }))}
          style={{ ...inputStyle, fontSize: "1.25rem", fontWeight: 600 }} />
      </div>
      <div>
        <div style={{ ...pageLabel, fontSize: "0.9375rem" }}>介绍段落</div>
        {data.intro.map((t, i) => (
          <textarea key={i} value={t}
            onChange={(e) => { const n = [...data.intro]; n[i] = e.target.value; setData((d) => ({ ...d, intro: n })); }}
            rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginBottom: "8px" }} />
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving === "articles"} className="rounded-full px-8 py-2.5 text-base" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>
          {saving === "articles" ? <Loader2 className="animate-spin mr-1" size={16} /> : <Save size={16} className="mr-1" />}保存
        </Button>
      </div>
    </div>
  );
}

/* ============================================
 * Sections editor
 * ============================================ */
function SectionsEditor({
  data, setData, saving, onSave,
}: {
  data: Record<SectionKey, { headline: string; intro: string[] }>;
  setData: React.Dispatch<React.SetStateAction<Record<SectionKey, { headline: string; intro: string[] }>>>;
  saving: string | null;
  onSave: (key: SectionKey) => void;
}) {
  const keys = Object.keys(SECTION_NAMES) as SectionKey[];
  return (
    <div className="space-y-6">
      {keys.map((key) => (
        <div key={key} style={{ padding: "24px", border: "1px solid rgba(156,149,144,0.15)", borderRadius: "8px" }}>
          <div style={{ ...pageLabel, fontSize: "0.9375rem", color: "var(--bx-tertiary)", marginBottom: "12px" }}>{SECTION_NAMES[key]}</div>
          <input type="text" value={data[key].headline}
            onChange={(e) => setData((d) => ({ ...d, [key]: { ...d[key], headline: e.target.value } }))}
            style={{ ...inputStyle, fontWeight: 600, fontSize: "1.0625rem" }} />
          {data[key].intro.map((t, i) => (
            <textarea key={i} value={t}
              onChange={(e) => { const n = [...data[key].intro]; n[i] = e.target.value; setData((d) => ({ ...d, [key]: { ...d[key], intro: n } })); }}
              rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginTop: "8px", fontSize: "0.9375rem" }} />
          ))}
          <div className="flex justify-end mt-4">
            <Button onClick={() => onSave(key)} disabled={saving === `section-${key}`} className="rounded-full px-6 py-2" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>
              {saving === `section-${key}` ? "保存中…" : "保存"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
 * About page editor
 * ============================================ */
function AboutEditor({
  sections, setSections, saving, onSave,
}: {
  sections: AboutSection[];
  setSections: React.Dispatch<React.SetStateAction<AboutSection[]>>;
  saving: string | null;
  onSave: () => void;
}) {
  return (
    <div className="space-y-6">
      {sections.map((sec, si) => (
        <div key={si} style={{ padding: "20px", border: "1px solid rgba(156,149,144,0.12)", borderRadius: "8px" }}>
          <div style={{ ...pageLabel, fontSize: "0.9375rem", color: "var(--bx-tertiary)", marginBottom: "8px" }}>第 {si + 1} 段 · {sec.heading}</div>
          <input type="text" value={sec.heading}
            onChange={(e) => { const n = [...sections]; n[si] = { ...n[si], heading: e.target.value }; setSections(n); }}
            style={{ ...inputStyle, fontWeight: 600, fontSize: "1.0625rem" }} />
          {sec.concepts ? (
            (sec.concepts ?? []).map((c, ci) => (
              <div key={ci} style={{ padding: "8px 0", borderBottom: ci < (sec.concepts?.length ?? 1) - 1 ? "1px solid rgba(156,149,144,0.05)" : "none" }}>
                <input type="text" value={c.name}
                  onChange={(e) => { const n = [...sections]; const cn = [...(n[si].concepts ?? [])]; cn[ci] = { ...cn[ci], name: e.target.value }; n[si] = { ...n[si], concepts: cn }; setSections(n); }}
                  style={{ ...inputStyle, fontSize: "1rem", marginBottom: "6px" }} />
                <textarea value={c.text}
                  onChange={(e) => { const n = [...sections]; const cn = [...(n[si].concepts ?? [])]; cn[ci] = { ...cn[ci], text: e.target.value }; n[si] = { ...n[si], concepts: cn }; setSections(n); }}
                  rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontSize: "0.9375rem" }} />
              </div>
            ))
          ) : (
            (sec.body ?? []).map((b, bi) => (
              <textarea key={bi} value={b}
                onChange={(e) => { const n = [...sections]; const bn = [...(n[si].body ?? [])]; bn[bi] = e.target.value; n[si] = { ...n[si], body: bn }; setSections(n); }}
                rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, marginBottom: "8px" }} />
            ))
          )}
        </div>
      ))}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving === "about"} className="rounded-full px-8 py-2.5 text-base" style={{ backgroundColor: "#2D2A26", color: "#F5F1EB" }}>
          {saving === "about" ? <Loader2 className="animate-spin mr-1" size={16} /> : <Save size={16} className="mr-1" />}保存
        </Button>
      </div>
    </div>
  );
}

/* ============================================
 * Main component
 * ============================================ */
export default function PageContentTab() {
  const [selected, setSelected] = useState<PageKey>("home");

  const [homeData, setHomeData] = useState<HomeData>(DEFAULT_HOME_DATA);
  const [articlesData, setArticlesData] = useState({ headline: "长路纪行", intro: [""] });
  const [sectionsData, setSectionsData] = useState<Record<SectionKey, { headline: string; intro: string[] }>>({
    thinking: { headline: "自我探索", intro: [""] },
    reading: { headline: "自我提升", intro: [""] },
    journey: { headline: "自我实现", intro: [""] },
  });
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [homeRes, articlesRes, aboutRes] = await Promise.all([
          fetch("/api/pages/home"), fetch("/api/pages/articles"), fetch("/api/pages/about"),
        ]);
        if (homeRes.ok) { const j = await homeRes.json(); if (j.content) { const p = JSON.parse(j.content); setHomeData({ ...DEFAULT_HOME_DATA, ...p, audience: p.audience || DEFAULT_HOME_DATA.audience, philosophy: p.philosophy || DEFAULT_HOME_DATA.philosophy, sections: { ...DEFAULT_HOME_DATA.sections, ...(p.sections || {}) } }); } }
        if (articlesRes.ok) { const j = await articlesRes.json(); if (j.content) { const p = JSON.parse(j.content); setArticlesData({ headline: p.headline || "长路纪行", intro: p.intro || [""] }); } }
        if (aboutRes.ok) { const j = await aboutRes.json(); if (j.content) { try { const p = JSON.parse(j.content); if (p.sections) setAboutSections(p.sections); } catch { /* */ } } }
      } catch { /* defaults */ }
      const keys: SectionKey[] = ["thinking", "reading", "journey"];
      const secData: Record<SectionKey, { headline: string; intro: string[] }> = {
        thinking: { headline: "自我探索", intro: [""] },
        reading: { headline: "自我提升", intro: [""] },
        journey: { headline: "自我实现", intro: [""] },
      };
      for (const key of keys) {
        try { const res = await fetch(`/api/pages/section-${key}`); if (res.ok) { const j = await res.json(); if (j.content) { const p = JSON.parse(j.content); secData[key] = { headline: p.headline || SECTION_NAMES[key], intro: p.intro || [""] }; } } } catch { /* */ }
      }
      setSectionsData(secData);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (slug: string, data: unknown) => {
    setSaving(slug);
    await fetch(`/api/pages/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: slug, content: JSON.stringify(data) }),
    });
    setSaving(null);
  };

  const updateField = <T extends keyof HomeData>(key: T, value: HomeData[T]) =>
    setHomeData((prev) => ({ ...prev, [key]: value }));

  if (loading) return <div className="text-center py-12" style={{ color: "#9C9590" }}>加载中…</div>;

  const renderContent = () => {
    switch (selected) {
      case "home":
        return <HomeEditor data={homeData} updateField={updateField} saving={saving} onSave={() => handleSave("home", homeData)} />;
      case "articles":
        return <ArticlesEditor data={articlesData} setData={setArticlesData} saving={saving} onSave={() => handleSave("articles", articlesData)} />;
      case "sections":
        return <SectionsEditor data={sectionsData} setData={setSectionsData} saving={saving} onSave={(key) => handleSave(`section-${key}`, sectionsData[key])} />;
      case "about":
        return <AboutEditor sections={aboutSections} setSections={setAboutSections} saving={saving} onSave={async () => { setSaving("about"); await fetch("/api/pages/about", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "关于", content: JSON.stringify({ sections: aboutSections }) }) }); setSaving(null); }} />;
    }
  };

  return (
    <div>
      {/* Mobile tab bar (visible below sm) */}
      <MobileTabs selected={selected} onSelect={setSelected} />

      {/* Content area */}
      <div className="flex gap-8 mt-4 sm:mt-0">
        {/* Desktop sidebar (hidden on mobile) */}
        <div className="hidden sm:block">
          <Sidebar selected={selected} onSelect={setSelected} />
        </div>

        {/* Main content — wide and spacious */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
