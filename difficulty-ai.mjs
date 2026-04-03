import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync("C:\\Users\\Randa\\culirated\\.env.local", "utf-8");
const envVars = Object.fromEntries(
  env.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: envVars.ANTHROPIC_API_KEY });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getDifficulty(recipe) {
  const ingredients = (recipe.ingredients || []).slice(0, 15).join(", ");
  const steps = (recipe.steps || []).slice(0, 8).join(" | ");

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 10,
    messages: [{
      role: "user",
      content: `Rate the cooking difficulty of this recipe as exactly one word: Easy, Medium, or Advanced.

Title: ${recipe.title}
Ingredients: ${ingredients}
Steps: ${steps}

Criteria:
- Easy: basic techniques, few steps, forgiving, no special skills needed
- Medium: multiple components, some timing required, intermediate techniques
- Advanced: complex techniques (tempering, lamination, emulsification), critical timing, special skills

Reply with only: Easy, Medium, or Advanced`
    }]
  });

  const result = msg.content[0].text.trim();
  if (["Easy", "Medium", "Advanced"].includes(result)) return result;
  // Fallback als het niet exact klopt
  if (result.toLowerCase().includes("easy")) return "Easy";
  if (result.toLowerCase().includes("medium")) return "Medium";
  return "Advanced";
}

async function main() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, ingredients, steps, ai_score")
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) { console.error(error); return; }

  console.log(`🚀 ${recipes.length} recepten verwerken...\n`);

  let easy = 0, medium = 0, advanced = 0, failed = 0;

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    process.stdout.write(`[${i+1}/${recipes.length}] ${recipe.title.slice(0, 45)}... `);

    try {
      const difficulty = await getDifficulty(recipe);

      await supabase
        .from("recipes")
        .update({ ai_score: { ...recipe.ai_score, difficulty } })
        .eq("id", recipe.id);

      console.log(difficulty);
      if (difficulty === "Easy") easy++;
      else if (difficulty === "Medium") medium++;
      else advanced++;

      await sleep(200);
    } catch (err) {
      console.log(`❌ ${err.message.slice(0, 50)}`);
      failed++;
      await sleep(500);
    }
  }

  console.log(`\n✅ Easy: ${easy} | Medium: ${medium} | Advanced: ${advanced} | Mislukt: ${failed}`);
}

main().catch(console.error);
