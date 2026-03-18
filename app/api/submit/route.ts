import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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
  const { name, recipe, confirm } = body;
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
    }).select("id").single();
    if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    return NextResponse.json({ saved: true, id: inserted.id, imageUrl });
  }

  // Step 1: analyse
  const prompt = `You are a strict but helpful recipe quality checker for Culirated.
User "${name}" submitted:
---
${recipe}
---
Return ONLY valid JSON, no markdown:
{
  "approved": true/false,
  "score": 0-100,
  "feedback": "1-2 friendly sentences",
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
    "what_was_fixed": "explanation or empty string",
    "ingredients": ["corrected list — only fix mathematical errors, keep author voice"],
    "steps": ["corrected steps — only fix logical errors, keep author voice"]
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
    return NextResponse.json({ ...result, ai_score: { score: result.score, ...result.meta } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ approved: false, feedback: "Something went wrong. Please try again." }, { status: 500 });
  }
}
