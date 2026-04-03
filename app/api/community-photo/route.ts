import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

async function isFoodPhoto(imageBuffer: ArrayBuffer, mimeType: string): Promise<{ ok: boolean; reason: string }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const base64 = Buffer.from(imageBuffer).toString("base64");

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: mimeType as "image/jpeg" | "image/png" | "image/webp", data: base64 },
        },
        {
          type: "text",
          text: `Does this image show food, a dish, a meal, ingredients, or someone cooking? Answer with JSON only: {"food": true, "reason": "short reason"}. If it contains anything inappropriate, offensive or unrelated to food, answer {"food": false, "reason": "short reason"}.`,
        },
      ],
    }],
  });

  const text = (response.content[0] as { type: string; text: string }).text.trim();
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  return { ok: parsed.food === true, reason: parsed.reason || "" };
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const recipeId = formData.get("recipe_id") as string;
    const name = (formData.get("name") as string || "").trim().slice(0, 80);
    const tip = (formData.get("tip") as string || "").trim().slice(0, 300);

    if (!file || !recipeId) {
      return NextResponse.json({ error: "Missing photo or recipe_id" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG or WebP." }, { status: 400 });
    }

    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 8MB." }, { status: 400 });
    }

    // Read buffer once — used for both AI check and storage upload
    const buffer = await file.arrayBuffer();

    // AI food check FIRST — before touching Storage
    try {
      const foodCheck = await isFoodPhoto(buffer, file.type as "image/jpeg" | "image/png" | "image/webp");
      if (!foodCheck.ok) {
        return NextResponse.json({ error: "Only food photos are allowed. Please upload a photo of your dish." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Could not verify photo. Please try again." }, { status: 500 });
    }

    // Upload to Supabase Storage
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `community-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("recipe-images")
      .upload(`community/${filename}`, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError || !storageData) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(storageData.path);

    const photoUrl = publicData.publicUrl;

    // Save to community_photos table
    const { data: saved, error: dbError } = await supabase
      .from("community_photos")
      .insert({
        recipe_id: recipeId,
        photo_url: photoUrl,
        name: name || null,
        tip: tip || null,
      })
      .select("id, photo_url, name, tip, created_at")
      .single();

    if (dbError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, photo: saved });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
