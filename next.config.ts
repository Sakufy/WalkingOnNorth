import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack: never bundle these at build time.
  // @libsql/client — Vercel network blocks hrana during build
  // jsdom chain — ESM requires crash in Turbopack
  serverExternalPackages: [
    "@libsql/client",
    "jsdom",
    "html-encoding-sniffer",
    "@exodus/bytes",
  ],

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  async headers() {
    return [
      // Static assets: cache for 1 year on CDN
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
