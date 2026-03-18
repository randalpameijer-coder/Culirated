"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();
      setRecipe(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <div style={{ padding: "80px", textAlign: "center", fontFamily: "monospace", color: "#8a7355" }}>Loading…</div>;
  if (!recipe) return <div style={{ padding: "80px", textAlign: "center", fontFamily: "monospace", color: "#8a7355" }}>Recipe not found.</div>;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const score = recipe.ai_score?.score;
  const cuisine = recipe.ai_score?.cuisine;
  const diet = recipe.ai_score?.diet || [];
  const course = recipe.ai_score?.course;
  const method = recipe.ai_score?.method;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; }
        .hero-img { width: 100%; height: 480px; object-fit: cover; display: block; }
        @media (max-width: 768px) { .hero-img { height: 280px; } .content-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>
        {/* Top bar */}
        <div style={{ background: "#1e1609", padding: "8px 0", textAlign: "center" }}>
          <span style={{ color: "#c8b080", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px" }}>
            👨‍🍳 RECIPES BY PEOPLE · ✦ CURATED BY AI · ONLY THE BEST GOES LIVE
          </span>
        </div>

        {/* Nav */}
        <nav style={{ background: "rgba(245,240,232,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(180,160,120,0.25)", padding: "0 48px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", height: "70px", gap: "24px" }}>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍃</div>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "22px", color: "#1e1609" }}>Culirated</span>
            </a>
            <a href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none" }}>← All recipes</a>
            <div style={{ flex: 1 }} />
            <NavShareButton title={recipe?.title} />
            <a href="/submit" style={{ textDecoration: "none" }}>
              <button style={{ background: "#3a7a32", color: "#e8f5e4", border: "none", borderRadius: "24px", padding: "10px 18px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", fontWeight: "500" }}>+ Submit Recipe</button>
            </a>
          </div>
        </nav>

        {/* Hero image */}
        {recipe.image_url && (
          <div style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={recipe.image_url} alt={recipe.title} className="hero-img" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(30,22,9,0.7) 0%, transparent 50%)" }} />
            <div style={{ position: "absolute", bottom: "40px", left: "0", right: "0", maxWidth: "1280px", margin: "0 auto", padding: "0 48px" }}>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "52px", fontWeight: "700", color: "#fff", lineHeight: 1.1, letterSpacing: "-1px", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                {recipe.title}
              </h1>
              {recipe.description && (
                <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "rgba(255,255,255,0.85)", marginTop: "12px", maxWidth: "640px", lineHeight: 1.5 }}>{recipe.description}</p>
              )}
            </div>
            {score && (
              <div style={{ position: "absolute", top: "24px", right: "48px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: "16px", padding: "14px 18px", textAlign: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#8a7355", letterSpacing: "1px", marginBottom: "4px" }}>AI SCORE</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "700", color: "#2d5a27", lineHeight: 1 }}>{score}</div>
                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#8a7355" }}>/100</div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 48px 80px" }}>
          {/* Meta strip */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {cuisine && <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", background: "rgba(140,115,80,0.12)", borderRadius: "20px", padding: "5px 14px" }}>{cuisine}</span>}
            {course && <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#4a7a3d", background: "rgba(74,122,61,0.1)", borderRadius: "20px", padding: "5px 14px" }}>{course}</span>}
            {method && <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", background: "rgba(140,115,80,0.12)", borderRadius: "20px", padding: "5px 14px" }}>{method}</span>}
            {diet.map((d: string) => <span key={d} style={{ fontFamily: "monospace", fontSize: "12px", color: "#2d5a27", background: "rgba(45,90,39,0.1)", borderRadius: "20px", padding: "5px 14px" }}>{d}</span>)}
          </div>

          {/* Author */}
          {recipe.author_name && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "40px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>👨‍🍳</div>
              <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355" }}>Recipe by <strong style={{ color: "#1e1609" }}>{recipe.author_name}</strong></span>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "48px" }}>
            {[
              { label: "Prep time", value: recipe.prep_time ? `${recipe.prep_time} min` : "—", icon: "⏱️" },
              { label: "Servings", value: recipe.servings ? `${recipe.servings} people` : "—", icon: "👥" },
              { label: "Calories", value: recipe.calories ? `${recipe.calories} kcal` : "—", icon: "🔥" },
              { label: "Difficulty", value: recipe.difficulty || "—", icon: "📊" },
            ].map(s => (
              <div key={s.label} style={{ background: "#faf8f3", borderRadius: "14px", padding: "20px", border: "1px solid rgba(180,160,120,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", color: "#1e1609", marginBottom: "4px" }}>{s.value}</div>
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#8a7355", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* 2-col layout */}
          <div className="content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "48px", alignItems: "start" }}>
            {/* Ingredients */}
            <div style={{ background: "#faf8f3", borderRadius: "20px", padding: "32px", border: "1px solid rgba(180,160,120,0.2)", position: "sticky", top: "90px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "700", color: "#1e1609", marginBottom: "24px" }}>Ingredients</h2>
              {ingredients.length > 0 ? (
                <ul style={{ listStyle: "none" }}>
                  {ingredients.map((ing: string, i: number) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", paddingBottom: "12px", borderBottom: i < ingredients.length - 1 ? "1px solid rgba(180,160,120,0.12)" : "none", marginBottom: "12px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3a7a32", marginTop: "7px", flexShrink: 0 }} />
                      <span style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#1e1609", lineHeight: 1.5 }}>{ing}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355" }}>No ingredients listed.</p>
              )}
            </div>

            {/* Steps */}
            <div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "700", color: "#1e1609", marginBottom: "32px" }}>Instructions</h2>
              {steps.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {steps.map((step: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1e1609", color: "#e8dfc8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: "700", flexShrink: 0, marginTop: "2px" }}>
                        {i + 1}
                      </div>
                      <div style={{ background: "#faf8f3", borderRadius: "14px", padding: "20px 24px", border: "1px solid rgba(180,160,120,0.15)", flex: 1 }}>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#1e1609", lineHeight: 1.75 }}>{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355" }}>No instructions listed.</p>
              )}

              {/* AI check badge */}
              <div style={{ marginTop: "48px", background: "rgba(74,122,61,0.06)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(74,122,61,0.15)", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ fontSize: "28px" }}>✦</div>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#2d5a27", fontWeight: "500", marginBottom: "4px" }}>AI QUALITY CHECKED</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#4a3820", lineHeight: 1.5 }}>
                    This recipe was submitted by a real cook and verified by AI — completeness, ratios, logic and prep time all checked before going live.
                  </div>
                </div>
              </div>

              {/* Share */}
              <ShareButtons title={recipe.title} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NavShareButton({ title }: { title?: string }) {
  const [show, setShow] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = encodeURIComponent(`${title || "Recipe"} on Culirated`);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShow(!show)} style={{ background: "#e8581a", border: "none", borderRadius: "20px", padding: "10px 16px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: "#fff", fontWeight: "500" }}>
        ↗ Share
      </button>
      {show && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: "16px", padding: "8px", border: "1px solid rgba(180,160,120,0.2)", boxShadow: "0 12px 40px rgba(30,22,9,0.12)", zIndex: 200, minWidth: "180px" }}>
          {[
            { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${encodedUrl}`, icon: "💬" },
            { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: "📘" },
            { label: "X", href: `https://x.com/intent/tweet?text=${text}&url=${encodedUrl}`, icon: "𝕏" },
            { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${text}`, icon: "📌" },
          ].map(b => (
            <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", fontFamily: "monospace", fontSize: "12px", color: "#1e1609" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f0e8")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span style={{ fontSize: "16px" }}>{b.icon}</span> {b.label}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = encodeURIComponent(`${title} — check this recipe on Culirated`);
  const encodedUrl = encodeURIComponent(url);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const buttons = [
    { label: "WhatsApp", color: "#25D366", href: `https://wa.me/?text=${text}%20${encodedUrl}`, icon: "💬" },
    { label: "Facebook", color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: "📘" },
    { label: "X", color: "#000", href: `https://x.com/intent/tweet?text=${text}&url=${encodedUrl}`, icon: "𝕏" },
    { label: "Pinterest", color: "#E60023", href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${text}`, icon: "📌" },
  ];

  return (
    <div style={{ marginTop: "32px" }}>
      <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#8a7355", letterSpacing: "1px", marginBottom: "14px", textTransform: "uppercase" }}>Share this recipe</div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {buttons.map(b => (
          <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: b.color, color: "#fff", borderRadius: "20px", padding: "9px 16px", fontFamily: "monospace", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>
              <span>{b.icon}</span> {b.label}
            </div>
          </a>
        ))}
        <button onClick={copyLink} style={{ display: "flex", alignItems: "center", gap: "7px", background: copied ? "#2d5a27" : "#f5f0e8", color: copied ? "#fff" : "#1e1609", border: "1px solid rgba(180,160,120,0.3)", borderRadius: "20px", padding: "9px 16px", fontFamily: "monospace", fontSize: "12px", cursor: "pointer", transition: "all 0.2s" }}>
          <span>{copied ? "✅" : "🔗"}</span> {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
