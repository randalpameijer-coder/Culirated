import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const OPENAI_KEY   = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateEmbedding(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  if (!res.ok) throw new Error("OpenAI error");
  const data = await res.json();
  return data.data[0].embedding;
}

async function main() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, ingredients")
    .is("embedding", null)
    .order("created_at", { ascending: true });

  if (error) { console.error(error); process.exit(1); }
  console.log(`🔢 Generating embeddings for ${recipes.length} recipes...\n`);

  let done = 0, failed = 0;
  for (const recipe of recipes) {
    process.stdout.write(`[${done + failed + 1}/${recipes.length}] ${recipe.title.slice(0, 50)}... `);
    try {
      const ingredientText = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(" ") : "";
      const text = `${recipe.title} ${ingredientText}`.slice(0, 500);
      const embedding = await generateEmbedding(text);
      const { error: updateError } = await supabase.from("recipes").update({ embedding }).eq("id", recipe.id);
      if (updateError) throw new Error(updateError.message);
      done++;
      console.log("✅");
    } catch (err) {
      failed++;
      console.log(`❌ ${err.message}`);
    }
    await sleep(100); // embeddings zijn goedkoop en snel, klein pauzetje
  }
  console.log(`\n🎉 Done! ${done} embeddings stored, ${failed} failed.`);
}

main();
