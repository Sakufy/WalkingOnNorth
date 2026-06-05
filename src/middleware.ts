import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

/**
 * Use authConfig directly (no DB providers) for Edge Middleware.
 * @libsql/client resolves to WASM in Edge Runtime, which is incompatible.
 * The middleware only needs JWT verification (secret + callbacks) which
 * authConfig provides without pulling in drizzle/libsql-client.
 */
const { auth } = NextAuth(authConfig);

// biome-ignore lint/suspicious/noExplicitAny: NextAuth middleware type
export default auth((req: any) => {
  const { pathname } = req.nextUrl;

  // Protect /admin/* — only admin role
  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (req.auth.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
