import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max per Vercel Pro

const LANGUAGES = [
  { code: "nl", recipeWord: "recept" },
  { code: "de", recipeWord: "rezept" },
  { code: "fr", recipeWord: "recette" },
  { code: "es", recipeWord: "receta" },
  { code: "it", recipeWord: "ricetta" },
  { code: "pt", recipeWord: "receita" },
  { code: "pl", recipeWord: "przepis" },
  { code: "ru", recipeWord: "рецепт" },
  { code: "ja", recipeWord: "レシピ" },
  { code: "zh", recipeWord: "食谱" },
  { code: "ko", recipeWord: "레시피" },
  { code: "ar", recipeWord: "وصفة" },
  { code: "tr", recipeWord: "tarif" },
  { code: "sv", recipeWord: "recept" },
  { code: "da", recipeWord: "opskrift" },
  { code: "no", recipeWord: "oppskrift" },
  { code: "hi", recipeWord: "नुस्खा" },
  { code: "id", recipeWord: "resep" },
  { code: "th", recipeWord: "สูตร" },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function translateRecipe(
  anthropic: Anthropic,
  recipe: { title: string; description: string; ingredients: string[]; steps: string[] }
): Promise<Array<{ lang: string; title: string; description: string; ingredients: string[]; steps: string[]; slug: string }>> {
  const langList = LANGUAGES.map(l => l.code).join(", ");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [{ role: "user", content: `Translate this recipe from English into these languages: ${langList}

Title: ${recipe.title}
Description: ${recipe.description}
Ingredients: ${JSON.stringify(recipe.ingredients)}
Steps: ${JSON.stringify(recipe.steps)}

For each language also provide a slug: the translated title in lowercase with spaces as hyphens. For non-Latin scripts (Japanese, Chinese, Arabic, Hindi, Thai, Korean, Russian) keep the native script in the slug.

Respond ONLY with a valid JSON array, no markdown:
[
  {
    "lang": "nl",
    "title": "Dutch title",
    "description": "Dutch description",
    "ingredients": ["Dutch ingredient 1"],
    "steps": ["Dutch step 1"],
    "slug": "dutch-title-as-slug"
  }
]

Rules:
- Translate naturally and fluently
- Keep quantities and numbers unchanged
- Keep brand names unchanged
- Include all ${LANGUAGES.length} languages
- Pure JSON only` }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional: process in batches via ?batch=0, ?batch=1 etc (20 recipes per batch)
  const url = new URL(request.url);
  const batch = parseInt(url.searchParams.get("batch") || "0");
  const batchSize = parseInt(url.searchParams.get("size") || "3");
  const from = batch * batchSize;
  const to = from + batchSize - 1;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  // Fetch recipes without slug (not yet migrated)
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, description, ingredients, steps")
    .eq("status", "approved")
    .is("slug", null)
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!recipes || recipes.length === 0) {
    return NextResponse.json({ done: true, message: "All recipes already migrated" });
  }

  const results: { id: string; title: string; slug: string; translations: number; error?: string }[] = [];

  for (const recipe of recipes) {
    try {
      const enSlug = generateSlug(recipe.title);

      // Save slug to recipes table
      await supabase
        .from("recipes")
        .update({ slug: enSlug })
        .eq("id", recipe.id);

      // Generate translations
      const translations = await translateRecipe(anthropic, {
        title: recipe.title,
        description: recipe.description || "",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        steps: Array.isArray(recipe.steps) ? recipe.steps : [],
      });

      // Build translation rows including English
      const translationRows = [
        {
          recipe_id:   recipe.id,
          lang:        "en",
          title:       recipe.title,
          description: recipe.description || "",
          ingredients: recipe.ingredients || [],
          steps:       recipe.steps || [],
          slug:        enSlug,
        },
        ...translations.map(t => ({
          recipe_id:   recipe.id,
          lang:        t.lang,
          title:       t.title,
          description: t.description,
          ingredients: t.ingredients,
          steps:       t.steps,
          slug:        t.slug || generateSlug(t.title),
        })),
      ];

      // Insert translations (skip if already exists for this recipe)
      await supabase
        .from("recipe_translations")
        .upsert(translationRows, { onConflict: "recipe_id,lang" });

      results.push({ id: recipe.id, title: recipe.title, slug: enSlug, translations: translationRows.length });

    } catch (err) {
      results.push({ id: recipe.id, title: recipe.title, slug: "", translations: 0, error: String(err) });
    }
  }

  const remaining = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .is("slug", null);

  return NextResponse.json({
    batch,
    processed: results.length,
    succeeded: results.filter(r => !r.error).length,
    failed: results.filter(r => r.error).length,
    remaining: remaining.count || 0,
    next_batch: (remaining.count || 0) > 0 ? batch + 1 : null,
    results,
  });
}
