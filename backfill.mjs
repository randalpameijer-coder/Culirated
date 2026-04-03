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

// 1 taal per batch — meest betrouwbaar, geen truncatie
const LANG_BATCHES = [
  ["nl"], ["de"], ["fr"], ["es"],
  ["it"], ["pt"], ["pl"], ["ru"],
  ["ja"], ["zh"], ["ko"], ["ar"],
  ["tr"], ["sv"], ["da"], ["no"],
  ["hi"], ["id"], ["th"],
];

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i")
    .replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c")
    .replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,80);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function translateBatch(recipe, langs) {
  const shortIngredients = (recipe.ingredients || []).slice(0, 15);
  const shortSteps = (recipe.steps || []).slice(0, 8);

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 3000,
    messages: [{ role: "user", content: `Translate to ${langs.join(", ")}:
Title: ${recipe.title}
Description: ${(recipe.description || "").slice(0, 200)}
Ingredients: ${JSON.stringify(shortIngredients)}
Steps: ${JSON.stringify(shortSteps)}

JSON only, no markdown:
[{"lang":"nl","title":"...","description":"...","ingredients":["..."],"steps":["..."],"slug":"..."}]` }]
  });

  const raw = msg.content[0].text.trim().replace(/^```json\s*/i,"").replace(/```\s*$/i,"").trim();
  return JSON.parse(raw);
}

async function main() {
  // Haal automatisch alle onvertaalde recepten op
  const { data: untranslated, error } = await supabase.rpc("sql", {
    query: `
      select r.id, r.title, r.description, r.ingredients, r.steps
      from recipes r
      where r.status = 'approved'
      and not exists (
        select 1 from recipe_translations rt where rt.recipe_id = r.id
      )
    `
  });

  // Fallback als rpc niet werkt
  const { data: allRecipes } = await supabase
    .from("recipes")
    .select("id, title, description, ingredients, steps")
    .eq("status", "approved");

  const { data: translatedIds } = await supabase
    .from("recipe_translations")
    .select("recipe_id")
    .eq("lang", "en");

  const translatedSet = new Set((translatedIds || []).map(r => r.recipe_id));
  const recipes = (allRecipes || []).filter(r => !translatedSet.has(r.id));

  if (recipes.length === 0) {
    console.log("✅ Alle recepten zijn al vertaald.");
    return;
  }

  console.log(`🚀 Backfill — ${recipes.length} onvertaalde recepten gevonden\n`);

  let success = 0;
  let skipped = 0;

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    process.stdout.write(`[${i+1}/${recipes.length}] ${recipe.title.slice(0,50)}... `);

    const enSlug = generateSlug(recipe.title);
    const allRows = [{
      recipe_id: recipe.id, lang: "en",
      title: recipe.title, description: recipe.description || "",
      ingredients: recipe.ingredients || [], steps: recipe.steps || [],
      slug: enSlug,
    }];

    let allOk = true;

    for (const langs of LANG_BATCHES) {
      try {
        const translations = await translateBatch(recipe, langs);
        for (const t of translations) {
          allRows.push({
            recipe_id: recipe.id, lang: t.lang,
            title: t.title, description: t.description,
            ingredients: t.ingredients, steps: t.steps,
            slug: t.slug || generateSlug(t.title),
          });
        }
        await sleep(300);
      } catch(err) {
        console.log(`\n    ❌ ${langs.join(",")} fout: ${err.message.slice(0,80)}`);
        allOk = false;
        break;
      }
    }

    if (allOk) {
      await supabase.from("recipe_translations").upsert(allRows, { onConflict: "recipe_id,lang" });
      console.log(`✅ (${allRows.length} talen)`);
      success++;
    } else {
      console.log(`⏭️`);
      skipped++;
    }

    await sleep(800);
  }

  console.log(`\n✅ ${success} succesvol | ⏭️ ${skipped} overgeslagen`);
}

main().catch(console.error);
