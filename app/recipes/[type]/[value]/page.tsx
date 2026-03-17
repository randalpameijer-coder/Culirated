"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORY_LABELS: Record<string, string> = {
  cuisine: "Cuisine", course: "Course", diet: "Diet",
  method: "Method", time: "Time", occasion: "Occasion", ingredient: "Ingredient",
};

export default function CategoryPage({ params }: { params: Promise<{ type: string; value: string }> }) {
  const { type, value } = use(params);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const valueFormatted = decodeURIComponent(value).replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const PAGE_SIZE = 12;

  useEffect(() => { loadRecipes(0, true); }, [type, value]);

  async function loadRecipes(pageNum: number, reset: boolean) {
    setLoading(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const isArray = type === "diet" || type === "occasion";
    const fieldName = type === "ingredient" ? "main_ingredient" : type;

    let query = supabase
      .from("recipes")
      .select("id, title, description, prep_time, calories, ai_score, image_url")
      .eq("status", "approved")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (isArray) {
      query = query.contains(`ai_score->${fieldName}`, JSON.stringify([valueFormatted]));
    } else {
      query = query.ilike(`ai_score->>${fieldName}`, valueFormatted);
    }

    const { data } = await query;
    if (data) {
      setRecipes(reset ? data : prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }
    setPage(pageNum);
    setLoading(false);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; }
        .recipe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .recipe-card { border-radius: 16px; overflow: hidden; background: #faf8f3; border: 1px solid rgba(180,160,120,0.2); cursor: pointer; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
        .recipe-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(30,22,9,0.12); }
        .recipe-img { aspect-ratio: 4/3; overflow: hidden; flex-shrink: 0; position: relative; }
        .recipe-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 768px) { .recipe-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .recipe-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>
        <div style={{ background: "#1e1609", padding: "8px 0", textAlign: "center" }}>
          <span style={{ color: "#c8b080", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px" }}>
            👨‍🍳 RECIPES BY PEOPLE · ✦ CURATED BY AI · ONLY THE BEST GOES LIVE
          </span>
        </div>

        <nav style={{ background: "rgba(245,240,232,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(180,160,120,0.25)", padding: "0 48px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", height: "70px", gap: "24px" }}>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍃</div>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "22px", color: "#1e1609" }}>Culirated</span>
            </a>
            <a href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none" }}>← Back</a>
            <div style={{ flex: 1 }} />
            <a href="/submit" style={{ textDecoration: "none" }}>
              <button style={{ background: "#3a7a32", color: "#e8f5e4", border: "none", borderRadius: "24px", padding: "10px 18px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", fontWeight: "500" }}>+ Submit Recipe</button>
            </a>
          </div>
        </nav>

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "56px 48px 40px" }}>
          <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase" }}>
            {CATEGORY_LABELS[type] || type}
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "52px", fontWeight: "700", color: "#1e1609", letterSpacing: "-1px", marginBottom: "8px" }}>
            {valueFormatted}
          </h1>
          <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355" }}>
            {loading ? "Loading..." : `${recipes.length}${hasMore ? "+" : ""} recipes · AI quality checked`}
          </p>
        </div>

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px 80px" }}>
          {loading && recipes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", fontFamily: "monospace", color: "#8a7355" }}>Loading recipes…</div>
          ) : recipes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#1e1609", marginBottom: "8px" }}>No recipes found</p>
              <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355" }}>Be the first to submit a {valueFormatted} recipe!</p>
              <a href="/submit" style={{ display: "inline-block", marginTop: "24px", background: "#3a7a32", color: "#e8f5e4", textDecoration: "none", borderRadius: "24px", padding: "12px 28px", fontFamily: "monospace", fontSize: "13px" }}>Submit Recipe</a>
            </div>
          ) : (
            <>
              <div className="recipe-grid">
                {recipes.map(r => (
                  <div key={r.id} className="recipe-card">
                    <div className="recipe-img">
                      {r.image_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={r.image_url} alt={r.title} />
                        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2d5a27,#4a8c41)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🍽️</div>
                      }
                      <div style={{ position: "absolute", top: "12px", right: "12px", background: "linear-gradient(135deg,#2d5a27,#4a8c41)", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontFamily: "monospace", color: "#e8f5e6" }}>
                        ✦ AI {r.ai_score?.score || 90}/100
                      </div>
                    </div>
                    <div style={{ padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                          {r.ai_score?.cuisine && <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#8a7355", background: "rgba(140,115,80,0.12)", borderRadius: "20px", padding: "3px 10px" }}>{r.ai_score.cuisine}</span>}
                          {r.ai_score?.diet?.[0] && <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#4a7a3d", background: "rgba(74,122,61,0.1)", borderRadius: "20px", padding: "3px 10px" }}>{r.ai_score.diet[0]}</span>}
                        </div>
                        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", color: "#1e1609", lineHeight: 1.25, marginBottom: "8px" }}>{r.title}</h3>
                        {r.description && <p style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "#8a7355", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.description}</p>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(180,160,120,0.15)", marginTop: "12px" }}>
                        <div style={{ display: "flex", gap: "12px" }}>
                          {r.prep_time && <span style={{ fontSize: "12px", color: "#8a7355", fontFamily: "monospace" }}>⏱ {r.prep_time} min</span>}
                          {r.calories && <span style={{ fontSize: "12px", color: "#8a7355", fontFamily: "monospace" }}>🔥 {r.calories} kcal</span>}
                        </div>
                        <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#4a7a3d", background: "rgba(74,122,61,0.1)", borderRadius: "10px", padding: "2px 8px" }}>✦ AI approved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div style={{ textAlign: "center", marginTop: "48px" }}>
                  <button onClick={() => loadRecipes(page + 1, false)} disabled={loading}
                    style={{ background: "transparent", color: "#1e1609", border: "1.5px solid rgba(30,22,9,0.25)", borderRadius: "28px", padding: "14px 40px", fontFamily: "monospace", fontSize: "13px", cursor: "pointer" }}>
                    {loading ? "Loading…" : "Load more recipes"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
