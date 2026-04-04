import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY!;

// Zernio account IDs per platform
const PLATFORMS = [
  { platform: "instagram", accountId: "69d0e9ce3343e779922ed7e0" },
  { platform: "pinterest", accountId: "69d0e9853343e779922ed704" },
  { platform: "tiktok",    accountId: "69d0e9e13343e779922ed81f" },
  { platform: "youtube",   accountId: "69d0eb1b3343e779922edcb0" },
];

export async function GET(request: Request) {
  try {
    // Verify cron request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Haal het meest recente goedgekeurde recept op dat nog niet gepost is
    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("id, title, description, image_url, slug")
      .eq("status", "approved")
      .is("posted_to_social", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !recipe) {
      console.log("Geen nieuw recept om te posten:", error?.message);
      return NextResponse.json({ message: "Geen nieuw recept gevonden" });
    }

    // Bouw de caption op
    const recipeUrl = `https://culirated.com/recept/en/${recipe.slug}`;
    const caption = `${recipe.title} 🍽️\n\n${recipe.description?.slice(0, 150)}...\n\n🌍 Full recipe: ${recipeUrl}\n\n#recipe #food #cooking #culirated #airecipe`;

    // Post naar alle platforms via Zernio
    const results = [];
    for (const { platform, accountId } of PLATFORMS) {
      try {
        const body: Record<string, unknown> = {
          platforms: [{ platform, accountId }],
          content: caption,
        };

        // Voeg afbeelding toe als die beschikbaar is
        if (recipe.image_url) {
          body.mediaItems = [{ type: "image", url: recipe.image_url }];
        }

        const response = await fetch("https://zernio.com/api/v1/posts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ZERNIO_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const result = await response.json();
        results.push({ platform, success: response.ok, result });

        if (!response.ok) {
          console.error(`Fout bij ${platform}:`, result);
        }
      } catch (platformError) {
        console.error(`Fout bij ${platform}:`, platformError);
        results.push({ platform, success: false, error: String(platformError) });
      }
    }

    // Markeer recept als gepost in Supabase
    const anySuccess = results.some((r) => r.success);
    if (anySuccess) {
      await supabase
        .from("recipes")
        .update({ posted_to_social: new Date().toISOString() })
        .eq("id", recipe.id);
    }

    console.log(`Gepost: ${recipe.title}`, results);
    return NextResponse.json({
      message: `Gepost: ${recipe.title}`,
      results,
    });

  } catch (error) {
    console.error("Social posting cron fout:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
