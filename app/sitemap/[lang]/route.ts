// app/sitemap/[lang]/route.ts
// Per taal een aparte sitemap — haalt alleen die taal op uit Supabase
// Klein bestand, snel te laden, geen timeout

import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const VALID_LANGS = ["en","nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang: rawLang } = await params;

  // Strip .xml extensie als die er in zit
  const lang = rawLang.replace(/\.xml$/, "");

  if (!VALID_LANGS.includes(lang)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    // Haal alle slugs op voor deze taal — max 2000 recepten per taal
    let slugs: { slug: string }[] = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/recipe_translations?select=slug&lang=eq.${lang}&slug=not.is.null&order=recipe_id.desc&limit=${pageSize}&offset=${page * pageSize}`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!res.ok) break;
      const data = await res.json();
      if (!data?.length) break;
      slugs = slugs.concat(data);
      if (data.length < pageSize) break;
      page++;
    }

    const now = new Date().toISOString();
    const priority = lang === "en" ? "0.8" : "0.7";

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${slugs
  .filter(t => t.slug)
  .map(t => `  <url>
    <loc>https://culirated.com/recept/${lang}/${encodeURIComponent(t.slug)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`)
  .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (e) {
    console.error(`Sitemap error for lang ${lang}:`, e);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
