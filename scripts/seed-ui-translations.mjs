// scripts/seed-ui-translations.mjs
// Eenmalig draaien: node scripts/seed-ui-translations.mjs
// Genereert alle 19 taalvertalingen van de homepage UI en slaat op in Supabase.
// Draai opnieuw als je EN_STRINGS in route.ts of page.tsx hebt aangepast.

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const LANGS = ["nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];

const EN_STRINGS = {
  topbar: "✦ AI-GENERATED RECIPES · QUALITY-CHECKED · ONLY THE BEST GOES LIVE",
  nav: ["Discover", "Categories", "Trending", "Season", "Meal Planner"],
  search: "Search recipes…",
  badge: "AI-GENERATED · QUALITY-CHECKED",
  h1a: "Fresh recipes.",
  h1b: "Every single day.",
  sub: "Every day, AI generates new recipes across every category — trending-driven, quality-checked, and published automatically.",
  generateLabel: "THE AI",
  generateText: "Generates fresh recipes daily — trending-driven, seasonal, across every category.",
  checkLabel: "QUALITY CHECK",
  checkText: "Every recipe is scored before going live. Below 80? Not published.",
  liveLabel: "RESULT",
  liveText: "Only the best goes live",
  btnDiscover: "Discover Recipes →",
  btnHow: "How does it work?",
  stats: [["8/day", "New recipes"], ["20+", "Languages"], ["80+", "Min. AI score"]],
  aiScoreLabel: "AI SCORE",
  aiCriteria: ["✓ Completeness", "✓ Ratios", "✓ Logic", "✓ SEO"],
  catTitle: "Popular Categories",
  catMore: "All categories →",
  cats: [
    { name: "Quick (<20 min)", icon: "⚡", count: 1240 },
    { name: "Vegetarian", icon: "🌿", count: 3870 },
    { name: "Italian", icon: "🍝", count: 2150 },
    { name: "Asian", icon: "🥢", count: 1980 },
    { name: "Baking", icon: "🍞", count: 890 },
    { name: "BBQ & Grill", icon: "🔥", count: 640 },
    { name: "Vegan", icon: "✦", count: 2300 },
    { name: "Gluten-free", icon: "🌾", count: 1450 },
  ],
  gridTitle: "Today's Recipes",
  gridSub: "Latest AI-generated recipes that passed the quality check",
  filters: ["Newest", "Top Rated"],
  loadMore: "Load more recipes",
  howLabel: "✦ HOW IT WORKS",
  howH2a: "AI generates.",
  howH2b: "Quality guaranteed.",
  howSub: "Every day, AI creates fresh recipes based on what's trending — then quality-checks each one before it goes live. No filler, no duplicates.",
  generateCard: ["✦", "THE AI", "Generates fresh recipes daily — trending-driven, seasonal, per category."],
  checkCard: ["🟢", "QUALITY CHECK", "Every recipe scored on completeness, ratios and logic. Below 80 = not published."],
  steps: [
    ["1", "🔍", "Trending search", "AI searches what's trending per category — ingredients, cuisines, seasonal topics."],
    ["2", "✦", "Recipe generation", "Claude generates a complete recipe: ingredients, steps, prep time, calories."],
    ["3", "📊", "Quality check", "Ratios, completeness, logic and prep time verified. Score below 80? Retry."],
    ["4", "🟢", "Live!", "Approved recipes go live automatically — categorised, searchable, in 20+ languages."],
  ],
  stepWord: "STEP",
  footerLinks: ["About", "How it works", "Privacy", "Terms", "Contact"],
  footerTag: "AI-generated recipes · Quality-checked · Always transparent",
  aiChecked: "✦ AI approved",
  catL: { meast: "Middle Eastern", ital: "Italian", asian: "Asian", bake: "Baking", fus: "Fusion" },
  tagL: { prot: "High-protein", gf: "Gluten-free", veg: "Vegetarian", quick: "Quick", wknd: "Weekend", vegan: "Vegan" },
};

const EN_HASH = createHash("md5").update(JSON.stringify(EN_STRINGS)).digest("hex").slice(0, 8);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function translateLang(lang) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: `Translate the following JSON object from English to the language with ISO code "${lang}".

Rules:
- Return ONLY the translated JSON object, nothing else. No markdown, no backticks, no explanation.
- Keep all keys exactly the same — only translate the string values.
- Do NOT translate: emojis, numbers, brand names (Culirated, Claude, AI), URLs, icons like "✦", "→", "+".
- Preserve the exact JSON structure including arrays and nested objects.
- Keep the "count" values in the cats array unchanged (they are numbers).
- The translation must be natural and fluent, not literal.

JSON to translate:
${JSON.stringify(EN_STRINGS, null, 2)}`,
    }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

async function main() {
  console.log(`Hash: ${EN_HASH}`);
  console.log(`Vertalingen genereren voor ${LANGS.length} talen...\n`);

  for (const lang of LANGS) {
    try {
      process.stdout.write(`${lang}... `);
      const strings = await translateLang(lang);

      const { error } = await supabase
        .from("ui_translations")
        .upsert({ lang, hash: EN_HASH, strings, updated_at: new Date().toISOString() });

      if (error) throw error;
      console.log("✓");
    } catch (err) {
      console.log(`✗ FOUT: ${err.message}`);
    }

    // Kleine pauze om rate limiting te voorkomen
    await new Promise(r => setTimeout(r, 500));
  }

  console.log("\nKlaar!");
}

main();
