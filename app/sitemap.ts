// app/sitemap.ts
// Sitemap index — verwijst naar losse sitemaps per taal
// Next.js genereert dit automatisch als /sitemap.xml

import { MetadataRoute } from "next";

const LANGS = ["en","nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  // Next.js sitemap.ts ondersteunt geen sitemapindex natively.
  // We retourneren alleen de statische pagina's hier.
  // Recepten zitten in /sitemap/[lang].xml (apart route per taal).
  const now = new Date();

  return [
    { url: "https://culirated.com/", lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: "https://culirated.com/recipes", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "https://culirated.com/about", lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://culirated.com/how-it-works", lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://culirated.com/privacy", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://culirated.com/terms", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://culirated.com/contact", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
