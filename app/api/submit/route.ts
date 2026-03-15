import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { name, recipe } = await req.json();

  if (!name || !recipe) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const prompt = `You are a strict but fair recipe quality checker for a recipe platform called Culirated.

A user named "${name}" has submitted the following recipe:

---
${recipe}
---

Evaluate this recipe on these 5 criteria:
1. Completeness — are all ingredients and steps present?
2. Ratios — are quantities realistic per person?
3. Logic — are the steps in a logical order?
4. Prep time — is the estimated time realistic?
5. SEO quality — is the title clear and descriptive?

Respond ONLY with a valid JSON object, no markdown, no explanation outside the JSON:

{
  "approved": true or false,
  "score": number between 0 and 100,
  "feedback": "A friendly 1-2 sentence summary for the user explaining the result",
  "criteria": [
    { "name": "Completeness", "passed": true/false, "comment": "short comment" },
    { "name": "Ratios", "passed": true/false, "comment": "short comment" },
    { "name": "Logic", "passed": true/false, "comment": "short comment" },
    { "name": "Prep time", "passed": true/false, "comment": "short comment" },
    { "name": "SEO quality", "passed": true/false, "comment": "short comment" }
  ],
  "title": "cleaned up recipe title",
  "description": "SEO-optimized description max 160 chars"
}

Approve if score >= 70. Be strict but constructive.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as any).text;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    if (result.approved) {
      await supabase.from("recipes").insert({
        title: result.title || recipe.split("\n")[0],
        description: result.description || "",
        ingredients: [],
        steps: [],
        author_id: null,
        status: "approved",
        ai_score: result,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { approved: false, feedback: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
