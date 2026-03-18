"use client";

import { useState } from "react";

type Step = "form" | "analysing" | "review" | "saving" | "done";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [recipe, setRecipe] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [result, setResult] = useState<any>(null);
  const [savedId, setSavedId] = useState<string>("");
  const [useImprovedTitle, setUseImprovedTitle] = useState(true);
  const [customTitle, setCustomTitle] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !recipe.trim()) return;
    setStep("analysing");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, recipe }),
      });
      const data = await res.json();
      setResult(data);
      setCustomTitle(data.suggestions?.title?.original || data.meta?.title || "");
      setUseImprovedTitle(data.suggestions?.title?.changed || false);
      setStep("review");
    } catch {
      setResult({ approved: false, feedback: "Something went wrong. Please try again." });
      setStep("review");
    }
  }

  async function handleConfirm() {
    if (!result?.approved) return;
    setStep("saving");
    const finalTitle = useImprovedTitle
      ? (result.suggestions?.title?.improved || result.meta?.title)
      : customTitle;
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, recipe, confirm: true,
          confirmedTitle: finalTitle,
          confirmedDescription: result.suggestions?.description?.improved || "",
          confirmedIngredients: result.corrections?.ingredients || [],
          confirmedSteps: result.corrections?.steps || [],
          prep_time: result.meta?.prep_time,
          servings: result.meta?.servings,
          calories: result.meta?.calories,
          difficulty: result.meta?.difficulty,
          cuisine: result.meta?.cuisine,
          ai_score: result.ai_score,
        }),
      });
      const data = await res.json();
      if (data.saved) { setSavedId(data.id); setStep("done"); }
      else setStep("review");
    } catch { setStep("review"); }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; }
        .wrap { min-height: 100vh; background: #f5f0e8; padding: 48px 24px; }
        .card { max-width: 720px; margin: 0 auto; background: #faf8f3; border-radius: 24px; padding: 48px; border: 1px solid rgba(180,160,120,0.2); }
        label { display: block; font-family: monospace; font-size: 12px; color: #6b5840; letter-spacing: 0.8px; margin-bottom: 8px; }
        input, textarea { width: 100%; background: #f5f0e8; border: 1px solid rgba(180,160,120,0.3); border-radius: 12px; padding: 14px 16px; font-family: Georgia, serif; font-size: 15px; color: #1e1609; outline: none; }
        input:focus, textarea:focus { border-color: #4a7a3d; background: #fff; }
        textarea { min-height: 280px; resize: vertical; line-height: 1.6; }
        .field { margin-bottom: 24px; }
        .btn-primary { background: #3a7a32; color: #e8f5e4; border: none; border-radius: 24px; padding: 14px 28px; font-family: monospace; font-size: 13px; font-weight: 500; cursor: pointer; width: 100%; margin-top: 8px; }
        .btn-primary:disabled { background: #a0c8a0; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: #3a7a32; border: 1.5px solid #3a7a32; border-radius: 24px; padding: 12px 24px; font-family: monospace; font-size: 13px; cursor: pointer; }
        .loading-icon { font-size: 28px; animation: spin 1.5s linear infinite; display: inline-block; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .section { background: #f5f0e8; border-radius: 14px; padding: 20px 24px; margin-bottom: 16px; border: 1px solid rgba(180,160,120,0.2); }
        .section-title { font-family: monospace; font-size: 11px; color: #8a7355; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
        .toggle-row { display: flex; gap: 10px; margin-bottom: 8px; }
        .toggle-btn { flex: 1; padding: 10px; border-radius: 10px; font-family: monospace; font-size: 12px; cursor: pointer; border: 1px solid rgba(180,160,120,0.3); background: transparent; color: #6b5840; transition: all 0.15s; }
        .toggle-btn.active { background: #2d5a27; color: #e8f5e4; border-color: #2d5a27; }
        @media (max-width: 600px) { .card { padding: 28px 20px; } }
      `}</style>

      <div className="wrap">
        <div className="card">
          <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "40px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🍃</div>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "18px", color: "#1e1609" }}>Culirated</span>
          </a>

          {step === "form" && (
            <>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: "700", color: "#1e1609", marginBottom: "8px" }}>Submit your recipe.</h1>
              <p style={{ fontFamily: "Georgia, serif", color: "#8a7355", fontSize: "15px", lineHeight: 1.6, marginBottom: "36px" }}>
                Write or paste your recipe. AI checks it and may suggest small improvements — you decide what goes live.
              </p>
              <div className="field">
                <label>YOUR NAME</label>
                <input type="text" placeholder="e.g. Marco V." value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>YOUR RECIPE</label>
                <textarea placeholder={"Paste or write your recipe here.\n\nExample:\nSpaghetti Carbonara (4 persons)\n\nIngredients:\n- 400g spaghetti\n...\n\nSteps:\n1. Cook pasta..."} value={recipe} onChange={e => setRecipe(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={handleSubmit} disabled={!name.trim() || !recipe.trim()}>
                ✦ Submit — AI checks it now
              </button>
            </>
          )}

          {step === "analysing" && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="loading-icon">✦</div>
              <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355", marginTop: "20px" }}>Analysing your recipe…<br />checking ratios, logic and SEO</p>
            </div>
          )}

          {step === "review" && result && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                <div style={{ fontSize: "40px" }}>{result.approved ? "🟢" : "🔴"}</div>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "700", color: result.approved ? "#2d5a27" : "#8b3020" }}>
                    {result.approved ? "Looks good!" : "Not approved yet."}
                  </div>
                  {result.score && <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", marginTop: "4px" }}>AI Score: {result.score}/100</div>}
                </div>
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#4a3820", lineHeight: 1.65, marginBottom: "28px" }}>{result.feedback}</p>

              {result.criteria && (
                <div className="section">
                  <div className="section-title">Quality check</div>
                  {result.criteria.map((c: any) => (
                    <div key={c.name} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "14px", flexShrink: 0 }}>{c.passed ? "✅" : "❌"}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#4a3820" }}><strong>{c.name}:</strong> {c.comment}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.approved && (
                <>
                  {result.suggestions?.title?.changed && (
                    <div className="section">
                      <div className="section-title">✦ Title suggestion</div>
                      <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#8a7355", marginBottom: "12px" }}>AI suggests a more findable title. Which do you prefer?</p>
                      <div className="toggle-row">
                        <button className={`toggle-btn ${useImprovedTitle ? "active" : ""}`} onClick={() => setUseImprovedTitle(true)}>✦ {result.suggestions.title.improved}</button>
                        <button className={`toggle-btn ${!useImprovedTitle ? "active" : ""}`} onClick={() => setUseImprovedTitle(false)}>Keep: {result.suggestions.title.original}</button>
                      </div>
                    </div>
                  )}

                  {result.corrections?.ratios_fixed && (
                    <div className="section">
                      <div className="section-title">⚠️ Correction applied</div>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#4a3820", lineHeight: 1.6 }}>{result.corrections.what_was_fixed}</p>
                    </div>
                  )}

                  <div style={{ background: "rgba(74,122,61,0.06)", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", border: "1px solid rgba(74,122,61,0.15)" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#2d5a27", letterSpacing: "1px", marginBottom: "8px" }}>WHAT HAPPENS NEXT</div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#4a3820", lineHeight: 1.65 }}>Your recipe goes live immediately with a professional food photo generated automatically. The recipe stays yours.</p>
                  </div>
                  <button className="btn-primary" onClick={handleConfirm}>✦ Publish my recipe →</button>
                </>
              )}

              {!result.approved && (
                <button className="btn-secondary" onClick={() => setStep("form")} style={{ width: "100%", marginTop: "8px" }}>← Adjust and resubmit</button>
              )}
            </>
          )}

          {step === "saving" && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="loading-icon">🍃</div>
              <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355", marginTop: "20px" }}>Publishing your recipe…<br />generating photo</p>
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "20px" }}>🎉</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "700", color: "#1e1609", marginBottom: "12px" }}>Your recipe is live!</h2>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#8a7355", lineHeight: 1.6, marginBottom: "32px" }}>
                It's now visible on Culirated — with a fresh food photo and AI quality badge.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href={`/recipe/${savedId}`} style={{ textDecoration: "none" }}>
                  <button className="btn-primary" style={{ width: "auto", padding: "12px 24px" }}>View my recipe →</button>
                </a>
                <button className="btn-secondary" onClick={() => { setStep("form"); setName(""); setRecipe(""); setResult(null); }}>Submit another</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
