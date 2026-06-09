import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const SECTION_LABELS: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

const SITE_URL = "https://northwalking.cn";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") ?? "";
    const summary = searchParams.get("summary") ?? "";
    const section = searchParams.get("section") ?? "";
    const slug = searchParams.get("slug") ?? "";

    if (!title) return new Response("Missing title", { status: 400 });

    const sectionLabel = SECTION_LABELS[section] ?? "";
    const articleUrl = slug ? `${SITE_URL}/posts/${slug}` : SITE_URL;

    // QR code: use Google Charts API (works from any runtime, no deps needed)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(articleUrl)}&bgcolor=2D2A26&color=F5F1EB`;

    const titleLines = wrapTitle(title, 18);
    const quoteLines = summary ? wrapText(summary, 24, 3) : [];

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px 100px 80px 80px",
            backgroundColor: "#2D2A26",
            fontFamily: '"Noto Serif SC", serif',
            position: "relative",
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 2,
              backgroundColor: "#A67C52",
              opacity: 0.5,
            }}
          />

          {/* Content row */}
          <div style={{ display: "flex", flex: 1 }}>
            {/* Left text */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
                paddingRight: "60px",
              }}
            >
              {/* Section label */}
              {sectionLabel && (
                <div
                  style={{
                    fontSize: 16,
                    color: "#A67C52",
                    letterSpacing: "0.08em",
                    fontWeight: 500,
                    marginBottom: 28,
                  }}
                >
                  {sectionLabel}
                </div>
              )}

              {/* Title */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  marginBottom: quoteLines.length > 0 ? 32 : 48,
                }}
              >
                {titleLines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 46,
                      fontWeight: 700,
                      color: "#F5F1EB",
                      lineHeight: 1.25,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Quote */}
              {quoteLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    fontSize: 22,
                    color: "#9C9590",
                    lineHeight: 1.6,
                    fontStyle: "italic",
                    marginBottom: i === quoteLines.length - 1 ? 40 : 0,
                    paddingLeft: 20,
                    borderLeftWidth: 2,
                    borderLeftStyle: "solid",
                    borderLeftColor: "rgba(166,124,82,0.3)",
                  }}
                >
                  {i === 0 && '"'}
                  {line}
                  {i === quoteLines.length - 1 && '"'}
                </div>
              ))}

              {/* Brand */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                    height: 14,
                    backgroundColor: "#9C9590",
                    opacity: 0.25,
                  }}
                />
                <div style={{ fontSize: 15, color: "#9C9590", opacity: 0.35 }}>
                  northwalking.cn
                </div>
              </div>
            </div>

            {/* Right: QR code via external image (fetched at render time by Satori) */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                flexShrink: 0,
                paddingBottom: 8,
                marginLeft: 20,
              }}
            >
              {/* Using @vercel/og's built-in img support for external URLs */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                width={160}
                height={160}
                style={{
                  borderRadius: 8,
                }}
                alt=""
              />
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new Response("Generation failed", { status: 500 });
  }
}

function wrapTitle(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const lines: string[] = [];
  let r = text.trim();
  while (r.length > maxLen) {
    let cut = r.lastIndexOf("，", maxLen);
    if (cut < 0 || cut < maxLen / 2) cut = r.lastIndexOf("、", maxLen);
    if (cut < 0 || cut < maxLen / 2) cut = r.lastIndexOf(" ", maxLen);
    if (cut < 0 || cut < maxLen / 2) cut = maxLen;
    lines.push(r.slice(0, cut).trim());
    r = r.slice(cut).trim();
  }
  if (r) lines.push(r);
  return lines;
}

function wrapText(text: string, maxLen: number, maxLines: number): string[] {
  const t = text.trim();
  if (!t) return [];
  const lines: string[] = [];
  let r = t;
  while (r.length > 0 && lines.length < maxLines) {
    if (r.length <= maxLen) { lines.push(r); break; }
    let cut = r.lastIndexOf("，", maxLen);
    if (cut < 0 || cut < maxLen / 2) cut = r.lastIndexOf("。", maxLen);
    if (cut < 0 || cut < maxLen / 2) cut = maxLen;
    lines.push(r.slice(0, cut + 1).trim());
    r = r.slice(cut + 1).trim();
  }
  if (r.length > 0 && lines.length === maxLines) {
    const last = lines[lines.length - 1];
    if (last.length > maxLen - 1) lines[lines.length - 1] = last.slice(0, maxLen - 1) + "…";
  }
  return lines;
}
