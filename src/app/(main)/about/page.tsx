import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPageContent } from "@/lib/db/queries";
import { AboutPage, type AboutPageData } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "关于",
  description:
    "了解北行之路背后的创作者——一位正在路上的独立探索者。记录成长实践，以内容铺路，与同频者同行。",
  openGraph: {
    title: "关于 | 北行之路",
    description:
      "了解北行之路背后的创作者——一位正在路上的独立探索者。记录成长实践，以内容铺路，与同频者同行。",
  },
};

export default async function Page() {
  await headers(); // forces runtime rendering, skips SSG pre-render
  const page = await getPageContent("about");
  let pageData: AboutPageData | undefined;
  if (page?.content) {
    try { pageData = JSON.parse(page.content) as AboutPageData; } catch { /* use defaults */ }
  }
  return <AboutPage pageData={pageData} />;
}
