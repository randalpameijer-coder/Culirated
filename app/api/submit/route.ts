import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data[0].embedding;
  } catch { return null; }
}

async function checkDuplicate(embedding: number[]): Promise<{ isDuplicate: boolean; similarTitle?: string }> {
  try {
    const { data } = await supabase.rpc("match_recipes", {
      query_embedding: embedding,
      match_threshold: 0.85,
      match_count: 1,
    });
    if (data && data.length > 0) {
      return { isDuplicate: true, similarTitle: data[0].title };
    }
    return { isDuplicate: false };
  } catch { return { isDuplicate: false }; }
}

async function generateImage(title: string, cuisine: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Professional food photography of ${title}. ${cuisine ? cuisine + " cuisine." : ""} Shot on a clean white or natural wood surface, soft natural lighting, shallow depth of field, appetizing, magazine quality. No text, no watermarks.`,
        n: 1, size: "1024x1024", quality: "standard",
      }),
    });
    if (!res.ok) return null;
    const tempUrl = (await res.json()).data[0].url;
    const imgRes = await fetch(tempUrl);
    if (!imgRes.ok) return null;
    const buffer = await imgRes.arrayBuffer();
    const filename = `${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("recipe-images").upload(filename, buffer, { contentType: "image/jpeg", upsert: true });
    if (error) return null;
    return supabase.storage.from("recipe-images").getPublicUrl(filename).data.publicUrl;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, recipe, confirm, lang } = body;
  const language = lang?.startsWith("nl") ? "Dutch" : lang?.startsWith("de") ? "German" : lang?.startsWith("fr") ? "French" : "English";
  if (!name || !recipe) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Step 2: confirmed — save + generate image
  if (confirm) {
    const imageUrl = await generateImage(body.confirmedTitle, body.cuisine || "");
    const { data: inserted, error } = await supabase.from("recipes").insert({
      title: body.confirmedTitle,
      description: body.confirmedDescription || "",
      ingredients: body.confirmedIngredients || [],
      steps: body.confirmedSteps || [],
      prep_time: body.prep_time,
      servings: body.servings,
      calories: body.calories,
      difficulty: body.difficulty,
      status: "approved",
      image_url: imageUrl,
      ai_score: body.ai_score,
      author_name: name,
    }).select("id").single();
    if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });

    // Save embedding for future duplicate checks
    const embeddingText = `${body.confirmedTitle} ${(body.confirmedIngredients || []).join(" ")}`;
    const embedding = await generateEmbedding(embeddingText);
    if (embedding) {
      await supabase.from("recipes").update({ embedding }).eq("id", inserted.id);
    }

    return NextResponse.json({ saved: true, id: inserted.id, imageUrl });
  }

  // Step 1: get similar titles via embedding for Claude to evaluate
  const embeddingText = recipe.slice(0, 500);
  const embedding = await generateEmbedding(embeddingText);
  let similarTitles: string[] = [];
  if (embedding) {
    const { data } = await supabase.rpc("match_recipes", {
      query_embedding: embedding,
      match_threshold: 0.75,
      match_count: 5,
    });
    if (data) similarTitles = data.map((r: any) => r.title);
  }

  // Step 1: analyse (Claude also judges duplicates)
  const similarContext = similarTitles.length > 0
    ? `\n\nIMPORTANT: These similar recipes already exist in the database:\n${similarTitles.map(t => `- ${t}`).join("\n")}\nIf the submitted recipe is essentially the same dish (even with minor variations like different toppings or small ingredient swaps), mark it as a duplicate.`
    : "";

  const prompt = `You are a strict but helpful recipe quality checker for Culirated.
User "${name}" submitted:
---
${recipe}
---${similarContext}
IMPORTANT: Always respond in ${language}. All feedback, comments and messages must be in ${language}.
Return ONLY valid JSON, no markdown:
{
  "approved": true/false,
  "score": 0-100,
  "feedback": "1-2 friendly sentences",
  "duplicate": true/false,
  "duplicate_of": "title of the existing recipe if duplicate, empty string otherwise",
  "criteria": [
    {"name":"Completeness","passed":true/false,"comment":""},
    {"name":"Ratios","passed":true/false,"comment":""},
    {"name":"Logic","passed":true/false,"comment":""},
    {"name":"Prep time","passed":true/false,"comment":""},
    {"name":"SEO quality","passed":true/false,"comment":""}
  ],
  "suggestions": {
    "title": {"original":"","improved":"","changed":true/false},
    "description": {"improved":"max 160 chars SEO description"}
  },
  "corrections": {
    "ratios_fixed": true/false,
    "prep_time_fixed": true/false,
    "original_prep_time": "what the user submitted, empty if not fixed",
    "corrected_prep_time": number in minutes if fixed, null otherwise,
    "what_was_fixed": "clear friendly explanation of what was corrected and why, empty string if nothing",
    "ingredients": ["corrected list — ONLY fix mathematical quantity errors (e.g. '50kg salt' → '50g salt'). NEVER add new ingredients. NEVER remove ingredients. Keep exact author wording."],
    "steps": ["corrected steps — ONLY fix logical/impossible errors. NEVER add new steps. Keep author voice exactly."]
  },
  "meta": {
    "title": "clean title",
    "cuisine": "Italian/Mexican/Asian/Indian/Thai/Chinese/Japanese/Greek/Middle Eastern/French/American/Mediterranean",
    "course": "Breakfast/Lunch/Dinner/Appetizer/Side dish/Dessert/Snack",
    "diet": [],
    "method": "Air fryer/Slow cooker/Sheet pan/BBQ & Grill/One pot/No-cook",
    "time_category": "Under 20 min/Under 30 min/Under 1 hour/Weekend project",
    "main_ingredient": "Chicken/Beef/Fish & seafood/Pasta/Rice/Eggs/Vegetables/Legumes/Pork",
    "prep_time": 0,
    "servings": 0,
    "calories": null,
    "difficulty": "easy/medium/advanced"
  }
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = (message.content[0] as any).text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(text);

    // If Claude says it's a duplicate, override approval
    if (result.duplicate) {
      result.approved = false;
      const dupMsg: Record<string, string> = {
        Dutch: `Dit recept staat al op Culirated. Heb je iets anders te delen?`,
        German: `Dieses Rezept existiert bereits auf Culirated. Hast du etwas anderes anzubieten?`,
        French: `Cette recette existe déjà sur Culirated. Avez-vous quelque chose d'autre à partager?`,
        English: `This recipe already exists on Culirated. Do you have something else to share?`,
      };
      result.feedback = dupMsg[language] || dupMsg.English;
      if (!result.criteria) result.criteria = [];
      result.criteria.unshift({ name: "Duplicate check", passed: false, comment: `Too similar to existing recipe: "${result.duplicate_of}"` });
    }

    return NextResponse.json({ ...result, ai_score: { score: result.score, ...result.meta } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ approved: false, feedback: "Something went wrong. Please try again." }, { status: 500 });
  }
}
