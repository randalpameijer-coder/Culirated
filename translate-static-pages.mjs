// translate-static-pages.mjs
// Fetcht de Engelse statische paginas, vertaalt naar 19 talen, slaat HTML op in Supabase.
// Run: node C:\Users\Randa\culirated\translate-static-pages.mjs
// Versie ophogen = alles opnieuw vertaald

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env.local") });

const VERSION = "v1";
const BASE_URL = "https://culirated.com";
const PAGES = ["about", "how-it-works", "privacy", "terms", "contact"];
const LANGS = ["nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fetchPageHTML(page) {
  const res = await fetch(`${BASE_URL}/${page}`);
  const html = await res.text();

  // Extraheer alleen de .content div
  const match = html.match(/<div class="content">([\s\S]*?)<\/div>\s*<footer/);
  if (!match) {
    // Fallback: alles tussen <main> of body zonder nav/footer
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "");
    return body;
  }
  return match[1].trim();
}

async function translateHTML(html, targetLang) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `Translate all visible text in this HTML snippet from English to the language with ISO code "${targetLang}".

Rules:
- Return ONLY the translated HTML, nothing else. No explanation, no markdown backticks.
- Keep ALL HTML tags, attributes, classes, and inline styles exactly as they are.
- Only translate the visible text content between tags.
- Do NOT translate: brand names (Culirated, Claude, AI), email addresses, URLs, href values.
- Translate idiomatically — write how a native speaker would naturally say it.

HTML to translate:
${html}`
    }]
  });

  return message.content[0].type === "text" ? message.content[0].text.trim() : html;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`Culirated Static Pages Translation — version ${VERSION}`);
  console.log(`Pages: ${PAGES.join(", ")}`);
  console.log(`Languages: ${LANGS.length}\n`);

  for (const page of PAGES) {
    console.log(`\n=== /${page} ===`);
    let pageHTML;
    try {
      pageHTML = await fetchPageHTML(page);
      console.log(`Fetched ${pageHTML.length} chars`);
    } catch (err) {
      console.log(`FAILED to fetch: ${err.message}`);
      continue;
    }

    let success = 0;
    const failed = [];

    for (const lang of LANGS) {
      process.stdout.write(`  [${lang}] Translating... `);
      try {
        // Check of versie al up-to-date is
        const { data: existing } = await supabase
          .from("static_page_translations")
          .select("version")
          .eq("page", page)
          .eq("lang", lang)
          .single();

        if (existing?.version === VERSION) {
          console.log("skipped (up-to-date)");
          success++;
          continue;
        }

        const translated = await translateHTML(pageHTML, lang);

        const { error } = await supabase
          .from("static_page_translations")
          .upsert({ page, lang, content: translated, version: VERSION, updated_at: new Date().toISOString() }, { onConflict: "page,lang" });

        if (error) throw error;
        console.log("done");
        success++;
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
        failed.push(`${page}/${lang}`);
      }
      await sleep(400);
    }

    console.log(`  ${success}/${LANGS.length} for /${page}`);
    if (failed.length) console.log(`  Failed: ${failed.join(", ")}`);
  }

  console.log("\nAll done!");
}

main();
