import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// ── Config ─────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;

if (!ANTHROPIC_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars:");
  console.error("ANTHROPIC_API_KEY:", ANTHROPIC_KEY ? "✅" : "❌ missing");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌ missing");
  console.error("SUPABASE_SERVICE_KEY:", SUPABASE_KEY ? "✅" : "❌ missing");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
const supabase  = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Category axes ──────────────────────────────────────
const CUISINES   = ["Italian","Mexican","Asian","Indian","Thai","Chinese","Japanese","Greek","Middle Eastern","French","American","Mediterranean"];
const COURSES    = ["Breakfast","Lunch","Dinner","Appetizer","Side dish","Dessert","Snack"];
const DIETS      = ["Vegetarian","Vegan","Gluten-free","Dairy-free","Low-carb","High-protein"];
const METHODS    = ["Air fryer","Slow cooker","Sheet pan","BBQ & Grill","One pot","No-cook"];
const TIMES      = ["Under 20 min","Under 30 min","Under 1 hour","Weekend project"];
const OCCASIONS  = ["Weeknight","Meal prep","Holidays","Kids","Date night","Batch cooking"];
const INGREDIENTS= ["Chicken","Beef","Fish & seafood","Pasta","Rice","Eggs","Vegetables","Legumes","Pork"];

// ── Helpers ────────────────────────────────────────────
function pick(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Generate a batch of 10 recipes ────────────────────
async function generateBatch(batchIndex) {
  const cuisine   = pick(CUISINES)[0];
  const course    = pick(COURSES)[0];
  const method    = pick(METHODS)[0];
  const ingredient= pick(INGREDIENTS)[0];

  const prompt = `Generate exactly 5 original, high-quality recipes. Mix of cuisines and difficulties.
Focus this batch on: ${cuisine} cuisine, ${course} course, ${method} cooking method, main ingredient: ${ingredient}.
But vary the recipes — not all need to match every focus.

For each recipe respond with a JSON array (no markdown, no explanation):
[
  {
    "title": "Recipe Name",
    "description": "SEO-optimized description max 160 chars",
    "prep_time": 30,
    "servings": 4,
    "calories": 450,
    "difficulty": "easy|medium|advanced",
    "cuisine": "one of: ${CUISINES.join(", ")}",
    "course": "one of: ${COURSES.join(", ")}",
    "diet": ["array of applicable: ${DIETS.join(", ")}"],
    "method": "one of: ${METHODS.join(", ")}",
    "time_category": "one of: ${TIMES.join(", ")}",
    "occasion": ["array of applicable: ${OCCASIONS.join(", ")}"],
    "main_ingredient": "one of: ${INGREDIENTS.join(", ")}",
    "ingredients": ["200g pasta", "2 cloves garlic", "..."],
    "steps": ["Step 1 description", "Step 2 description", "..."],
    "ai_score": 92
  }
]

Rules:
- Realistic quantities and steps
- Steps should be numbered implicitly (just the text)
- Diet tags only if truly applicable
- ai_score between 80-99
- Return ONLY valid JSON array, nothing else`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].text.replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

// ── Insert batch into Supabase ─────────────────────────
async function insertBatch(recipes) {
  let inserted = 0;
  for (const r of recipes) {
    const { error } = await supabase.from("recipes").insert({
      title:       r.title,
      description: r.description,
      ingredients: r.ingredients || [],
      steps:       r.steps || [],
      prep_time:   r.prep_time,
      servings:    r.servings,
      calories:    r.calories,
      difficulty:  r.difficulty,
      status:      "approved",
      ai_score: {
        score:           r.ai_score,
        cuisine:         r.cuisine,
        course:          r.course,
        diet:            r.diet || [],
        method:          r.method,
        time_category:   r.time_category,
        occasion:        r.occasion || [],
        main_ingredient: r.main_ingredient,
      },
    });
    if (error) {
      console.error("Insert error:", error.message, "for", r.title);
    } else {
      inserted++;
    }
  }
  return inserted;
}

// ── Main ───────────────────────────────────────────────
async function main() {
  const TOTAL_BATCHES = 76; // 76 batches × 5 = 380 more recipes (120 already done = 500 total)
  let totalInserted = 0;

  console.log("🍳 Starting recipe generation — 380 more recipes in 76 batches...\n");

  for (let i = 0; i < TOTAL_BATCHES; i++) {
    process.stdout.write(`Batch ${i + 1}/${TOTAL_BATCHES}... `);
    try {
      const recipes  = await generateBatch(i);
      const inserted = await insertBatch(recipes);
      totalInserted += inserted;
      console.log(`✅ ${inserted} recipes inserted (total: ${totalInserted})`);
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
    // Small delay to avoid rate limits
    if (i < TOTAL_BATCHES - 1) await sleep(1500);
  }

  console.log(`\n🎉 Done! ${totalInserted} recipes inserted into Supabase.`);
}

main();
