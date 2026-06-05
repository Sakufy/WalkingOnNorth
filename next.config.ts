import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack: never bundle @libsql/client at build time
  // (Vercel build network blocks hrana protocol → 401)
  serverExternalPackages: ["@libsql/client"],

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  async headers() {
    return [
      // Static assets: browser cache 1 year, never re-download
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Public pages: CDN caches 1 hour, serves stale up to 1 day while refreshing
      {
        source: "/((?!admin|api|auth|debug).*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      // Block indexing
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/debug/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
