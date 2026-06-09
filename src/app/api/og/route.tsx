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

    // Generate QR code as module matrix (Edge-compatible, no canvas/dom)
    const qrModules = await getQrModules(articleUrl);

    // Format title as lines
    const titleLines = wrapTitle(title, 18);

    // Format summary as quote lines
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

            {/* Right: QR code rendered as pixel modules */}
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
              <div
                style={{
                  display: "flex",
                  borderRadius: 8,
                  overflow: "hidden",
                  padding: 8,
                  backgroundColor: "#F5F1EB",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {qrModules.map((row, ri) => (
                    <div key={ri} style={{ display: "flex" }}>
                      {row.map((dark, ci) => (
                        <div
                          key={ci}
                          style={{
                            width: 4,
                            height: 4,
                            backgroundColor: dark ? "#2D2A26" : "#F5F1EB",
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e) {
    // If anything fails, return a simple fallback
    return new Response("Failed to generate", { status: 500 });
  }
}

/**
 * Generate QR code module matrix (2D boolean array).
 * qrcode's toDataURL needs canvas (not Edge), but we can parse segments directly.
 * Workaround: use toString('svg') and parse path data, OR use a simpler approach.
 *
 * Simplest Edge-compatible approach: generate via qrcode's internal data,
 * build matrix manually. qrcode@1.5.4 doesn't expose matrix directly,
 * so we parse the SVG output.
 */
async function getQrModules(text: string): Promise<boolean[][]> {
  try {
    // Generate SVG string — works in Edge (no canvas needed for SVG)
    const svg = await QRCode.toString(text, { type: "svg", margin: 0, width: undefined });
    // Parse viewBox to get size from SVG, default to 25x25
    const sizeMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 25;
    const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    // Extract rect elements from SVG and fill matrix
    const rectRegex = /<rect[^>]*x="(\d+)"[^>]*y="(\d+)"[^>]*width="1"[^>]*height="1"/g;
    let match;
    while ((match = rectRegex.exec(svg)) !== null) {
      const x = parseInt(match[1], 10);
      const y = parseInt(match[2], 10);
      if (x < size && y < size) matrix[y][x] = true;
    }

    // If no rects found, try path-based SVG (qrcode may use paths)
    if (matrix.flat().every((v) => !v)) {
      // Fill from path data — simple approach: fill all as black for margin
      // This is a fallback; in practice qrcode uses <rect> for SVG
      const pathRegex = /<path[^>]*d="M(\d+) (\d+)h1v1/g;
      while ((match = pathRegex.exec(svg)) !== null) {
        const x = parseInt(match[1], 10);
        const y = parseInt(match[2], 10);
        if (x < size && y < size) matrix[y][x] = true;
      }
    }

    return matrix;
  } catch {
    // Return a minimal dummy matrix
    return Array.from({ length: 25 }, () => Array(25).fill(false));
  }
}

/** Split title into lines */
function wrapTitle(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const lines: string[] = [];
  let remaining = text.trim();
  while (remaining.length > maxLen) {
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
    const line = remaining.slice(0, cut + 1);
    lines.push(line.trim());
    remaining = remaining.slice(line.length).trim();
  }
  if (remaining.length > 0 && lines.length === maxLines) {
    const last = lines[lines.length - 1];
    if (last.length > maxLen - 1) {
      lines[lines.length - 1] = last.slice(0, maxLen - 1) + "…";
    }
  }
  return lines;
}
