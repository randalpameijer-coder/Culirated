// app/sitemaps.xml/route.ts
// Sitemap index — submit DIT bestand in Search Console: culirated.com/sitemaps.xml
// Verwijst naar losse sitemaps per taal

import { NextResponse } from "next/server";

const LANGS = ["en","nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${LANGS.map(lang => `  <sitemap>
    <loc>https://culirated.com/sitemap/${lang}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
