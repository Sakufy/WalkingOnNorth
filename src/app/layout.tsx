import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/FooterFigma";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ReadingProgress } from "@/components/ReadingProgress";
import "./globals.css";

const siteUrl =
  process.env.NODE_ENV === "production"
    ? "https://beixingzhilu.com"
    : "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "北行之路 - 个人成长专属内容平台",
    template: "%s | 北行之路",
  },
  description:
    "奔赴本心、逆流世俗的个人成长之路。原创成长内容平台，服务追求精神自立的独立个体。倡导「北行独元」成长体系，以自我探索、自我提升、自我实现为完整成长闭环。",
  keywords: ["个人成长", "自我探索", "自我提升", "自我实现", "北行独元", "原创内容"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "北行之路",
    locale: "zh_CN",
    title: "北行之路 - 个人成长专属内容平台",
    description:
      "奔赴本心、逆流世俗的个人成长之路。原创成长内容平台，服务追求精神自立的独立个体。",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "北行之路 - 个人成长专属内容平台",
    description:
      "奔赴本心、逆流世俗的个人成长之路。原创成长内容平台，服务追求精神自立的独立个体。",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "北行之路",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/articles?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ScrollToTop />
          <ReadingProgress />
          <Navbar />
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
