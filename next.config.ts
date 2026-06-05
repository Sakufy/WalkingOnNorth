import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack must not bundle @libsql/client at build time.
  // Vercel build network blocks hrana protocol → 401.
  // Keep it as external runtime import.
  serverExternalPackages: ["@libsql/client"],

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
