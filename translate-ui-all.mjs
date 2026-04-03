// translate-ui-all.mjs
// Vertaalt de homepage UI naar alle 19 talen en slaat op in Supabase.
// Run: node C:\Users\Randa\culirated\translate-ui-all.mjs

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env.local") });

const VERSION = "v5";

const LANGS = ["nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];

const EN_STRINGS = {
  topbar: "AI CREATES THE RECIPE  \u00b7  YOU COOK IT  \u00b7  COMMUNITY RATES",
  nav: ["Discover", "Categories", "Trending", "Season", "Challenges"],
  search: "Search recipes",
  badge: "AI-GENERATED \u00b7 COMMUNITY TESTED",
  h1a: "Cook what", h1b: "AI dreams up.",
  sub: "Every day, AI generates 24 new recipes \u2014 trending-driven, quality-checked. Your job: pick one, cook it, and rate it. The community decides what's worth making.",
  generateLabel: "AI CREATES", generateText: "24 fresh recipes every day \u2014 trending-driven, seasonal, quality-checked.",
  checkLabel: "YOU COOK", checkText: "Pick a recipe, make it at home. Photos, tips, variations all welcome.",
  liveLabel: "COMMUNITY RATES", liveText: "Reactions & scores \u2014 the best rise to the top",
  btnDiscover: "See today's recipes", btnHow: "This week's challenge",
  stats: [["24/day", "New recipes"], ["20+", "Languages"], ["100%", "AI-generated"]],
  aiScoreLabel: "AI SCORE", aiCriteria: ["Completeness", "Ratios", "Logic", "SEO"],
  catTitle: "Latest per category", catMore: "All recipes",
  cats: [
    { name: "Vegetarian", icon: "🥗", url: "/recipes?diet=Vegetarian" },
    { name: "Vegan", icon: "🌱", url: "/recipes?diet=Vegan" },
    { name: "Gluten-free", icon: "🌾", url: "/recipes?diet=Gluten-free" },
    { name: "Italian", icon: "🍝", url: "/recipes?cuisine=Italian" },
    { name: "Asian", icon: "🍜", url: "/recipes?cuisine=Asian" },
    { name: "Mediterranean", icon: "🫒", url: "/recipes?cuisine=Mediterranean" },
    { name: "Quick", icon: "⚡", url: "/recipes?time=%3C+30+min" },
    { name: "High-protein", icon: "💪", url: "/recipes?diet=High-protein" },
  ],
  gridTitle: "Today's AI Recipes", gridSub: "Fresh from the AI kitchen \u2014 cook one and rate it",
  filters: ["Newest", "Top Rated"], loadMore: "Load more recipes",
  howLabel: "HOW IT WORKS", howH2a: "AI creates.", howH2b: "You cook it.",
  howSub: "No human submissions. AI generates fresh recipes daily based on what's trending. The community cooks them, rates them, and decides what's actually worth making.",
  generateCard: ["🤖", "AI CREATES", "Trending-driven, quality-checked before going live. 24 new recipes every day."],
  checkCard: ["👨‍🍳", "YOU COOK IT", "Pick a recipe, make it, share your result. The community votes on the best versions."],
  steps: [
    ["1", "🔍", "Trending search", "AI searches what's trending per category \u2014 ingredients, cuisines, seasonal topics."],
    ["2", "", "Recipe generation", "Claude generates a complete recipe: ingredients, steps, prep time, calories."],
    ["3", "📊", "Quality check", "Ratios, completeness, logic verified. Score below 80? Not published."],
    ["4", "🌍", "Goes live", "Approved recipes go live automatically \u2014 categorised, searchable, in 20+ languages."],
    ["5", "👨‍🍳", "Your turn", "Think you can do better? Cook it, tweak it, improve it. Post your version with #culirated and show the AI how it's really done."],
  ],
  stepWord: "STEP",
  challengeLabel: "THIS WEEK'S CHALLENGE",
  challengeH2: "AI made it. Now you make it better.",
  challengeSub: "Pick this week's featured recipe, cook it your way, and share your result. The community votes on the best versions.",
  challengeBtn: "Join the challenge",
  makeIt: "Make this",
  navCats: {
    diet: "Diet", time: "Time", cuisine: "Cuisine", meal: "Meal", level: "Level",
    dietItems: ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "High-protein", "Low-carb", "Keto", "Pescatarian"],
    timeItems: ["< 15 min", "< 30 min", "< 45 min", "< 1 hour", "Weekend"],
    cuisineItems: ["Italian", "Asian", "Mexican", "Indian", "Mediterranean", "Middle Eastern", "French", "Greek", "Japanese", "Chinese", "Thai", "American", "Vietnamese", "Korean", "North African"],
    mealItems: ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Salad", "Starter", "Side dish"],
    levelItems: ["Easy", "Medium", "Advanced"],
  },
  share: "Share", copyLink: "Copy link",
  footerLinks: ["About", "How it works", "Privacy", "Terms", "Contact"],
  footerTag: "AI creates \u00b7 You cook \u00b7 Community rates",
  disclaimer: "Recipes on Culirated are AI-generated and quality-checked before publication. Always follow food safety guidelines when preparing and storing food. Culirated is not liable for errors in recipes. Stated dietary labels (e.g. gluten-free, vegan) are AI-assessed \u2014 always verify with product packaging if you have allergies.",
  aiChecked: "AI generated",
  catL: { meast: "Middle Eastern", ital: "Italian", asian: "Asian", bake: "Baking", fus: "Fusion" },
  tagL: { prot: "High-protein", gf: "Gluten-free", veg: "Vegetarian", quick: "Quick", wknd: "Weekend", vegan: "Vegan" },
};

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function translateLang(lang) {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 6000,
    messages: [{
      role: "user",
      content: `Translate the following JSON object from English to the language with ISO code "${lang}".

Rules:
- Return ONLY the translated JSON object, nothing else. No markdown, no backticks, no explanation.
- Keep all keys exactly the same — only translate the string values.
- Do NOT translate: emojis, numbers, brand names (Culirated, Claude, AI), URLs, "#culirated".
- Preserve the exact JSON structure including arrays and nested objects.
- The cats array: translate only the "name" field, keep "icon" and "url" unchanged.
- Translate idiomatically — write how a native speaker would naturally say it, never word-for-word.
- For titles, slogans and short labels: rephrase freely to sound natural. Example: "Today's AI Recipes" in Dutch should be "AI-recepten van vandaag", not "Vandaag's AI-recepten".
- Possessive constructions like "Today's", "This week's" must be restructured to fit the target language grammar naturally.

JSON to translate:
${JSON.stringify(EN_STRINGS, null, 2)}`,
    }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  const translated = JSON.parse(cleaned);
  translated._v = VERSION;
  return translated;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`Culirated UI Translation Backfill — version ${VERSION}`);
  console.log(`Translating ${LANGS.length} languages...\n`);

  let success = 0;
  let failed = [];

  for (const lang of LANGS) {
    try {
      process.stdout.write(`[${lang}] Translating... `);
      const translated = await translateLang(lang);

      const { error } = await supabase
        .from("ui_translations")
        .upsert({ lang, strings: translated, updated_at: new Date().toISOString() });

      if (error) throw error;

      console.log(`done`);
      success++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed.push(lang);
    }

    // 500ms delay tussen calls om rate limits te vermijden
    await sleep(500);
  }

  console.log(`\nDone: ${success}/${LANGS.length} succeeded.`);
  if (failed.length > 0) {
    console.log(`Failed: ${failed.join(", ")}`);
    console.log(`Retry failed langs by running the script again — it skips nothing, overwrites all.`);
  }
}

main();
