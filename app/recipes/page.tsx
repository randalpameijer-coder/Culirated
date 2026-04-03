"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZE = 12;

const FILTERS = [
  { group: "diet", label: "Diet", dot: "#3B6D11", color: "#3B6D11", light: "#EAF3DE", text: "#27500A",
    items: ["Vegetarian","Vegan","Gluten-free","Dairy-free","High-protein","Low-carb","Keto","Pescatarian"] },
  { group: "time", label: "Time", dot: "#185FA5", color: "#185FA5", light: "#E6F1FB", text: "#0C447C",
    items: ["< 15 min","< 30 min","< 45 min","< 1 hour","Weekend"] },
  { group: "cuisine", label: "Cuisine", dot: "#993C1D", color: "#993C1D", light: "#FAECE7", text: "#712B13",
    items: ["Italian","Asian","Mexican","Indian","Mediterranean","Middle Eastern","French","Greek","Japanese","Chinese","Thai","American","Vietnamese","Korean","North African"] },
  { group: "course", label: "Meal", dot: "#854F0B", color: "#854F0B", light: "#FAEEDA", text: "#633806",
    items: ["Breakfast","Lunch","Dinner","Dessert","Snack","Salad","Starter","Side dish"] },
  { group: "difficulty", label: "Level", dot: "#534AB7", color: "#534AB7", light: "#EEEDFE", text: "#3C3489",
    items: ["Easy","Medium","Advanced"] },
];

function detectLang(): string {
  if (typeof document === "undefined") return "en";
  const cookie = document.cookie.split(";").find(c => c.trim().startsWith("culirated_lang="));
  if (cookie) {
    const val = cookie.split("=")[1]?.trim();
    const supported = ["en","nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];
    if (val && supported.includes(val)) return val;
  }
  const b = (navigator.language || "en").split("-")[0].toLowerCase();
  return ["nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"].includes(b) ? b : "en";
}

function RecipesContent() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const searchParams = useSearchParams();
  const [lang] = useState<string>(() => typeof window === "undefined" ? "en" : detectLang());
  const [active, setActive] = useState<Record<string, string[]>>(() => {
    const params: Record<string, string[]> = {};
    ["diet","time","cuisine","course","difficulty"].forEach(key => {
      const val = searchParams.get(key);
      if (val) params[key] = [val];
    });
    return params;
  });
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    return ["diet","time","cuisine","course","difficulty"].find(k => searchParams.get(k)) || null;
  });
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get("q") || "");

  useEffect(() => { fetchRecipes(0, true); }, [active, searchQuery, lang]);

  async function fetchRecipes(pageNum: number, reset: boolean) {
    setLoading(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("recipes")
      .select("id, title, description, prep_time, calories, ai_score, image_url, recipe_translations!inner(slug, lang, title, description)", { count: "exact" })
      .eq("status", "approved")
      .eq("recipe_translations.lang", lang || "en")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (searchQuery.trim()) {
      // Zoek op vertaalde titel via subquery op recipe_translations
      const { data: matchIds } = await supabase
        .from("recipe_translations")
        .select("recipe_id")
        .eq("lang", lang || "en")
        .or(`title.ilike.%${searchQuery.trim()}%,ingredients.cs.["${searchQuery.trim()}"]`);
      if (matchIds && matchIds.length > 0) {
        const ids = matchIds.map((r: any) => r.recipe_id);
        query = query.in("id", ids);
      } else {
        // Geen matches — leeg resultaat
        query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
      }
    }

    Object.entries(active).forEach(([key, values]) => {
      if (!values.length) return;
      if (key === "diet") {
        values.forEach(v => { query = query.ilike(`ai_score->>diet`, `%${v}%`); });
      } else if (key === "time") {
        const orClauses: string[] = [];
        values.forEach(v => {
          if (v === "< 15 min") orClauses.push("prep_time.lte.15");
          else if (v === "< 30 min") orClauses.push("prep_time.lte.30");
          else if (v === "< 45 min") orClauses.push("prep_time.lte.45");
          else if (v === "< 1 hour") orClauses.push("prep_time.lte.60");
          else if (v === "Weekend") orClauses.push("prep_time.gte.61");
        });
        if (orClauses.length) query = query.or(orClauses.join(","));
      } else if (key === "cuisine") {
        if (values.length === 1) query = query.ilike(`ai_score->>cuisine`, `%${values[0]}%`);
        else query = query.or(values.map(v => `ai_score->>cuisine.ilike.%${v}%`).join(","));
      } else if (key === "course") {
        if (values.length === 1) query = query.ilike(`ai_score->>course`, `%${values[0]}%`);
        else query = query.or(values.map(v => `ai_score->>course.ilike.%${v}%`).join(","));
      } else if (key === "difficulty") {
        // difficulty kan "easy", "Easy", "medium" etc zijn - gebruik ilike zonder %
        if (values.length === 1) query = query.ilike(`ai_score->>difficulty`, values[0]);
        else query = query.or(values.map(v => `ai_score->>difficulty.ilike.${v}`).join(","));
      }
    });

    const { data } = await query;
    if (data) {
      setRecipes(reset ? data : prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }
    setPage(pageNum);
    setLoading(false);
  }

  function toggleChip(group: string, item: string) {
    setActive(prev => {
      const curr = prev[group] || [];
      const next = curr.includes(item) ? curr.filter(v => v !== item) : [...curr, item];
      const updated = { ...prev };
      if (!next.length) delete updated[group]; else updated[group] = next;
      return updated;
    });
  }

  function removeChip(group: string, item: string) {
    setActive(prev => {
      const updated = { ...prev };
      updated[group] = (updated[group] || []).filter(v => v !== item);
      if (!updated[group].length) delete updated[group];
      return updated;
    });
  }

  function clearAll() { setActive({}); }

  function getRecipeUrl(r: any): string {
    const slug = r.recipe_translations?.[0]?.slug;
    if (slug) return `/recept/${lang}/${slug}`;
    return `/recipe/${r.id}`;
  }

  const activeCount = Object.values(active).flat().length;
  const filterMap = Object.fromEntries(FILTERS.map(f => [f.group, f]));

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; overflow-x: hidden; }
        .page-layout { display: grid; grid-template-columns: 220px 1fr; gap: 48px; align-items: start; }
        .sidebar { position: sticky; top: 80px; }
        .acc-group { border-bottom: 0.5px solid rgba(180,160,120,0.25); }
        .acc-head { display: flex; align-items: center; justify-content: space-between; padding: 13px 0; cursor: pointer; user-select: none; }
        .acc-head-left { display: flex; align-items: center; gap: 10px; }
        .acc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .acc-label { font-size: 13px; font-weight: 500; color: #1e1609; letter-spacing: 0.01em; font-family: monospace; }
        .acc-badge { font-size: 10px; font-weight: 500; border-radius: 99px; padding: 1px 7px; margin-left: 4px; font-family: monospace; }
        .acc-arrow { font-size: 9px; color: #b8a882; transition: transform 0.2s; display: inline-block; }
        .acc-arrow.open { transform: rotate(180deg); }
        .acc-body { display: none; padding-bottom: 14px; flex-wrap: wrap; gap: 6px; }
        .acc-body.open { display: flex; }
        .chip { padding: 5px 13px; border-radius: 99px; font-size: 11px; cursor: pointer; border: 0.5px solid rgba(180,160,120,0.35); background: #faf8f3; color: #8a7355; transition: all 0.12s; white-space: nowrap; font-family: monospace; }
        .chip:hover { border-color: rgba(30,22,9,0.3); color: #1e1609; }
        .chip.active { border-color: transparent; color: #fff; }
        .recipe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .recipe-card { border-radius: 16px; overflow: hidden; background: #faf8f3; border: 1px solid rgba(180,160,120,0.2); display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; }
        .recipe-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(30,22,9,0.12); }
        .recipe-img { aspect-ratio: 4/3; overflow: hidden; flex-shrink: 0; position: relative; }
        .recipe-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .active-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; align-items: center; min-height: 28px; }
        .a-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 11px; border-radius: 99px; font-size: 11px; font-weight: 500; cursor: pointer; font-family: monospace; color: #fff; }
        @media (max-width: 900px) { .page-layout { grid-template-columns: 1fr; } .sidebar { position: static; } .recipe-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .recipe-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>
        {/* Topbar */}
        <div style={{ background: "#1e1609", padding: "8px 0", textAlign: "center", overflow: "hidden" }}>
          <span style={{ color: "#c8b080", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px", whiteSpace: "nowrap" }}>
            🤖 AI CREATES THE RECIPE  ·  👨‍🍳 YOU COOK IT  ·  ⭐ COMMUNITY RATES
          </span>
        </div>

        {/* Nav */}
        <nav style={{ background: "rgba(245,240,232,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(180,160,120,0.25)", padding: "0 clamp(16px, 4vw, 48px)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", height: "60px", gap: "16px" }}>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🌿</div>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "20px", color: "#1e1609" }}>Culirated</span>
            </a>
            <a href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none", whiteSpace: "nowrap" }}>← Home</a>
            <div style={{ flex: 1 }} />
            <input
              type="search"
              placeholder="Search recipes…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: "#faf8f3", border: "1px solid rgba(180,160,120,0.3)", borderRadius: "20px", padding: "8px 16px", fontFamily: "monospace", fontSize: "13px", color: "#1e1609", outline: "none", width: "220px" }}
            />
          </div>
        </nav>

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(32px, 4vw, 48px) clamp(16px, 4vw, 48px) 80px" }}>
          <div className="page-layout">

            {/* Sidebar filters */}
            <div className="sidebar">
              <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "700", color: "#1e1609", marginBottom: "24px", letterSpacing: "-0.5px" }}>Filters</div>
              {FILTERS.map(f => (
                <div key={f.group} className="acc-group">
                  <div className="acc-head" onClick={() => setOpenGroup(openGroup === f.group ? null : f.group)}>
                    <div className="acc-head-left">
                      <span className="acc-dot" style={{ background: f.dot }} />
                      <span className="acc-label">{f.label}</span>
                      {(active[f.group]||[]).length > 0 && (
                        <span className="acc-badge" style={{ background: f.light, color: f.text }}>
                          {(active[f.group]||[]).length}
                        </span>
                      )}
                    </div>
                    <span className={`acc-arrow${openGroup === f.group ? " open" : ""}`}>▼</span>
                  </div>
                  <div className={`acc-body${openGroup === f.group ? " open" : ""}`}>
                    {f.items.map(item => {
                      const isActive = (active[f.group]||[]).includes(item);
                      return (
                        <span
                          key={item}
                          className={`chip${isActive ? " active" : ""}`}
                          style={isActive ? { background: f.color } : {}}
                          onClick={() => toggleChip(f.group, item)}
                        >
                          {item}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Recipes */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: "700", color: "#1e1609", letterSpacing: "-0.5px", marginBottom: "6px" }}>
                    {activeCount > 0 ? "Filtered recipes" : "All Recipes"}
                  </h1>
                  <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355" }}>
                    {loading ? "Loading…" : `${recipes.length}${hasMore ? "+" : ""} recipes · AI generated & quality checked`}
                  </p>
                </div>
              </div>

              {/* Active pills */}
              {activeCount > 0 && (
                <div className="active-pills">
                  {Object.entries(active).flatMap(([g, vals]) => vals.map(v => (
                    <span key={`${g}-${v}`} className="a-pill" style={{ background: filterMap[g].color }} onClick={() => removeChip(g, v)}>
                      {v} <span style={{ opacity: 0.6 }}>×</span>
                    </span>
                  )))}
                  <span onClick={clearAll} style={{ fontSize: "11px", color: "#8a7355", textDecoration: "underline", cursor: "pointer", fontFamily: "monospace" }}>clear all</span>
                </div>
              )}

              {loading && recipes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px", fontFamily: "monospace", color: "#8a7355" }}>Loading recipes…</div>
              ) : recipes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#1e1609", marginBottom: "12px" }}>No recipes found</p>
                  <button onClick={clearAll} style={{ background: "none", border: "1px solid rgba(30,22,9,0.2)", borderRadius: "20px", padding: "8px 20px", fontFamily: "monospace", fontSize: "13px", cursor: "pointer", color: "#1e1609" }}>Clear filters</button>
                </div>
              ) : (
                <>
                  <div className="recipe-grid">
                    {recipes.map(r => (
                      <a key={r.id} href={getRecipeUrl(r)} className="recipe-card">
                        <div className="recipe-img">
                          {r.image_url
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
                              {r.ai_score?.cuisine && <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#712B13", background: "#FAECE7", borderRadius: "20px", padding: "3px 10px" }}>{r.ai_score.cuisine}</span>}
                              {r.ai_score?.difficulty && <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#3C3489", background: "#EEEDFE", borderRadius: "20px", padding: "3px 10px" }}>{r.ai_score.difficulty}</span>}
                              {r.prep_time && <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#085041", background: "#E1F5EE", borderRadius: "20px", padding: "3px 10px" }}>⏱ {r.prep_time} min</span>}
                            </div>
                            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", color: "#1e1609", lineHeight: 1.25, marginBottom: "8px" }}>{r.recipe_translations?.[0]?.title || r.title}</h3>
                            {(r.recipe_translations?.[0]?.description || r.description) && <p style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "#8a7355", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.recipe_translations?.[0]?.description || r.description}</p>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(180,160,120,0.15)", marginTop: "12px" }}>
                            <div style={{ display: "flex", gap: "12px" }}>
                              {r.calories && <span style={{ fontSize: "12px", color: "#8a7355", fontFamily: "monospace" }}>🔥 {r.calories} kcal</span>}
                            </div>
                            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#4a7a3d", background: "rgba(74,122,61,0.1)", borderRadius: "10px", padding: "2px 8px" }}>✦ AI approved</span>
                          </div>
                        </div>
                      </a>
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
        </div>
      </div>
    </>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "80px", textAlign: "center", fontFamily: "monospace", color: "#8a7355" }}>Loading…</div>}>
      <RecipesContent />
    </Suspense>
  );
}
