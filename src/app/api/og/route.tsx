import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const SECTION_LABELS: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

const SITE_URL = "https://northwalking.cn";

// Portrait card — 2:3 ratio, letter-like warmth
const W = 600;
const H = 900;
const PX = 56; // horizontal padding
const PT = 80; // top padding
const PB = 64; // bottom padding

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

    // QR via external API — warm-black modules on white (#F5F1EB/2D2A26)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(articleUrl)}&bgcolor=F5F1EB&color=2D2A26&margin=0`;

    const titleLines = wrapTitle(title, 12);
    const quoteLines = summary ? wrapText(summary, 16, 4) : [];

    return new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: `${PT}px ${PX}px ${PB}px ${PX}px`,
            backgroundColor: "#F5F1EB",
            fontFamily: '"Noto Serif SC", serif',
            position: "relative",
          }}
        >
          {/* Subtle top line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: PX,
              right: PX,
              height: 1,
              backgroundColor: "#E8E3DC",
            }}
          />

          {/* Section label */}
          {sectionLabel && (
            <div
              style={{
                fontSize: 14,
                color: "#A67C52",
                letterSpacing: "0.1em",
                fontWeight: 500,
                marginBottom: 32,
              }}
            >
              {sectionLabel}
            </div>
          )}

          {/* Title — large, breathing */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: quoteLines.length > 0 ? 48 : 64 }}>
            {titleLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: "#2D2A26",
                  lineHeight: 1.3,
                  letterSpacing: "0.04em",
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {/* Quote — italic, left-bordered */}
          {quoteLines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                fontSize: 18,
                color: "#6B6560",
                lineHeight: 1.7,
                fontStyle: "italic",
                paddingLeft: 16,
                borderLeftWidth: 2,
                borderLeftStyle: "solid",
                borderLeftColor: "rgba(166,124,82,0.3)",
                marginBottom: i < quoteLines.length - 1 ? 4 : 0,
              }}
            >
              {i === 0 && '"'}
              {line}
              {i === quoteLines.length - 1 && '"'}
            </div>
          ))}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom row: brand + QR */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            {/* Brand */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  fontSize: 16,
                  color: "#2D2A26",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                北行之路
              </div>
              <div style={{ fontSize: 13, color: "#9C9590" }}>
                northwalking.cn
              </div>
            </div>

            {/* QR code */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              width={100}
              height={100}
              alt=""
            />
          </div>

          {/* Subtle bottom line */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: PX,
              right: PX,
              height: 1,
              backgroundColor: "#E8E3DC",
            }}
          />
        </div>
      ),
      { width: W, height: H }
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
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, maxLen - 1) + "…";
  }
  return lines;
}
