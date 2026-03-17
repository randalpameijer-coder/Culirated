import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const OPENAI_KEY   = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateAndUpload(recipe) {
  const prompt = `Professional food photography of ${recipe.title}. ${recipe.ai_score?.cuisine ? recipe.ai_score.cuisine + " cuisine." : ""} Shot on a clean white or natural wood surface, soft natural lighting, shallow depth of field, appetizing, magazine quality, high resolution. No text, no watermarks.`;

  // 1. Generate image from OpenAI
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
  const tempUrl = data.data[0].url;

  // 2. Download the image
  const imgRes = await fetch(tempUrl);
  if (!imgRes.ok) throw new Error("Failed to download image");
  const buffer = await imgRes.arrayBuffer();

  // 3. Upload to Supabase Storage
  const filename = `${recipe.id}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("recipe-images")
    .upload(filename, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) throw new Error("Upload error: " + uploadError.message);

  // 4. Get permanent public URL
  const { data: urlData } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(filename);

  const permanentUrl = urlData.publicUrl;

  // 5. Save to database
  const { error: updateError } = await supabase
    .from("recipes")
    .update({ image_url: permanentUrl })
    .eq("id", recipe.id);

  if (updateError) throw new Error("DB update error: " + updateError.message);

  return permanentUrl;
}

async function main() {
  const TEST_LIMIT = 5; // Test with 5 first

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, ai_score")
    .order("created_at", { ascending: false })
    .limit(TEST_LIMIT);

  if (error) { console.error("Supabase error:", error); process.exit(1); }

  console.log(`🎨 Test: generating ${recipes.length} images with permanent storage...\n`);

  let done = 0;
  for (const recipe of recipes) {
    process.stdout.write(`[${done + 1}/${recipes.length}] ${recipe.title.slice(0, 50)}... `);
    try {
      const url = await generateAndUpload(recipe);
      done++;
      console.log(`✅ ${url.slice(0, 60)}...`);
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
    if (done < recipes.length) await sleep(13000);
  }

  console.log(`\n✅ Done! ${done} images permanently stored.`);
  console.log(`Check culirated.com to see them live.`);
}

main();
