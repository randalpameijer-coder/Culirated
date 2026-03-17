import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const OPENAI_KEY   = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!OPENAI_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("OPENAI_API_KEY:", OPENAI_KEY ? "✅" : "❌");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌");
  console.error("SUPABASE_SERVICE_KEY:", SUPABASE_KEY ? "✅" : "❌");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateAndUpload(recipe) {
  const prompt = `Professional food photography of ${recipe.title}. ${recipe.ai_score?.cuisine ? recipe.ai_score.cuisine + " cuisine." : ""} Shot on a clean white or natural wood surface, soft natural lighting, shallow depth of field, appetizing, magazine quality, high resolution. No text, no watermarks.`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024", quality: "standard" }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || "OpenAI error"); }
  const tempUrl = (await res.json()).data[0].url;

  const imgRes = await fetch(tempUrl);
  if (!imgRes.ok) throw new Error("Download failed");
  const buffer = await imgRes.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("recipe-images")
    .upload(`${recipe.id}.jpg`, buffer, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw new Error("Upload: " + uploadError.message);

  const { data: urlData } = supabase.storage.from("recipe-images").getPublicUrl(`${recipe.id}.jpg`);

  const { error: updateError } = await supabase.from("recipes").update({ image_url: urlData.publicUrl }).eq("id", recipe.id);
  if (updateError) throw new Error("DB: " + updateError.message);

  return urlData.publicUrl;
}

async function main() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, ai_score, image_url")
    .not("image_url", "like", `%${SUPABASE_URL.replace("https://", "")}%`)
    .order("created_at", { ascending: true });

  if (error) { console.error(error); process.exit(1); }
  console.log(`🎨 Generating images for ${recipes.length} recipes...\n`);

  let done = 0, failed = 0;
  for (const recipe of recipes) {
    process.stdout.write(`[${done + failed + 1}/${recipes.length}] ${recipe.title.slice(0, 50)}... `);
    try {
      await generateAndUpload(recipe);
      done++;
      console.log(`✅`);
    } catch (err) {
      failed++;
      console.log(`❌ ${err.message}`);
    }
    if (done + failed < recipes.length) await sleep(13000);
  }
  console.log(`\n🎉 Done! ${done} images stored, ${failed} failed.`);
}

main();
