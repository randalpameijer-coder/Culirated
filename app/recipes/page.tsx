"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FILTERS = [
  { key: "cuisine", label: "Cuisine", items: ["Italian","Mexican","Asian","Indian","Thai","Chinese","Japanese","Greek","Middle Eastern","French","American","Mediterranean"] },
  { key: "course", label: "Course", items: ["Breakfast","Lunch","Dinner","Appetizer","Side dish","Dessert","Snack"] },
  { key: "diet", label: "Diet", items: ["Vegetarian","Vegan","Gluten-free","Dairy-free","Low-carb","High-protein"] },
  { key: "method", label: "Method", items: ["Air fryer","Slow cooker","Sheet pan","BBQ & Grill","One pot","No-cook"] },
  { key: "time", label: "Time", items: ["Under 20 min","Under 30 min","Under 1 hour","Weekend project"] },
  { key: "occasion", label: "Occasion", items: ["Weeknight","Meal prep","Holidays","Kids","Date night","Batch cooking"] },
  { key: "ingredient", label: "Ingredient", items: ["Chicken","Beef","Fish & seafood","Pasta","Rice","Eggs","Vegetables","Legumes","Pork"] },
];

// Flat list of all chips with category color
const CHIP_COLORS: Record<string, { bg: string; activeBg: string; icon: string }> = {
  cuisine:    { bg: "rgba(139,90,43,0.08)",   activeBg: "#8b5a2b", icon: "🌍" },
  course:     { bg: "rgba(45,90,39,0.08)",    activeBg: "#2d5a27", icon: "🍽️" },
  diet:       { bg: "rgba(74,122,61,0.08)",   activeBg: "#4a7a3d", icon: "🌿" },
  method:     { bg: "rgba(180,80,20,0.08)",   activeBg: "#b45014", icon: "🔥" },
  time:       { bg: "rgba(30,22,9,0.06)",     activeBg: "#1e1609", icon: "⏱️" },
  occasion:   { bg: "rgba(100,60,140,0.08)",  activeBg: "#643c8c", icon: "🎉" },
  ingredient: { bg: "rgba(160,40,40,0.08)",   activeBg: "#a02828", icon: "🥩" },
};

const ALL_CHIPS = FILTERS.flatMap(f =>
  f.items.map(item => ({ key: f.key, label: item, ...CHIP_COLORS[f.key] }))
);

const PAGE_SIZE = 12;

export default function RecipesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "80px", textAlign: "center", fontFamily: "monospace", color: "#8a7355" }}>Loading…</div>}>
      <RecipesContent />
    </Suspense>
  );
}

function RecipesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<Record<string, string[]>>({});
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const init: Record<string, string[]> = {};
    FILTERS.forEach(f => {
      const v = searchParams.get(f.key);
      if (v) init[f.key] = v.split(",");
    });
    setActive(init);
  }, []);

  useEffect(() => { fetchRecipes(0, true); }, [active]);

  function toggleFilter(key: string, value: string) {
    setActive(prev => {
      const current = prev[key] || [];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      const updated = { ...prev, [key]: next };
      if (next.length === 0) delete updated[key];
      const params = new URLSearchParams();
      Object.entries(updated).forEach(([k, vals]) => { if (vals.length > 0) params.set(k, vals.join(",")); });
      router.replace(`/recipes?${params.toString()}`, { scroll: false });
      return updated;
    });
  }

  function clearAll() { setActive({}); router.replace("/recipes", { scroll: false }); }
  const activeCount = Object.values(active).flat().length;

  async function fetchRecipes(pageNum: number, reset: boolean) {
    setLoading(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const arrayKeys = ["diet", "occasion"];

    let query = supabase
      .from("recipes")
      .select("id, title, description, prep_time, calories, ai_score, image_url", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to);

    Object.entries(active).forEach(([key, values]) => {
      if (values.length === 0) return;
      const fieldName = key === "ingredient" ? "main_ingredient" : key;
      if (arrayKeys.includes(key)) {
        values.forEach(v => { query = query.contains(`ai_score->${fieldName}`, JSON.stringify([v])); });
      } else if (values.length === 1) {
        query = query.ilike(`ai_score->>${fieldName}`, values[0]);
      } else {
        query = query.or(values.map(v => `ai_score->>${fieldName}.ilike.${v}`).join(","));
      }
    });

    const { data, count } = await query;
    if (data) { setRecipes(reset ? data : prev => [...prev, ...data]); setHasMore(data.length === PAGE_SIZE); if (count !== null) setTotal(count); }
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
        .chip { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 20px; font-family: monospace; font-size: 12px; cursor: pointer; border: 1px solid rgba(180,160,120,0.3); background: transparent; color: #6b5840; transition: all 0.15s; white-space: nowrap; }
        .chip:hover { border-color: #4a7a3d; color: #2d5a27; background: rgba(74,122,61,0.06); }
        .chip.active { background: #2d5a27; color: #e8f5e4; border-color: #2d5a27; }
        @media (max-width: 768px) { .recipe-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .recipe-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>
        <div style={{ background: "#1e1609", padding: "8px 0", textAlign: "center" }}>
          <span style={{ color: "#c8b080", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px" }}>👨‍🍳 RECIPES BY PEOPLE · ✦ CURATED BY AI · ONLY THE BEST GOES LIVE</span>
        </div>

        <nav style={{ background: "rgba(245,240,232,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(180,160,120,0.25)", padding: "0 48px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", height: "70px", gap: "24px" }}>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍃</div>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "22px", color: "#1e1609" }}>Culirated</span>
            </a>
            <div style={{ flex: 1 }} />
            <a href="/submit" style={{ textDecoration: "none" }}>
              <button style={{ background: "#3a7a32", color: "#e8f5e4", border: "none", borderRadius: "24px", padding: "10px 18px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", fontWeight: "500" }}>+ Submit Recipe</button>
            </a>
          </div>
        </nav>

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "42px", fontWeight: "700", color: "#1e1609", letterSpacing: "-1px", marginBottom: "6px" }}>All Recipes</h1>
              <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355" }}>{loading ? "Loading..." : `${total} recipes · AI quality checked`}</p>
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll} style={{ fontFamily: "monospace", fontSize: "12px", color: "#8b3020", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear all ({activeCount})</button>
            )}
          </div>

          {/* Active filter summary */}
          {activeCount > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#8a7355" }}>Active:</span>
              {Object.entries(active).flatMap(([key, vals]) =>
                vals.map(v => (
                  <button key={`${key}-${v}`} onClick={() => toggleFilter(key, v)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "20px", fontFamily: "monospace", fontSize: "12px", cursor: "pointer", background: CHIP_COLORS[key]?.activeBg || "#1e1609", color: "#fff", border: "none" }}>
                    {v} ✕
                  </button>
                ))
              )}
              <button onClick={clearAll} style={{ fontFamily: "monospace", fontSize: "11px", color: "#8b3020", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Clear all</button>
            </div>
          )}

          {/* Flat chip cloud */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
            {ALL_CHIPS.map(chip => {
              const isActive = (active[chip.key] || []).includes(chip.label);
              return (
                <button key={`${chip.key}-${chip.label}`}
                  onClick={() => toggleFilter(chip.key, chip.label)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "7px 14px", borderRadius: "20px", cursor: "pointer",
                    fontFamily: "monospace", fontSize: "12px", whiteSpace: "nowrap",
                    border: "none", transition: "all 0.15s",
                    background: isActive ? chip.activeBg : chip.bg,
                    color: isActive ? "#fff" : "#4a3820",
                    fontWeight: isActive ? "500" : "400",
                    transform: isActive ? "scale(1.03)" : "scale(1)",
                  }}>
                  <span style={{ fontSize: "11px" }}>{chip.icon}</span>
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px 80px" }}>
          {loading && recipes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", fontFamily: "monospace", color: "#8a7355" }}>Loading recipes…</div>
          ) : recipes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#1e1609", marginBottom: "8px" }}>No recipes found</p>
              <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355", marginBottom: "24px" }}>Try removing some filters</p>
              <button onClick={clearAll} style={{ background: "#3a7a32", color: "#e8f5e4", border: "none", borderRadius: "24px", padding: "12px 28px", fontFamily: "monospace", fontSize: "13px", cursor: "pointer" }}>Clear filters</button>
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
                  <button onClick={() => fetchRecipes(page + 1, false)} disabled={loading}
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
