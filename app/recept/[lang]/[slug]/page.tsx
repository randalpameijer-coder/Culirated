// FILE: app/recept/[lang]/[slug]/page.tsx
// SERVER COMPONENT — volledig SSR voor Google indexering + JSON-LD Recipe schema

import { Metadata } from "next";
import RecipePageClient from "./RecipePageClient";

const LANGS = ["en","nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getRecipeData(lang: string, slug: string) {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const transRes = await fetch(
      `${SUPABASE_URL}/rest/v1/recipe_translations?lang=eq.${lang}&slug=eq.${encodedSlug}&select=recipe_id,title,description,ingredients,steps,slug`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 3600 },
      }
    );
    const translations = await transRes.json();
    if (!translations?.length) return null;
    const translation = translations[0];

    const recipeRes = await fetch(
      `${SUPABASE_URL}/rest/v1/recipes?id=eq.${translation.recipe_id}&select=id,image_url,ai_score,prep_time,servings,calories,difficulty,reactions_want,reactions_made,reactions_favorite,created_at`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 3600 },
      }
    );
    const recipes = await recipeRes.json();
    if (!recipes?.length) return null;

    return { translation, recipe: recipes[0] };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = await getRecipeData(lang, slug);
  if (!data) {
    return { title: "Recipe not found — Culirated" };
  }
  const { translation, recipe } = data;

  const canonicalUrl = `https://culirated.com/recept/${lang}/${slug}`;

  const languages: Record<string, string> = {};
  LANGS.forEach((l) => {
    languages[l] = `https://culirated.com/recept/${l}/${slug}`;
  });
  languages["x-default"] = `https://culirated.com/recept/en/${slug}`;

  return {
    title: translation.title,
    description: translation.description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: translation.title,
      description: translation.description,
      url: canonicalUrl,
      siteName: "Culirated",
      images: recipe.image_url
        ? [
            {
              url: recipe.image_url,
              width: 1200,
              height: 630,
              alt: translation.title,
            },
          ]
        : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: translation.title,
      description: translation.description,
      images: recipe.image_url ? [recipe.image_url] : [],
    },
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const data = await getRecipeData(lang, slug);

  if (!data) {
    return (
      <div style={{ padding: "80px", textAlign: "center", fontFamily: "monospace", color: "#8a7355" }}>
        Recipe not found.
      </div>
    );
  }

  const { translation, recipe } = data;
  const ingredients = Array.isArray(translation.ingredients) ? translation.ingredients : [];
  const steps = Array.isArray(translation.steps) ? translation.steps : [];

  // JSON-LD Recipe schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: translation.title,
    description: translation.description,
    image: recipe.image_url ? [recipe.image_url] : [],
    author: {
      "@type": "Organization",
      name: "Culirated AI",
    },
    datePublished: recipe.created_at ? recipe.created_at.split("T")[0] : undefined,
    prepTime: recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
    cookTime: undefined,
    totalTime: recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    nutrition: recipe.calories
      ? {
          "@type": "NutritionInformation",
          calories: `${recipe.calories} calories`,
        }
      : undefined,
    recipeIngredient: ingredients,
    recipeInstructions: steps.map((step: string, i: number) => ({
      "@type": "HowToStep",
      name: `Step ${i + 1}`,
      text: step,
      url: `https://culirated.com/recept/${lang}/${slug}#step-${i + 1}`,
    })),
    aggregateRating:
      recipe.reactions_made > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Math.min(5, 3 + recipe.reactions_favorite / Math.max(1, recipe.reactions_made)).toFixed(1),
            reviewCount: recipe.reactions_made,
          }
        : undefined,
    recipeCategory: recipe.ai_score?.course || undefined,
    recipeCuisine: recipe.ai_score?.cuisine || undefined,
    keywords: [
      recipe.ai_score?.cuisine,
      recipe.ai_score?.course,
      recipe.ai_score?.method,
      ...(recipe.ai_score?.diet || []),
    ]
      .filter(Boolean)
      .join(", "),
  };

  // Remove undefined fields for clean JSON
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd) }}
      />
      <RecipePageClient
        lang={lang}
        slug={slug}
        initialTranslation={translation}
        initialRecipe={recipe}
      />
    </>
  );
}
