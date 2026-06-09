import { ImageResponse } from "@vercel/og";
import QRCode from "qrcode";

export const runtime = "edge";

const SECTION_LABELS: Record<string, string> = {
  explore: "自我探索",
  improve: "自我提升",
  realize: "自我实现",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") ?? "";
    const summary = searchParams.get("summary") ?? "";
    const section = searchParams.get("section") ?? "";
    const slug = searchParams.get("slug") ?? "";

    if (!title) return new Response("Missing title", { status: 400 });

    const sectionLabel = SECTION_LABELS[section] ?? "";
    const siteUrl = "https://northwalking.cn";
    const articleUrl = slug ? `${siteUrl}/posts/${slug}` : siteUrl;

    // Generate QR code as SVG data URI
    const qrSvg = await QRCode.toString(articleUrl, {
      type: "svg",
      margin: 1,
      width: 160,
      color: { dark: "#F5F1EB", light: "#2D2A26" },
    });
    const qrDataUri = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString("base64")}`;

    // Format title: max ~18 chars per line
    const lines = wrapTitle(title, 18);

    // Summary as quote, max ~24 chars per line, max 3 lines
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
            fontFamily: '"Noto Serif SC", "Source Serif 4", Georgia, serif',
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

          {/* Left content area */}
          <div style={{ display: "flex", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, paddingRight: "60px" }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: quoteLines.length > 0 ? 32 : 48 }}>
                {lines.map((line, i) => (
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

              {/* Quote (金句) */}
              {quoteLines.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 40 }}>
                  {quoteLines.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 22,
                        color: "#9C9590",
                        lineHeight: 1.6,
                        fontStyle: "italic",
                        paddingLeft: 20,
                        borderLeft: "2px solid rgba(166,124,82,0.3)",
                      }}
                    >
                      {i === 0 ? `"${line}` : line}
                      {i === quoteLines.length - 1 ? '"' : ""}
                    </div>
                  ))}
                </div>
              )}

              {/* Brand */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 18, color: "#F5F1EB", opacity: 0.5, fontWeight: 500, letterSpacing: "0.06em" }}>
                  北行之路
                </div>
                <div style={{ width: 1, height: 14, backgroundColor: "#9C9590", opacity: 0.25 }} />
                <div style={{ fontSize: 15, color: "#9C9590", opacity: 0.35 }}>
                  northwalking.cn
                </div>
              </div>
            </div>

            {/* Right: QR code */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                flexShrink: 0,
                paddingBottom: 8,
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 8,
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUri} width={160} height={160} alt="" />
              </div>
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

/** Split title into lines, trying to break at natural boundaries */
function wrapTitle(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const lines: string[] = [];
  let remaining = text.trim();
  while (remaining.length > maxLen) {
    // Try to break at last punctuation or space
    let cut = remaining.lastIndexOf("，", maxLen);
    if (cut === -1 || cut < maxLen / 2) cut = remaining.lastIndexOf("、", maxLen);
    if (cut === -1 || cut < maxLen / 2) cut = remaining.lastIndexOf(" ", maxLen);
    if (cut === -1 || cut < maxLen / 2) cut = maxLen;
    lines.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) lines.push(remaining);
  return lines;
}

/** Wrap body text to max lines, truncating with … */
function wrapText(text: string, maxLen: number, maxLines: number): string[] {
  const words = text.trim();
  if (!words) return [];
  const lines: string[] = [];
  let remaining = words;
  while (remaining.length > 0 && lines.length < maxLines) {
    if (remaining.length <= maxLen) {
      lines.push(remaining);
      break;
    }
    let cut = remaining.lastIndexOf("，", maxLen);
    if (cut === -1 || cut < maxLen / 2) cut = remaining.lastIndexOf("。", maxLen);
    if (cut === -1 || cut < maxLen / 2) cut = maxLen;
    const line = remaining.slice(0, cut + (remaining[cut] === "，" || remaining[cut] === "。" ? 1 : 0));
    lines.push(line.trim());
    remaining = remaining.slice(line.length).trim();
  }
  // Truncate last line if too long
  if (remaining.length > 0 && lines.length === maxLines) {
    const last = lines[lines.length - 1];
    if (last.length > maxLen - 1) {
      lines[lines.length - 1] = last.slice(0, maxLen - 1) + "…";
    }
  }
  return lines;
}
