import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const SECTION_LABELS: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const summary = searchParams.get("summary");
    const section = searchParams.get("section");

    if (!title) return new Response("Missing title", { status: 400 });

    const displayTitle = title.length > 36 ? title.slice(0, 34) + "…" : title;
    const displaySection = SECTION_LABELS[section ?? ""] ?? section ?? "";
    const displaySummary = summary
      ? summary.length > 60
        ? summary.slice(0, 58) + "…"
        : summary
      : "";

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "80px 100px",
            backgroundColor: "#2D2A26",
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
            position: "relative",
          }}
        >
          {/* Accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 3,
              backgroundColor: "#A67C52",
              opacity: 0.6,
            }}
          />

          {/* Section badge */}
          {displaySection && (
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#A67C52",
                marginBottom: 24,
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              {displaySection}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#F5F1EB",
              lineHeight: 1.2,
              marginBottom: displaySummary ? 20 : 40,
              letterSpacing: "0.02em",
              maxWidth: 1000,
            }}
          >
            {displayTitle}
          </div>

          {/* Summary */}
          {displaySummary && (
            <div
              style={{
                fontSize: 22,
                color: "#9C9590",
                lineHeight: 1.6,
                maxWidth: 900,
                fontWeight: 400,
              }}
            >
              {displaySummary}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 50,
              left: 100,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: "#F5F1EB",
                opacity: 0.5,
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
            >
              北行之路
            </div>
            <div
              style={{
                width: 1,
                height: 16,
                backgroundColor: "#9C9590",
                opacity: 0.3,
              }}
            />
            <div
              style={{
                fontSize: 16,
                color: "#9C9590",
                opacity: 0.4,
              }}
            >
              northwalking.cn
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new Response("Failed to generate image", { status: 500 });
  }
}
