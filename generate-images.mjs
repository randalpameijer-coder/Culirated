import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const OPENAI_KEY   = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!OPENAI_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars:");
  console.error("OPENAI_API_KEY:", OPENAI_KEY ? "✅" : "❌");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌");
  console.error("SUPABASE_SERVICE_KEY:", SUPABASE_KEY ? "✅" : "❌");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateImage(title, cuisine) {
  const prompt = `Professional food photography of ${title}. ${cuisine ? cuisine + " cuisine." : ""} Shot on a clean white or natural wood surface, soft natural lighting, shallow depth of field, appetizing, magazine quality, high resolution. No text, no watermarks.`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "OpenAI error");
  }

  const data = await res.json();
  return data.data[0].url;
}

async function main() {
  // Fetch all recipes without image
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, ai_score")
    .is("image_url", null)
    .order("created_at", { ascending: true });

  if (error) { console.error("Supabase error:", error); process.exit(1); }

  console.log(`🎨 Generating images for ${recipes.length} recipes...\n`);

  let done = 0;
  let failed = 0;

  for (const recipe of recipes) {
    process.stdout.write(`[${done + failed + 1}/${recipes.length}] ${recipe.title.slice(0, 50)}... `);
    try {
      const imageUrl = await generateImage(recipe.title, recipe.ai_score?.cuisine);
      
      const { error: updateError } = await supabase
        .from("recipes")
        .update({ image_url: imageUrl })
        .eq("id", recipe.id);

      if (updateError) throw new Error(updateError.message);
      
      done++;
      console.log(`✅`);
    } catch (err) {
      failed++;
      console.log(`❌ ${err.message}`);
    }

    // Rate limit: max 5 images/min on standard tier
    await sleep(12000); // 12 seconds between requests
  }

  console.log(`\n🎉 Done! ${done} images generated, ${failed} failed.`);
}

main();
