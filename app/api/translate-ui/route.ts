import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// The English UI strings that need translating
// Keep this in sync with T.en in page.tsx
const EN_STRINGS = {
  topbar: "👨‍🍳 RECIPES BY PEOPLE · ✦ CURATED BY AI · ONLY THE BEST GOES LIVE",
  nav: ["Discover", "Categories", "Trending", "Season", "Meal Planner"],
  search: "Search recipes…",
  submit: "+ Submit Recipe",
  badge: "HUMAN-MADE · AI-CURATED",
  h1a: "Real recipes.",
  h1b: "Guaranteed quality.",
  sub: "Every recipe on Culirated is submitted by a real cook — home, food blogger or professional chef. Before it goes live, AI automatically checks whether it holds up.",
  humanLabel: "THE COOK",
  humanText: "Invents, cooks and writes the recipe. Real knowledge, real experience.",
  aiLabel: "THE AI",
  aiText: "Checks completeness, ratios and logic. Gatekeeper, not author.",
  liveLabel: "RESULT",
  liveText: "Only quality goes live",
  btnDiscover: "Discover Recipes →",
  btnHow: "How does the AI check work?",
  stats: [["12,400+", "Recipes"], ["500K", "Visitors/mo"], ["97%", "AI approval"]],
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
    { name: "BBQ", icon: "🔥", count: 640 },
    { name: "Vegan", icon: "✦", count: 2300 },
    { name: "Meal Prep", icon: "📦", count: 770 },
  ],
  gridTitle: "Freshly Approved",
  gridSub: "Latest recipes that passed the AI quality check",
  filters: ["Newest", "Top Rated", "Quick"],
  loadMore: "Load more recipes",
  howLabel: "✦ HOW IT WORKS",
  howH2a: "You cook.",
  howH2b: "AI approves.",
  howSub: "Recipes on Culirated are made by real people. AI doesn't touch the recipe; it only checks whether it checks out.",
  humanCard: ["👨‍🍳", "THE COOK", "Invents, cooks and writes the recipe. Real knowledge, real experience."],
  aiCard: ["✦", "THE AI", "Checks completeness, ratios and logic. Gatekeeper, not author."],
  steps: [
    ["1", "👨‍🍳", "You make the recipe", "Write, photograph or paste your recipe. Every format works: text, photo, PDF or URL."],
    ["2", "⚙️", "Normalisation", "Claude structures your submission automatically — your words, clean layout."],
    ["3", "✦", "AI quality check", "Ratios, completeness, logic and prep time verified. You get feedback if something's off."],
    ["4", "🟢", "Live!", "Approved? Your recipe goes live — categorised, searchable and visible to everyone."],
  ],
  stepWord: "STEP",
  pipeBtn: "Submit a recipe →",
  ctaH2a: "Your recipe",
  ctaH2b: "deserves a place.",
  ctaSub: "Submit as text, photo, PDF or URL. AI checks it automatically. The recipe stays yours.",
  ctaBtn: "+ Submit Recipe",
  ctaNote: "Free · No account needed for your first submission",
  footerLinks: ["About", "How it works", "Privacy", "Terms", "Contact"],
  footerTag: "Recipes by people · Curated by AI",
  featDesc: "Submitted by a home cook and approved by AI — ratios, step logic and prep time all checked.",
  aiChecked: "✦ AI approved",
  catL: { meast: "Middle Eastern", ital: "Italian", asian: "Asian", bake: "Baking", fus: "Fusion" },
  tagL: { prot: "High-protein", gf: "Gluten-free", veg: "Vegetarian", quick: "Quick", wknd: "Weekend", vegan: "Vegan" },
  share: "Share",
};

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { targetLang } = await req.json();

    if (!targetLang || typeof targetLang !== "string") {
      return NextResponse.json({ error: "Missing targetLang" }, { status: 400 });
    }

    // Never re-translate English
    if (targetLang === "en") {
      return NextResponse.json(EN_STRINGS);
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Translate the following JSON object from English to the language with ISO code "${targetLang}".

Rules:
- Return ONLY the translated JSON object, nothing else. No markdown, no backticks, no explanation.
- Keep all keys exactly the same — only translate the string values.
- Do NOT translate: emojis, numbers, brand names (Culirated, Claude, AI), URLs, icons like "✦", "→", "+".
- Preserve the exact JSON structure including arrays and nested objects.
- Keep the "count" values in the cats array unchanged (they are numbers).
- The translation must be natural and fluent, not literal.

JSON to translate:
${JSON.stringify(EN_STRINGS, null, 2)}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
    const translated = JSON.parse(cleaned);

    return NextResponse.json(translated);
  } catch (err) {
    console.error("translate-ui error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
