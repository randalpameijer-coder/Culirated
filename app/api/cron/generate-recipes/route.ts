import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { label: "Breakfast",       searchTerm: "trending breakfast recipes",           cuisine: null,          diet: null,            method: null,          time: null,           course: "Breakfast"  },
  { label: "Quick & Easy",    searchTerm: "quick easy dinner recipes",            cuisine: null,          diet: null,            method: null,          time: "Under 20 min", course: null         },
  { label: "Vegetarian",      searchTerm: "trending vegetarian recipes",          cuisine: null,          diet: "Vegetarian",    method: null,          time: null,           course: null         },
  { label: "Italian",         searchTerm: "trending Italian food recipes",        cuisine: "Italian",     diet: null,            method: null,          time: null,           course: null         },
  { label: "Asian",           searchTerm: "trending Asian recipes",               cuisine: "Asian",       diet: null,            method: null,          time: null,           course: null         },
  { label: "BBQ & Grill",     searchTerm: "trending BBQ grill recipes",           cuisine: null,          diet: null,            method: "BBQ & Grill", time: null,           course: null         },
  { label: "Vegan",           searchTerm: "trending vegan recipes",               cuisine: null,          diet: "Vegan",         method: null,          time: null,           course: null         },
  { label: "Gluten-free",     searchTerm: "trending gluten free recipes",         cuisine: null,          diet: "Gluten-free",   method: null,          time: null,           course: null         },
  { label: "Mexican",         searchTerm: "trending Mexican food recipes",        cuisine: "Mexican",     diet: null,            method: null,          time: null,           course: null         },
  { label: "Mediterranean",   searchTerm: "trending Mediterranean diet recipes",  cuisine: "Mediterranean", diet: null,          method: null,          time: null,           course: null         },
  { label: "Indian",          searchTerm: "trending Indian curry recipes",        cuisine: "Indian",      diet: null,            method: null,          time: null,           course: null         },
  { label: "Dessert",         searchTerm: "trending dessert recipes",             cuisine: null,          diet: null,            method: null,          time: null,           course: "Dessert"    },
  { label: "Soup",            searchTerm: "trending soup recipes",                cuisine: null,          diet: null,            method: null,          time: null,           course: null         },
  { label: "High-protein",    searchTerm: "trending high protein meal recipes",   cuisine: null,          diet: "High-protein",  method: null,          time: null,           course: null         },
  { label: "One pot",         searchTerm: "trending one pot dinner recipes",      cuisine: null,          diet: null,            method: "One pot",     time: null,           course: null         },
  { label: "Air fryer",       searchTerm: "trending air fryer recipes",           cuisine: null,          diet: null,            method: "Air fryer",   time: null,           course: null         },
  { label: "Greek",           searchTerm: "trending Greek food recipes",          cuisine: "Greek",       diet: null,            method: null,          time: null,           course: null         },
  { label: "Japanese",        searchTerm: "trending Japanese food recipes",       cuisine: "Japanese",    diet: null,            method: null,          time: null,           course: null         },
  { label: "Lunch",           searchTerm: "trending healthy lunch recipes",       cuisine: null,          diet: null,            method: null,          time: null,           course: "Lunch"      },
  { label: "Dairy-free",      searchTerm: "trending dairy free recipes",          cuisine: null,          diet: "Dairy-free",    method: null,          time: null,           course: null         },
  { label: "Middle Eastern",  searchTerm: "trending Middle Eastern recipes",      cuisine: "Middle Eastern", diet: null,         method: null,          time: null,           course: null         },
  { label: "French",          searchTerm: "trending French cuisine recipes",      cuisine: "French",      diet: null,            method: null,          time: null,           course: null         },
  { label: "Sheet pan",       searchTerm: "trending sheet pan dinner recipes",    cuisine: null,          diet: null,            method: "Sheet pan",   time: null,           course: null         },
  { label: "Low-carb",        searchTerm: "trending low carb keto recipes",       cuisine: null,          diet: "Low-carb",      method: null,          time: null,           course: null         },
];

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

function getSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5)  return "spring";
  if (month >= 6 && month <= 8)  return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

const month = new Date().toLocaleString("en", { month: "long" });
const year  = new Date().getFullYear();

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

async function getTrendingConcept(
  anthropic: Anthropic,
  category: typeof CATEGORIES[0],
  season: string,
  excludeTitles: string[],
  attempt: number
): Promise<string> {
  const excludeClause = excludeTitles.length > 0
    ? `Do NOT suggest any of these (already in database): ${excludeTitles.join(", ")}.`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 500,
    tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
    messages: [{
      role: "user",
      content: `Search for: trending ${category.searchTerm} ${month} ${year}

Based on the search results, suggest ONE specific trending recipe name/concept for the category "${category.label}" that fits the ${season} season.
${excludeClause}
${attempt > 1 ? "Try a completely different angle than before." : ""}

Reply with ONLY the recipe name, nothing else. Example: "Crispy Smash Burger" or "Miso Glazed Aubergine"`
    }],
  });

  const textBlock = response.content.find((b: { type: string }) => b.type === "text") as { type: string; text: string } | undefined;
  return textBlock?.text?.trim() || `${season} ${category.label} recipe`;
}

async function existsInDatabase(supabase: any, concept: string): Promise<boolean> {
  const { data } = await supabase
    .from("recipes")
    .select("id, title")
    .ilike("title", `%${concept.split(" ").slice(0, 3).join("%")}%`)
    .limit(1);
  return data && data.length > 0;
}

async function generateRecipe(
  anthropic: Anthropic,
  category: typeof CATEGORIES[0],
  season: string,
  concept: string
): Promise<any> {
  const constraints = [
    category.cuisine && `Cuisine: ${category.cuisine}`,
    category.diet    && `Diet: ${category.diet}`,
    category.method  && `Method: ${category.method}`,
    category.time    && `Ready in: ${category.time}`,
  ].filter(Boolean).join(", ");

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: `You are a professional chef creating a recipe for a global recipe platform.

Create a complete, publishable recipe based on this trending concept: "${concept}"
Category: ${category.label}
${constraints ? `Requirements: ${constraints}` : ""}
Season: ${season}

Content rules:
- Only use ingredients that are widely available in supermarkets
- All meat and fish must be cooked to safe internal temperatures
- No extreme diets, detoxes, or medically-claimed recipes
- No exotic or legally restricted ingredients
- Portions must be realistic for the stated number of servings
- Prep time must be realistic and achievable

Respond ONLY with valid JSON, no markdown:
{
  "title": "Specific SEO-friendly recipe title",
  "description": "2-sentence appetising description",
  "servings": 4,
  "prep_time": 25,
  "calories": 380,
  "difficulty": "Easy",
  "cuisine": "Italian",
  "course": "Dinner",
  "diet": ["Vegetarian"],
  "season": "${season}",
  "ingredients": ["200g pasta", "2 cloves garlic, minced"],
  "steps": ["Boil salted water and cook pasta until al dente.", "Step two."]
}

Rules:
- difficulty: exactly "Easy", "Medium" or "Advanced"
- diet: only include labels that are genuinely true for this recipe
- steps: must include safe cooking temperatures for meat/fish (e.g. "cook until internal temperature reaches 75°C")
- No markdown, pure JSON only` }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function checkRecipe(
  anthropic: Anthropic,
  recipe: any,
  category: typeof CATEGORIES[0]
): Promise<{ score: number; approved: boolean; duplicate: boolean; notes: string; flags: string[] }> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 500,
    system: "You are a strict, independent food safety and quality reviewer. You have no knowledge of who created the recipe you are reviewing. Your only job is to protect the platform's users and reputation by ensuring only safe, complete and high-quality recipes are published.",
    messages: [{ role: "user", content: `You are a strict food safety and quality reviewer for a recipe platform. You did NOT write this recipe.

Recipe to review:
${JSON.stringify(recipe, null, 2)}

Category: ${category.label}
${category.diet ? `Must be: ${category.diet}` : ""}
${category.time ? `Must be ready in: ${category.time}` : ""}

Evaluate strictly — 80+ means safe to publish:
1. COMPLETENESS — All ingredients with quantities? All steps present?
2. RATIOS — Quantities realistic for ${recipe.servings || 4} servings?
3. LOGIC — Logical cooking order? Correct techniques?
4. PREP TIME — Is ${recipe.prep_time} min actually achievable?
5. FOOD SAFETY — Safe temperatures for meat/fish? No dangerous techniques?
6. DIET ACCURACY — Diet labels genuinely correct based on ingredients?
7. AVAILABILITY — All ingredients in a standard European supermarket?
8. DUPLICATE — Completely generic with no interesting angle?

Respond ONLY with valid JSON:
{
  "score": 87,
  "approved": true,
  "duplicate": false,
  "flags": [],
  "notes": "Well-balanced recipe with clear steps."
}` }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

const LANG_BATCHES = [
  ["nl"], ["de"], ["fr"], ["es"],
  ["it"], ["pt"], ["pl"], ["ru"],
  ["ja"], ["zh"], ["ko"], ["ar"],
  ["tr"], ["sv"], ["da"], ["no"],
  ["hi"], ["id"], ["th"],
];

async function generateTranslations(
  anthropic: Anthropic,
  recipe: any
): Promise<Array<{ lang: string; title: string; description: string; ingredients: string[]; steps: string[]; slug: string }>> {
  const allTranslations: Array<{ lang: string; title: string; description: string; ingredients: string[]; steps: string[]; slug: string }> = [];

  for (const langs of LANG_BATCHES) {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 6000,
      messages: [{ role: "user", content: `Translate this recipe from English into: ${langs.join(", ")}

Title: ${recipe.title}
Description: ${recipe.description}
Ingredients: ${JSON.stringify(recipe.ingredients)}
Steps: ${JSON.stringify(recipe.steps)}

Respond ONLY with a valid JSON array, no markdown:
[{"lang":"nl","title":"...","description":"...","ingredients":["..."],"steps":["..."],"slug":"..."}]
Slug = translated title, lowercase, hyphens. Non-Latin scripts: keep native characters.` }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const batch = JSON.parse(cleaned);
    allTranslations.push(...batch);
    await new Promise(r => setTimeout(r, 500));
  }

  return allTranslations;
}

async function generateImage(openai: OpenAI, supabase: any, title: string, description: string): Promise<string | null> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional food photography of ${title}. ${description} Shot from above on a rustic wooden table, natural light, editorial food styling, warm tones. No text, no watermarks.`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) return null;

    const imgRes = await fetch(imageUrl);
    const buffer = await imgRes.arrayBuffer();
    const filename = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

    const { data, error } = await supabase.storage
      .from("recipe-images")
      .upload(filename, buffer, { contentType: "image/png", upsert: false });

    if (error || !data) return null;

    const { data: publicData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const season = getSeason();
  const results: { category: string; id?: string; title?: string; concept?: string; score?: number; flags?: string[]; translations?: number; error?: string }[] = [];

  // Selecteer één categorie via ?cat= parameter
  const url = new URL(request.url);
  const catIndex = parseInt(url.searchParams.get("cat") || "0");
  const categoriesToProcess = catIndex >= 0 && catIndex < CATEGORIES.length
    ? [CATEGORIES[catIndex]]
    : CATEGORIES;

  for (const category of categoriesToProcess) {
    let published = false;
    const excludeTitles: string[] = [];

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Step 1: Trending concept
        const concept = await getTrendingConcept(anthropic, category, season, excludeTitles, attempt);

        // Step 2: Database check
        const alreadyExists = await existsInDatabase(supabase, concept);
        if (alreadyExists) {
          excludeTitles.push(concept);
          continue;
        }

        // Step 3: Generate recipe
        const recipe = await generateRecipe(anthropic, category, season, concept);

        // Step 4: Independent quality check
        const check = await checkRecipe(anthropic, recipe, category);
        if (!check.approved || check.score < 80 || check.duplicate) {
          excludeTitles.push(concept);
          continue;
        }

        // Step 5: Generate image
        const imageUrl = await generateImage(openai, supabase, recipe.title, recipe.description);

        // Step 6: Save recipe with slug
        const enSlug = generateSlug(recipe.title);

        // Bepaal difficulty op basis van ingrediënten en stappen
        const nIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;
        const nSteps = Array.isArray(recipe.steps) ? recipe.steps.length : 0;
        const difficulty = nIngredients <= 10 && nSteps <= 8 ? "Easy"
          : nIngredients <= 13 && nSteps <= 10 ? "Medium"
          : "Advanced";

        const aiScoreData = {
          score:           check.score,
          completeness:    true,
          ratios_ok:       true,
          logic_ok:        true,
          time_ok:         true,
          seo_ok:          true,
          duplicate:       false,
          notes:           check.notes,
          flags:           check.flags,
          cuisine:         recipe.cuisine  || category.cuisine  || null,
          course:          recipe.course   || category.course   || null,
          diet:            recipe.diet     || (category.diet ? [category.diet] : []),
          method:          recipe.method   || category.method   || null,
          time:            recipe.time     || category.time     || null,
          season:          recipe.season   || null,
          difficulty,
          is_ai_generated: true,
        };

        const { data: saved, error } = await supabase
          .from("recipes")
          .insert({
            title:              recipe.title,
            description:        recipe.description,
            servings:           recipe.servings,
            prep_time:          recipe.prep_time,
            calories:           recipe.calories,
            difficulty:         recipe.difficulty,
            ingredients:        recipe.ingredients,
            steps:              recipe.steps,
            status:             "approved",
            author_name:        "AI",
            image_url:          imageUrl,
            ai_score:           aiScoreData,
            slug:               enSlug,
            reactions_want:     0,
            reactions_made:     0,
            reactions_favorite: 0,
          })
          .select("id")
          .single();

        if (error) throw new Error(error.message);

        // Step 7: Generate and save translations
        const translations = await generateTranslations(anthropic, recipe);

        const translationRows = [
          { recipe_id: saved.id, lang: "en", title: recipe.title, description: recipe.description, ingredients: recipe.ingredients, steps: recipe.steps, slug: enSlug },
          ...translations.map(t => ({
            recipe_id:   saved.id,
            lang:        t.lang,
            title:       t.title,
            description: t.description,
            ingredients: t.ingredients,
            steps:       t.steps,
            slug:        t.slug || generateSlug(t.title),
          })),
        ];

        await supabase.from("recipe_translations").insert(translationRows);

        results.push({
          category: category.label,
          id: saved.id,
          title: recipe.title,
          concept,
          score: check.score,
          flags: check.flags,
          translations: translationRows.length,
        });
        published = true;
        break;

      } catch (err) {
        if (attempt === 3) {
          results.push({ category: category.label, error: String(err) });
        }
      }
    }

    if (!published && !results.find(r => r.category === category.label)) {
      results.push({ category: category.label, error: "Failed after 3 attempts" });
    }
  }

  return NextResponse.json({
    date:      new Date().toISOString(),
    season,
    published: results.filter(r => r.id).length,
    failed:    results.filter(r => r.error).length,
    results,
  });
}
