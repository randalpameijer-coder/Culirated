import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY!;

const PLATFORMS = [
  { platform: "instagram", accountId: "69d0e9ce3343e779922ed7e0", tiktokOnly: false },
  { platform: "pinterest", accountId: "69d0e9853343e779922ed704", tiktokOnly: false },
  { platform: "tiktok",    accountId: "69d0e9e13343e779922ed81f", tiktokOnly: true  },
];

// ── Caption templates (roteert op basis van uur) ──────────────────────────────
const CAPTION_TEMPLATES = [
  (title: string, desc: string, url: string) =>
    `${title} 👇\n\n${desc}\n\nFull recipe → ${url}`,
  (title: string, desc: string, url: string) =>
    `Have you tried this yet? ✨\n\n${title}\n\n${desc}\n\n📖 Recipe: ${url}`,
  (title: string, desc: string, url: string) =>
    `Today's AI-generated recipe: ${title} 🤖🍽️\n\n${desc}\n\n👉 ${url}`,
  (title: string, desc: string, url: string) =>
    `Save this for later! 🔖\n\n${title}\n\n${desc}\n\nFull recipe at ${url}`,
  (title: string, desc: string, url: string) =>
    `Would you cook this? 👨‍🍳\n\n${title}\n\n${desc}\n\nGet the recipe: ${url}`,
  (title: string, desc: string, url: string) =>
    `New recipe just dropped 🍴\n\n${title}\n\n${desc}\n\n${url}`,
  (title: string, desc: string, url: string) =>
    `Tag someone who needs to make this 👇\n\n${title}\n\n${desc}\n\nFull recipe: ${url}`,
  (title: string, desc: string, url: string) =>
    `This one's going straight to the weekly menu 📅\n\n${title}\n\n${desc}\n\n${url}`,
];

// ── Hashtags per cuisine ───────────────────────────────────────────────────────
const CUISINE_TAGS: Record<string, string> = {
  italian:        "#italianfood #pasta #italianrecipes",
  asian:          "#asianfood #asianrecipes #asiacuisine",
  japanese:       "#japanesefood #japaneserecipes #washoku",
  chinese:        "#chinesefood #chineserecipes #chinesecooking",
  thai:           "#thaifood #thairecipes #thaicooking",
  korean:         "#koreanfood #koreanrecipes #kfood",
  vietnamese:     "#vietnamesefood #vietnameserecipes",
  indian:         "#indianfood #indianrecipes #currylover",
  mexican:        "#mexicanfood #mexicanrecipes #tacos",
  mediterranean:  "#mediterraneanfood #mediterraneandiet",
  middleeastern:  "#middleeasternfood #arabicfood #levantinefood",
  french:         "#frenchfood #frenchcuisine #frenchrecipes",
  greek:          "#greekfood #greekrecipes #mediterraneancooking",
  american:       "#americanfood #comfortfood #americanrecipes",
  northafrican:   "#northafricanfood #moroccanfood #tagine",
};

// ── Hashtags per course ────────────────────────────────────────────────────────
const COURSE_TAGS: Record<string, string> = {
  breakfast:   "#breakfast #breakfastrecipes #morningfood",
  lunch:       "#lunch #lunchideas #lunchrecipes",
  dinner:      "#dinner #dinnerideas #dinnerrecipes",
  dessert:     "#dessert #dessertrecipes #sweettooth",
  snack:       "#snack #snacktime #snackrecipes",
  salad:       "#salad #saladrecipes #healthyfood",
  starter:     "#appetizer #starter #appetizerrecipes",
  "side dish": "#sidedish #sides #siderecipes",
};

// ── Hashtags per diet ──────────────────────────────────────────────────────────
const DIET_TAGS: Record<string, string> = {
  vegetarian:     "#vegetarian #vegetarianrecipes #meatless",
  vegan:          "#vegan #veganrecipes #plantbased",
  "gluten-free":  "#glutenfree #glutenfreerecipes",
  "dairy-free":   "#dairyfree #dairyfreerecipes",
  keto:           "#keto #ketorecipes #ketodiet",
  "low-carb":     "#lowcarb #lowcarbrecipes",
  "high-protein": "#highprotein #proteinrecipes #fitfood",
};

function buildHashtags(aiScore: any): string {
  const tags: string[] = ["#recipe #food #cooking #culirated #airecipe"];

  const cuisine = (aiScore?.cuisine || "").toLowerCase().replace(/[^a-z]/g, "");
  if (CUISINE_TAGS[cuisine]) tags.push(CUISINE_TAGS[cuisine]);

  const course = (aiScore?.course || "").toLowerCase().trim();
  if (COURSE_TAGS[course]) tags.push(COURSE_TAGS[course]);

  const diets: string[] = Array.isArray(aiScore?.diet) ? aiScore.diet : [];
  for (const diet of diets.slice(0, 2)) {
    const key = diet.toLowerCase();
    if (DIET_TAGS[key]) { tags.push(DIET_TAGS[key]); break; }
  }

  return tags.join(" ");
}

function buildCaption(recipe: any, aiScore: any, templateIndex: number): string {
  const title = recipe.title || "New Recipe";
  const desc = (recipe.description || "").slice(0, 120).trim();
  const url = `https://culirated.com/recept/en/${recipe.slug}`;
  const hashtags = buildHashtags(aiScore);
  const template = CAPTION_TEMPLATES[templateIndex % CAPTION_TEMPLATES.length];
  return `${template(title, desc, url)}\n\n${hashtags}`;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tel hoeveel TikTok posts er vandaag al zijn
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: tiktokPostsToday } = await supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .gte("posted_to_social", todayStart.toISOString());

    const tiktokAllowed = (tiktokPostsToday || 0) < 3;

    // Haal meest recente goedgekeurde recept op dat nog niet gepost is
    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("id, title, description, image_url, slug, ai_score, created_at")
      .eq("status", "approved")
      .is("posted_to_social", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !recipe) {
      console.log("Geen nieuw recept om te posten:", error?.message);
      return NextResponse.json({ message: "Geen nieuw recept gevonden" });
    }

    const aiScore = recipe.ai_score || {};
    const recipeScore = aiScore?.score || 0;

    // Template roteert op uur van de dag
    const templateIndex = new Date().getHours() % CAPTION_TEMPLATES.length;
    const caption = buildCaption(recipe, aiScore, templateIndex);

    // Bepaal actieve platforms — TikTok alleen bij max 3/dag en score >= 88
    const activePlatforms = PLATFORMS.filter(p => {
      if (p.tiktokOnly) return tiktokAllowed && recipeScore >= 88;
      return true;
    });

    if (activePlatforms.length === 0) {
      return NextResponse.json({
        message: "Geen platforms actief voor dit recept",
        reason: !tiktokAllowed ? "TikTok dagelijks limiet bereikt" : `Score te laag voor TikTok (${recipeScore}/100, minimum 88)`,
      });
    }

    const results = [];
    for (const { platform, accountId } of activePlatforms) {
      try {
        const body: Record<string, unknown> = {
          platforms: [{ platform, accountId }],
          content: caption,
          publishNow: true,
        };

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
      tiktokPostsToday: tiktokPostsToday || 0,
      tiktokAllowed,
      recipeScore,
      results,
    });

  } catch (error) {
    console.error("Social posting cron fout:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
