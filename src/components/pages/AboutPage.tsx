"use client";

import { useRouter } from "next/navigation";

/* ============================================
 * Types
 * ============================================ */

type ConceptDef = { name: string; text: string };
type AboutSection = { heading: string; body?: string[]; concepts?: ConceptDef[] };

export type AboutPageData = {
  sections?: AboutSection[];
};

/* ============================================
 * Defaults
 * ============================================ */

const DEFAULTS: AboutPageData = {
  sections: [
    {
      heading: "我的故事",
      body: [
        "我是一个持续写作的人。不是因为擅长，而是因为在写作的过程中，我在弄清楚我的想法。",
        "多年来我一直在自我探索、学习方法、价值输出这三个方向上实践和记录。北行之路是这个过程的公开版本——不是展示完美，而是展示迭代。",
      ],
    },
    {
      heading: "关键概念",
      concepts: [
        { name: "北行独元", text: "以原创研究为根基的个人成长方法论体系，强调向内探索 → 向外落地的完整闭环。不是学别人的体系，而是构建自己的。" },
        { name: "成长飞轮", text: "学习 → 输出 → 反馈 → 迭代的正循环机制。写作不只是为了表达已知，更是在写作过程中完成深度思考。" },
        { name: "版本写作", text: "每篇文章保留完整的历史版本。每一次修改都是思想成熟的可见痕迹。读者看到的不是结论，而是思想的演进过程。" },
        { name: "双向成长", text: "创作者在输出中成长，读者在阅读与反馈中成长。不是单向灌输，而是共同迭代的生态。" },
      ],
    },
    {
      heading: "目的与使命",
      body: [
        "北行之路的使命是为追求精神自立的独立个体提供一个安静、有深度的阅读与思考空间。",
        "拒绝流量思维和焦虑营销。这里的每一篇文章只为一个目的存在：把真正值得写下来的东西写下来。如果你在这里找到共鸣，那不是因为算法推荐，而是因为我们在思考同样的问题。",
      ],
    },
    {
      heading: "联系方式",
      body: [
        "如果你想说什么，可以在任意文章的段落里留下批注，或者通过邮件联系。",
        "邮箱：待填写",
        "B站 / 公众号：待填写",
        "我读每一封邮件，但回复可能很慢。",
      ],
    },
  ],
};

/* ============================================
 * Main
 * ============================================ */

export function AboutPage({ pageData }: { pageData?: AboutPageData }) {
  const router = useRouter();
  const pd = pageData ?? {};
  const sections = pd.sections?.length ? pd.sections : DEFAULTS.sections!;

  return (
    <main id="main-content" className="pb-20 sm:pb-0" style={{ background: "var(--bx-neutral)" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 clamp(16px, 5vw, 40px) 80px" }}>
        {/* Back */}
        <button onClick={() => router.back()} style={{
          fontSize: "0.875rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif',
          background: "none", border: "none", cursor: "pointer", padding: 0,
          minHeight: "44px", minWidth: "44px",
          marginTop: "clamp(24px, 5vh, 48px)", marginBottom: "clamp(24px, 4vh, 40px)",
        }}>← 返回</button>

        <h1 style={{
          fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)", lineHeight: 1.3,
          color: "var(--bx-primary)", marginBottom: "clamp(32px, 5vh, 56px)",
        }}>关于</h1>

        {/* ==========================================
         * SECTION 1 — 我的故事
         * ========================================== */}
        {sections[0] && (
          <section style={{ marginBottom: "clamp(56px, 10vh, 96px)" }}>
            <h2 style={{
              fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
              fontSize: "clamp(1.25rem, 3vw, 1.5rem)", lineHeight: 1.4,
              color: "var(--bx-primary)", opacity: 0.85, marginBottom: "16px", letterSpacing: "0.01em",
            }}>{sections[0].heading}</h2>
            <div style={{ width: "32px", height: "2px", backgroundColor: "rgba(166,124,82,0.2)", marginBottom: "clamp(14px, 2.5vh, 24px)" }} />
            {(sections[0].body ?? []).map((p, i) => (
              <p key={i} style={{
                fontFamily: '"LXGW WenKai","Noto Serif SC","Source Serif 4",Georgia,serif',
                fontSize: "clamp(1rem, 2.5vw, 1.125rem)", lineHeight: 1.9,
                color: "var(--bx-primary)", opacity: 0.78,
                marginBottom: i < (sections[0].body?.length ?? 1) - 1 ? "clamp(16px, 2.5vh, 24px)" : 0,
              }}>{p}</p>
            ))}
          </section>
        )}

        {/* ==========================================
         * Remaining sections — auto-detect concepts vs body
         * Each section can be either body-paragraphs or
         * concept-cards, determined by which field has data.
         * ========================================== */}
        {sections.slice(1).map((sec, idx) => {
          if (!sec) return null;
          const isConcept = (sec.concepts?.length ?? 0) > 0;

          return (
            <section
              key={idx}
              style={{
                marginBottom: idx === sections.length - 2
                  ? "clamp(24px, 3vh, 40px)"
                  : "clamp(48px, 8vh, 80px)",
                paddingBottom: idx === sections.length - 2 ? "clamp(24px, 3vh, 40px)" : 0,
              }}
            >
              <h2 style={{
                fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
                fontSize: "clamp(1.25rem, 3vw, 1.5rem)", lineHeight: 1.4,
                color: "var(--bx-primary)", opacity: 0.85, marginBottom: "16px", letterSpacing: "0.01em",
              }}>{sec.heading}</h2>
              <div style={{ width: "32px", height: "2px", backgroundColor: "rgba(166,124,82,0.2)", marginBottom: "clamp(14px, 2.5vh, 24px)" }} />

              {isConcept ? (
                /* Concept cards layout */
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px, 2vh, 24px)" }}>
                  {(sec.concepts ?? []).map((c, ci) => (
                    <div key={ci} style={{
                      display: "flex", gap: "clamp(8px, 1.5vw, 16px)", alignItems: "baseline",
                      borderLeft: "3px solid rgba(166,124,82,0.18)", paddingLeft: "clamp(10px, 2vw, 16px)",
                      paddingTop: "2px", paddingBottom: "2px",
                    }}>
                      <span style={{
                        fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
                        fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)", lineHeight: 1.5,
                        color: "var(--bx-primary)", flex: "0 0 auto", minWidth: "clamp(64px, 18vw, 88px)",
                      }}>{c.name}</span>
                      <span style={{
                        fontSize: "clamp(0.8125rem, 1.8vw, 0.875rem)", lineHeight: 1.7,
                        color: "var(--bx-primary)", opacity: 0.6, flex: 1,
                        fontFamily: '"Noto Sans SC",Inter,sans-serif',
                      }}>{c.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Body paragraphs layout */
                (sec.body ?? []).map((p, pi) => (
                  <p key={pi} style={{
                    fontFamily: '"LXGW WenKai","Noto Serif SC","Source Serif 4",Georgia,serif',
                    fontSize: "clamp(1rem, 2.5vw, 1.125rem)", lineHeight: 1.9,
                    color: "var(--bx-primary)", opacity: 0.78,
                    marginBottom: pi < (sec.body?.length ?? 1) - 1 ? "clamp(16px, 2.5vh, 24px)" : 0,
                  }}>{p}</p>
                ))
              )}
            </section>
          );
        })}

        {!sections.length && (
          <p style={{ color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>暂无内容。</p>
        )}
      </div>
    </main>
  );
}
