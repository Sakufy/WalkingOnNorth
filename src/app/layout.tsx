import type { Metadata, Viewport } from "next";
import { Noto_Serif_SC, Noto_Sans_SC, Source_Serif_4 } from "next/font/google";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/FooterFigma";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ReadingProgress } from "@/components/ReadingProgress";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif-body",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif-heading",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.northwalking.cn"
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
    <html
      lang="zh-CN"
      className={`h-full antialiased ${notoSerifSC.variable} ${sourceSerif4.variable} ${notoSansSC.variable}`}
    >
      <head>
        {/* Preconnect to font CDN — browser starts DNS+TCP before CSS @import is parsed */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
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
