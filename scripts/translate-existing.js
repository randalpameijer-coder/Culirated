const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
const envFile = fs.readFileSync(envPath, "utf8");
envFile.split("\n").forEach(line => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing env vars"); process.exit(1);
}

const LANG_BATCHES = [
  ["nl", "de", "fr", "es", "it"],
  ["pt", "pl", "ru", "tr", "sv"],
  ["da", "no", "hi", "id", "th"],
  ["ja", "zh", "ko", "ar"],
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[ñ]/g, "n").replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

async function supabaseGet(p) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${p}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Supabase GET ${res.status}: ${t}`); }
  return res.json();
}

async function supabasePatch(p, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${p}`, {
    method: "PATCH",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Supabase PATCH ${res.status}: ${t}`); }
}

async function supabaseDelete(p) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${p}`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=minimal",
    },
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Supabase DELETE ${res.status}: ${t}`); }
}

async function supabaseInsert(p, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${p}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Supabase POST ${res.status}: ${t}`); }
}

async function translateBatch(recipe, languages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `Translate this recipe from English into: ${languages.join(", ")}

Title: ${recipe.title}
Description: ${recipe.description || ""}
Ingredients: ${JSON.stringify(recipe.ingredients || [])}
Steps: ${JSON.stringify(recipe.steps || [])}

Slug = translated title lowercase with hyphens. Non-Latin scripts keep native script.

Respond ONLY with JSON array:
[{"lang":"nl","title":"...","description":"...","ingredients":[...],"steps":[...],"slug":"..."}]

Natural translation, keep quantities, ${languages.length} languages, pure JSON only`
      }]
    })
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  const raw = data.content[0].text.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function main() {
  console.log("🌍 Culirated — Translation Migration\n");

  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/recipes?select=id&status=eq.approved&slug=is.null`,
    {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "count=exact",
        "Range": "0-0",
      }
    }
  );
  const total = parseInt((countRes.headers.get("content-range") || "0/0").split("/")[1]);
  console.log(`📊 To migrate: ${total}\n`);

  let processed = 0, succeeded = 0, failed = 0;

  while (true) {
    const recipes = await supabaseGet(
      `/recipes?select=id,title,description,ingredients,steps&status=eq.approved&slug=is.null&limit=1`
    );
    if (!recipes || recipes.length === 0) { console.log("\n✅ Done!"); break; }

    const recipe = recipes[0];
    processed++;
    process.stdout.write(`[${processed}/${total}] "${recipe.title}" ... `);

    try {
      const enSlug = generateSlug(recipe.title);

      // Save slug immediately
      await supabasePatch(`/recipes?id=eq.${recipe.id}`, { slug: enSlug });

      // 4 sequential translation calls of ~5 languages each
      const allTranslations = [];
      for (const batch of LANG_BATCHES) {
        const result = await translateBatch(recipe, batch);
        allTranslations.push(...result);
        await new Promise(r => setTimeout(r, 200));
      }

      const rows = [
        {
          recipe_id: recipe.id, lang: "en",
          title: recipe.title, description: recipe.description || "",
          ingredients: recipe.ingredients || [], steps: recipe.steps || [],
          slug: enSlug,
        },
        ...allTranslations.map(t => ({
          recipe_id: recipe.id, lang: t.lang,
          title: t.title, description: t.description,
          ingredients: t.ingredients, steps: t.steps,
          slug: t.slug || generateSlug(t.title),
        })),
      ];

      // Delete existing then insert fresh
      await supabaseDelete(`/recipe_translations?recipe_id=eq.${recipe.id}`);
      await supabaseInsert(`/recipe_translations`, rows);

      console.log(`✅ ${rows.length} languages`);
      succeeded++;
      await new Promise(r => setTimeout(r, 300));

    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
      // Reset slug for retry
      await supabasePatch(`/recipes?id=eq.${recipe.id}`, { slug: null });
    }
  }

  console.log(`\n✅ Succeeded: ${succeeded} | ❌ Failed: ${failed} | 📊 Total: ${processed}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
