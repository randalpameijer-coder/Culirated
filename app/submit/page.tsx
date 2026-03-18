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

  const lang = typeof navigator !== "undefined" ? navigator.language : "en";
  const isNL = lang.startsWith("nl");
  const isDE = lang.startsWith("de");
  const isFR = lang.startsWith("fr");

  const ui = {
    approved: isNL ? "Ziet er goed uit!" : isDE ? "Sieht gut aus!" : isFR ? "C'est bon!" : "Looks good!",
    notApproved: isNL ? "Al aanwezig." : isDE ? "Bereits vorhanden." : isFR ? "Déjà présent." : "Already exists.",
    notApprovedGeneral: isNL ? "Nog niet goedgekeurd." : isDE ? "Noch nicht genehmigt." : isFR ? "Pas encore approuvé." : "Not approved yet.",
    qualityCheck: isNL ? "Kwaliteitscheck" : isDE ? "Qualitätsprüfung" : isFR ? "Contrôle qualité" : "Quality check",
    titleSuggestion: isNL ? "✦ Titelvoorstel" : isDE ? "✦ Titelvorschlag" : isFR ? "✦ Suggestion de titre" : "✦ Title suggestion",
    titleQ: isNL ? "AI stelt een beter vindbare titel voor. Welke verkies je?" : isDE ? "KI schlägt einen besser auffindbaren Titel vor." : isFR ? "L'IA suggère un titre plus facile à trouver." : "AI suggests a more findable title. Which do you prefer?",
    keepMine: isNL ? "Mijn versie houden" : isDE ? "Meine behalten" : isFR ? "Garder la mienne" : "Keep mine",
    correctionApplied: isNL ? "⚠️ Correctie toegepast" : isDE ? "⚠️ Korrektur angewendet" : isFR ? "⚠️ Correction appliquée" : "⚠️ Correction applied",
    whatNext: isNL ? "WAT GEBEURT ER NU" : isDE ? "WAS PASSIERT ALS NÄCHSTES" : isFR ? "CE QUI SE PASSE ENSUITE" : "WHAT HAPPENS NEXT",
    whatNextText: isNL ? "Jouw recept gaat meteen live. Een professionele foodfoto wordt automatisch gegenereerd. Het recept blijft van jou." : isDE ? "Dein Rezept wird sofort veröffentlicht. Ein professionelles Foodfoto wird automatisch generiert." : isFR ? "Votre recette est publiée immédiatement avec une photo générée automatiquement." : "Your recipe goes live immediately with a professional food photo generated automatically.",
    publish: isNL ? "✦ Publiceer mijn recept →" : isDE ? "✦ Rezept veröffentlichen →" : isFR ? "✦ Publier ma recette →" : "✦ Publish my recipe →",
    adjust: isNL ? "← Aanpassen en opnieuw insturen" : isDE ? "← Anpassen und erneut einreichen" : isFR ? "← Ajuster et resoumettre" : "← Adjust and resubmit",
    publishing: isNL ? "Recept publiceren…\nfoto genereren" : isDE ? "Rezept veröffentlichen…\nFoto generieren" : isFR ? "Publication de la recette…\ngénération de la photo" : "Publishing your recipe…\ngenerating photo",
    live: isNL ? "Jouw recept staat live!" : isDE ? "Dein Rezept ist live!" : isFR ? "Votre recette est en ligne!" : "Your recipe is live!",
    liveText: isNL ? "Het staat nu op Culirated — met een verse foodfoto en AI-kwaliteitsbadge." : isDE ? "Es ist jetzt auf Culirated — mit einem frischen Foodfoto und KI-Qualitätsabzeichen." : isFR ? "Il est maintenant sur Culirated — avec une photo et un badge qualité IA." : "It's now visible on Culirated — with a fresh food photo and AI quality badge.",
    view: isNL ? "Bekijk mijn recept →" : isDE ? "Mein Rezept ansehen →" : isFR ? "Voir ma recette →" : "View my recipe →",
    submitAnother: isNL ? "Nog een recept insturen" : isDE ? "Ein weiteres Rezept einreichen" : isFR ? "Soumettre une autre recette" : "Submit another",
  };

  async function handleSubmit() {
    if (!name.trim() || !recipe.trim()) return;
    setStep("analysing");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, recipe, lang: navigator.language }),
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
          name, recipe, confirm: true, lang: navigator.language,
          confirmedTitle: finalTitle,
          confirmedDescription: result.suggestions?.description?.improved || "",
          confirmedIngredients: result.corrections?.ingredients || [],
          confirmedSteps: result.corrections?.steps || [],
          prep_time: result.corrections?.prep_time_fixed ? result.corrections.corrected_prep_time : result.meta?.prep_time,
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
                    {result.approved ? ui.approved : (result.duplicate ? ui.notApproved : ui.notApprovedGeneral)}
                  </div>
                  {result.score && <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", marginTop: "4px" }}>AI Score: {result.score}/100</div>}
                </div>
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#4a3820", lineHeight: 1.65, marginBottom: "28px" }}>{result.feedback}</p>

              {result.criteria && (
                <div className="section">
                  <div className="section-title">{ui.qualityCheck}</div>
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
                      <div className="section-title">{ui.titleSuggestion}</div>
                      <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#8a7355", marginBottom: "12px" }}>{ui.titleQ}</p>
                      <div className="toggle-row">
                        <button className={`toggle-btn ${useImprovedTitle ? "active" : ""}`} onClick={() => setUseImprovedTitle(true)}>✦ {result.suggestions.title.improved}</button>
                        <button className={`toggle-btn ${!useImprovedTitle ? "active" : ""}`} onClick={() => setUseImprovedTitle(false)}>{ui.keepMine}: {result.suggestions.title.original}</button>
                      </div>
                    </div>
                  )}

                  {(result.corrections?.ratios_fixed || result.corrections?.prep_time_fixed) && (
                    <div className="section">
                      <div className="section-title">{ui.correctionApplied}</div>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#4a3820", lineHeight: 1.6, marginBottom: "12px" }}>{result.corrections.what_was_fixed}</p>
                      {result.corrections.prep_time_fixed && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(180,120,20,0.06)", borderRadius: "10px", padding: "10px 14px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#8b5a14" }}>
                            ⏱ {result.corrections.original_prep_time} → <strong>{result.corrections.corrected_prep_time} min</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ background: "rgba(74,122,61,0.06)", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", border: "1px solid rgba(74,122,61,0.15)" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#2d5a27", letterSpacing: "1px", marginBottom: "8px" }}>{ui.whatNext}</div>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#4a3820", lineHeight: 1.65 }}>{ui.whatNextText}</p>
                  </div>
                  <button className="btn-primary" onClick={handleConfirm}>{ui.publish}</button>
                </>
              )}

              {!result.approved && (
                <button className="btn-secondary" onClick={() => setStep("form")} style={{ width: "100%", marginTop: "8px" }}>{ui.adjust}</button>
              )}
            </>
          )}

          {step === "saving" && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="loading-icon">🍃</div>
              <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355", marginTop: "20px", whiteSpace: "pre-line" }}>{ui.publishing}</p>
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "20px" }}>🎉</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "700", color: "#1e1609", marginBottom: "12px" }}>{ui.live}</h2>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#8a7355", lineHeight: 1.6, marginBottom: "32px" }}>{ui.liveText}</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href={`/recipe/${savedId}`} style={{ textDecoration: "none" }}>
                  <button className="btn-primary" style={{ width: "auto", padding: "12px 24px" }}>{ui.view}</button>
                </a>
                <button className="btn-secondary" onClick={() => { setStep("form"); setName(""); setRecipe(""); setResult(null); }}>{ui.submitAnother}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
