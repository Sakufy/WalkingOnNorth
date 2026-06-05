import { getTopicsBySection } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";

type DbSection = "explore" | "improve" | "realize";
const SLUG_TO_DB: Record<string, DbSection> = { thinking: "explore", reading: "improve", journey: "realize" };
const SECTION_NAMES: Record<string, string> = { explore: "自我探索", improve: "自我提升", realize: "自我实现" };

export default async function TopicsPage({ params }: { params: Promise<{ sectionSlug: string }> }) {
  const { sectionSlug } = await params;
  const dbSection = SLUG_TO_DB[sectionSlug];
  if (!dbSection) notFound();

  const topics = await getTopicsBySection(dbSection);
  const sectionLabel = SECTION_NAMES[dbSection];

  return (
    <main id="main-content" className="pb-20 sm:pb-0" style={{ background: "var(--bx-neutral)" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "clamp(48px, 10vh, 120px) clamp(16px, 5vw, 40px) 80px" }}>
        <BackButton fallbackHref={`/articles/${sectionSlug}`} style={{ marginBottom: "clamp(24px, 4vh, 40px)" }}>
          ← {sectionLabel}
        </BackButton>

        <h1 style={{
          fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)", lineHeight: 1.3,
          color: "var(--bx-primary)", marginBottom: "clamp(32px, 5vh, 56px)",
        }}>专栏</h1>

        {topics.length === 0 ? (
          <p style={{ color: "var(--bx-secondary)" }}>暂无专栏。</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2vh, 24px)" }}>
            {topics.map((t) => (
              <Link key={t.id} href={`/articles/${sectionSlug}/topic/${t.id}`}
                style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  padding: "20px 0", borderBottom: "1px solid rgba(156,149,144,0.12)",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  gap: "clamp(12px, 3vw, 24px)",
                }}>
                  <div style={{ flex: "0 0 auto", minWidth: "80px" }}>
                    <h3 style={{
                      fontFamily: '"Noto Serif SC","Source Serif 4",Georgia,serif', fontWeight: 600,
                      fontSize: "clamp(1.0625rem, 2.5vw, 1.25rem)", lineHeight: 1.4,
                      color: "var(--bx-primary)", marginBottom: "4px",
                    }}>{t.name}</h3>
                    <span style={{ fontSize: "0.8125rem", color: "var(--bx-secondary)", fontFamily: '"Noto Sans SC",Inter,sans-serif' }}>
                      {t.postCount} 篇
                    </span>
                  </div>
                  {t.description && (
                    <p style={{
                      fontSize: "clamp(0.8125rem, 1.5vw, 0.875rem)", lineHeight: 1.6,
                      color: "var(--bx-primary)", opacity: 0.68, flex: 1, textAlign: "right",
                    }}>{t.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
