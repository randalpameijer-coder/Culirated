import StaticPageClient from "../StaticPageClient";

const steps = [
  { n: "1", title: "Trending search", body: "Every day, AI searches what is trending per category — ingredients, seasonal dishes, viral recipes. This ensures Culirated always reflects what people actually want to cook right now." },
  { n: "2", title: "Recipe generation", body: "Claude generates a complete, publishable recipe: a title, description, ingredient list with exact quantities, step-by-step instructions, prep time, calories, servings and difficulty level." },
  { n: "3", title: "Independent quality check", body: "A separate AI call with a strict reviewer persona checks the recipe on 8 criteria: completeness, ratios, cooking logic, prep time accuracy, food safety, diet label accuracy, ingredient availability and originality. Score below 80? Not published, retry." },
  { n: "4", title: "Food photo", body: "DALL-E 3 generates a professional food photo for each approved recipe. The image is stored permanently in Culirated storage — not a link to an external service." },
  { n: "5", title: "Translation into 20+ languages", body: "The approved recipe is immediately translated into 20+ languages: Dutch, German, French, Spanish, Italian, Portuguese, Polish, Russian, Japanese, Chinese, Korean, Arabic and more. Each language gets its own URL for international SEO." },
  { n: "6", title: "Goes live", body: "The recipe is published automatically — categorised, searchable, available in 20+ languages. No human editorial step needed." },
  { n: "7", title: "You cook it", body: "The community picks recipes, cooks them at home, and uploads photos. Tips, variations and reactions — that is the real quality validation." },
];

function HowItWorksContent() {
  return (
    <>
      <div className="label">HOW IT WORKS</div>
      <h1>From trending to table.</h1>
      <p style={{ fontSize: "18px", color: "#6b5840", lineHeight: "1.7", marginBottom: "56px" }}>Every day, 7 steps. Fully automatic.</p>
      {steps.map((s, i) => (
        <div key={s.n}>
          <div className="step">
            <div className={`step-num ${s.n === "7" ? "orange" : ""}`}>{s.n}</div>
            <div className="step-body">
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: s.n === "7" ? "#e8581a" : "#8a7355", marginBottom: "6px", letterSpacing: "1px" }}>STEP {s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-text">{s.body}</div>
            </div>
          </div>
          {i < steps.length - 1 && <div className="connector" />}
        </div>
      ))}
      <div style={{ marginTop: "64px", background: "linear-gradient(135deg,#2d5a27,#1a3d16)", borderRadius: "20px", padding: "40px", textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "700", color: "#e8f5e4", marginBottom: "16px" }}>Ready to cook?</div>
        <a href="/recipes" style={{ textDecoration: "none" }}><button style={{ background: "#e8581a", color: "#fff", border: "none", borderRadius: "24px", padding: "13px 28px", fontFamily: "monospace", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>Browse recipes</button></a>
      </div>
    </>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; font-family: Georgia, serif; color: #1e1609; }
        .content { max-width: 720px; margin: 0 auto; padding: clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px); }
        h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 12px; }
        p { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 16px; }
        .label { font-family: monospace; font-size: 12px; color: #e8581a; letter-spacing: 2px; margin-bottom: 16px; }
        a { color: #2d5a27; }
        .step { display: flex; gap: 24px; margin-bottom: 40px; align-items: flex-start; }
        .step-num { min-width: 48px; height: 48px; border-radius: 50%; background: #1e1609; color: #e8dfc8; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-size: 17px; font-weight: 700; flex-shrink: 0; }
        .step-num.orange { background: #e8581a; }
        .step-body { padding-top: 8px; }
        .step-title { font-size: 20px; font-weight: 700; color: #1e1609; margin-bottom: 8px; }
        .step-text { font-size: 16px; color: #4a3820; line-height: 1.75; }
        .connector { width: 2px; height: 28px; background: rgba(180,160,120,0.3); margin: 4px 0 4px 23px; }
        .translated-content h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 12px; }
        .translated-content h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; margin-top: 40px; }
        .translated-content p { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 16px; }
        .translated-content hr { border: none; border-top: 1px solid rgba(180,160,120,0.2); margin: 40px 0; }
      `}</style>
      <div style={{ background: "#1e1609", padding: "8px 16px", textAlign: "center" }}>
        <span style={{ color: "#c8b080", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px" }}>
          AI CREATES THE RECIPE  ·  YOU COOK IT  ·  COMMUNITY RATES
        </span>
      </div>
      <nav style={{ background: "rgba(245,240,232,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(180,160,120,0.25)", padding: "0 clamp(16px, 4vw, 48px)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", height: "60px", gap: "16px" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>&#x1F33F;</div>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "20px", color: "#1e1609" }}>Culirated</span>
          </a>
          <a href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none" }}>Back to Culirated</a>
        </div>
      </nav>
      <div className="content">
        <StaticPageClient page="how-it-works">
          <HowItWorksContent />
        </StaticPageClient>
      </div>
      <footer style={{ borderTop: "1px solid rgba(180,160,120,0.2)", padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 48px)", textAlign: "center" }}>
        <a href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none" }}>Back to Culirated</a>
      </footer>
    </>
  );
}
