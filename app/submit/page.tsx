"use client";

import { useState } from "react";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSubmit() {
    if (!name.trim() || !recipe.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, recipe }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ approved: false, feedback: "Something went wrong. Please try again." });
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; }
        .submit-wrap { min-height: 100vh; background: #f5f0e8; padding: 48px 24px; }
        .submit-card { max-width: 680px; margin: 0 auto; background: #faf8f3; border-radius: 24px; padding: 48px; border: 1px solid rgba(180,160,120,0.2); }
        .back-link { display: inline-flex; align-items: center; gap: 8px; font-family: monospace; font-size: 13px; color: #6b5840; margin-bottom: 40px; cursor: pointer; text-decoration: none; }
        .logo { font-family: Georgia, serif; font-weight: 900; font-size: 20px; color: #1e1609; }
        h1 { font-family: Georgia, serif; font-size: 38px; font-weight: 700; color: #1e1609; line-height: 1.1; margin-bottom: 12px; }
        .sub { font-family: Georgia, serif; color: #8a7355; font-size: 16px; line-height: 1.6; margin-bottom: 40px; }
        label { display: block; font-family: monospace; font-size: 12px; color: #6b5840; letter-spacing: 0.8px; margin-bottom: 8px; }
        input, textarea { width: 100%; background: #f5f0e8; border: 1px solid rgba(180,160,120,0.3); border-radius: 12px; padding: 14px 16px; font-family: Georgia, serif; font-size: 15px; color: #1e1609; outline: none; transition: border-color 0.2s; }
        input:focus, textarea:focus { border-color: #4a7a3d; background: #fff; }
        textarea { min-height: 260px; resize: vertical; line-height: 1.6; }
        .field { margin-bottom: 24px; }
        .hint { font-family: monospace; font-size: 11px; color: #b8a882; margin-top: 6px; }
        .submit-btn { width: 100%; background: #3a7a32; color: #e8f5e4; border: none; border-radius: 24px; padding: 16px; font-family: monospace; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 8px; transition: background 0.2s; }
        .submit-btn:hover { background: #2d5a27; }
        .submit-btn:disabled { background: #a0c8a0; cursor: not-allowed; }
        .loading { text-align: center; padding: 40px 0; }
        .loading-icon { font-size: 32px; animation: spin 1.5s linear infinite; display: inline-block; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loading-text { font-family: monospace; font-size: 13px; color: #8a7355; margin-top: 16px; }
        .result { border-radius: 16px; padding: 32px; margin-top: 32px; }
        .result-approved { background: rgba(74,122,61,0.08); border: 1px solid rgba(74,122,61,0.25); }
        .result-rejected { background: rgba(180,60,40,0.06); border: 1px solid rgba(180,60,40,0.2); }
        .result-icon { font-size: 36px; margin-bottom: 12px; }
        .result-title { font-family: Georgia, serif; font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .result-approved .result-title { color: #2d5a27; }
        .result-rejected .result-title { color: #8b3020; }
        .result-score { font-family: monospace; font-size: 13px; color: #6b5840; margin-bottom: 16px; }
        .result-feedback { font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #4a3820; }
        .criteria-list { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
        .criteria-item { display: flex; align-items: flex-start; gap: 10px; font-family: monospace; font-size: 12px; color: #6b5840; }
        .try-again { display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; font-family: monospace; font-size: 13px; color: #3a7a32; cursor: pointer; background: none; border: none; padding: 0; }
        .ai-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(74,122,61,0.1); border-radius: 20px; padding: 6px 14px; font-family: monospace; font-size: 11px; color: #2d5a27; margin-bottom: 32px; }
        @media (max-width: 600px) {
          .submit-card { padding: 28px 20px; }
          h1 { font-size: 28px; }
        }
      `}</style>

      <div className="submit-wrap">
        <div className="submit-card">
          <a href="/" className="back-link">← <span className="logo">Culirated</span></a>

          <div className="ai-badge">✦ AI checks your recipe automatically</div>

          <h1>Submit your recipe.</h1>
          <p className="sub">Write or paste your recipe below. AI will check it immediately — you get feedback within seconds.</p>

          {!result && !loading && (
            <>
              <div className="field">
                <label>YOUR NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Marco V."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label>YOUR RECIPE</label>
                <textarea
                  placeholder={`Paste or write your recipe here. For example:\n\nPasta Carbonara (4 persons)\n\nIngredients:\n- 400g spaghetti\n- 200g pancetta\n- 4 egg yolks\n- 100g Pecorino Romano\n- Black pepper\n\nSteps:\n1. Cook pasta al dente...\n2. Fry pancetta...\n3. Mix egg yolks with cheese...`}
                  value={recipe}
                  onChange={e => setRecipe(e.target.value)}
                />
                <p className="hint">Text, ingredients and steps. The more detail, the better the AI can judge.</p>
              </div>
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!name.trim() || !recipe.trim()}
              >
                ✦ Submit Recipe — AI checks it now
              </button>
            </>
          )}

          {loading && (
            <div className="loading">
              <div className="loading-icon">✦</div>
              <p className="loading-text">AI is checking your recipe…<br />checking completeness, ratios and logic</p>
            </div>
          )}

          {result && (
            <div className={`result ${result.approved ? "result-approved" : "result-rejected"}`}>
              <div className="result-icon">{result.approved ? "🟢" : "🔴"}</div>
              <div className="result-title">
                {result.approved ? "Approved! Your recipe goes live." : "Not approved yet."}
              </div>
              {result.score && (
                <div className="result-score">AI Score: {result.score}/100</div>
              )}
              <div className="result-feedback">{result.feedback}</div>
              {result.criteria && (
                <div className="criteria-list">
                  {result.criteria.map((c: any, i: number) => (
                    <div key={i} className="criteria-item">
                      <span>{c.passed ? "✅" : "❌"}</span>
                      <span><strong>{c.name}:</strong> {c.comment}</span>
                    </div>
                  ))}
                </div>
              )}
              {!result.approved && (
                <button className="try-again" onClick={() => setResult(null)}>
                  ← Adjust and resubmit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
