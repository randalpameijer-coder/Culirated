# Culirated — Filter & Receptenpagina Architectuur

## App directory structuur (actieve routes)

```
app/
  page.tsx                          — Homepage
  recept/[lang]/[slug]/
    page.tsx                        — Receptpagina (SSR, server component)
    RecipePageClient.tsx            — Client component voor interactie
  recipe/[id]/page.tsx              — Legacy route (nog actief, links vanuit /recipes)
  recipes/page.tsx                  — Receptenlijst met accordion filters
  recipes/[type]/[value]/page.tsx   — Gefilterde receptenpagina (via URL)
  [lang]/recept/[slug]/page.tsx     — REDIRECT naar /recept/[lang]/[slug]
```

**Verwijderd:** `app/RecipePageClient.tsx` (root) — was ongebruikte duplicate.

## Recipes pagina filters

### Sidebar accordion

5 filtergroepen met kleurcodering:
- **Diet** (groen #3B6D11) — Vegetarian, Vegan, Gluten-free, Dairy-free, High-protein, Low-carb, Keto, Pescatarian
- **Time** (blauw #185FA5) — < 15 min, < 30 min, < 45 min, < 1 hour, Weekend
- **Cuisine** (rood #993C1D) — Italian, Asian, Mexican, Indian, Mediterranean, Middle Eastern, French, Greek, Japanese, Chinese, Thai, American, Vietnamese, Korean, North African
- **Meal** (amber #854F0B) — Breakfast, Lunch, Dinner, Dessert, Snack, Salad, Starter, Side dish
- **Level** (paars #534AB7) — Easy, Medium, Advanced

### Filterlogica

- **Diet**: `ilike %Vegetarian%` op `ai_score->>diet` (jsonb array als string)
- **Time**: `prep_time.lte.N` op het prep_time veld
- **Cuisine**: `ilike %Italian%` op `ai_score->>cuisine` (matcht ook "Italian-American")
- **Meal**: `ilike %Dinner%` op `ai_score->>course`
- **Level**: `ilike Easy` op `ai_score->>difficulty`

### URL params

Filters worden meegegeven als URL params: `/recipes?cuisine=Italian&diet=Vegetarian`
Homepage categorie-kaartjes linken direct met filter: `/recipes?diet=Vegetarian`
Zoekbalk op homepage stuurt naar: `/recipes?q=searchterm`

### Taal op recipes pagina

```js
const [lang] = useState<string>(() => typeof window === "undefined" ? "en" : detectLang());
```

KRITIEK: Initialiseer lang DIRECT (niet via useEffect), anders is de eerste fetch altijd in het Engels.

De query haalt vertalingen op:
```js
.select("id, title, ..., recipe_translations!inner(slug, lang, title, description)")
.eq("recipe_translations.lang", lang || "en")
```

Toon vertaalde titel: `r.recipe_translations?.[0]?.title || r.title`

## Receptkaarten

Tonen: cuisine (rood) → difficulty (paars) → prep_time (groen) in die volgorde.
Onderaan: calories + AI approved badge.

## ai_score veld structuur

```json
{
  "score": 88,
  "cuisine": "Italian",
  "course": "Dinner",
  "diet": ["Vegetarian", "Gluten-free"],
  "method": "One pot",
  "difficulty": "Easy",
  "season": "spring",
  "is_ai_generated": true
}
```

**KRITIEK:** `difficulty` zit in `ai_score` jsonb, NIET als los veld. Filter op `ai_score->>difficulty`.

## Difficulty

Bepaald door AI (Haiku) op basis van ingrediënten en stappen:
- Easy: ≤10 ingrediënten én ≤8 stappen
- Medium: ≤13 ingrediënten én ≤10 stappen
- Advanced: alles daarboven

Bulk update script: `difficulty-ai.mjs` (éénmalig gedraaid april 2026).

Cron bepaalt difficulty automatisch bij generatie:
```js
const difficulty = nIngredients <= 10 && nSteps <= 8 ? "Easy"
  : nIngredients <= 13 && nSteps <= 10 ? "Medium"
  : "Advanced";
```

## Data kwaliteit issues (bekende inconsistenties)

- Diet labels: "Gluten-free" én "Gluten-Free" — filter werkt via ilike, geen probleem
- Course: "Side dish" én "Side Dish" — filter werkt via ilike
- Course: "Appetizer" én "Appetiser" — filter werkt via ilike
- Difficulty was "easy" (lowercase) of null — gefixed april 2026

## JSON-LD Schema (receptpagina)

Elk `HowToStep` heeft:
```json
{
  "@type": "HowToStep",
  "name": "Step 1",
  "text": "...",
  "url": "https://culirated.com/recept/en/slug#step-1"
}
```

`aggregateRating` verschijnt automatisch als `reactions_made > 0`.
`video` is bewust weggelaten — niet-kritiek per Google Search Console.

## Sitemap duplicate canonical fix

Probleem (april 2026): Google vond 12.340 dubbele pagina's door twee actieve routes.
- Oude route: `/[lang]/recept/[slug]` — omgezet naar redirect
- Nieuwe route: `/recept/[lang]/[slug]` — actief met correcte canonical

## Homepage categorieën

8 kaartjes met directe filterlinks:
```js
{ name: "Vegetarian", icon: "🥗", url: "/recipes?diet=Vegetarian" }
{ name: "Italian",    icon: "🍝", url: "/recipes?cuisine=Italian" }
// etc.
```

NAV_CATS (dropdown) gebruikt dezelfde 5 filtergroepen als de recipes sidebar.
