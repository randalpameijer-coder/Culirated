import StaticPageClient from "../StaticPageClient";

function AboutContent() {
  return (
    <>
      <div className="label">ABOUT</div>
      <h1>Fresh every day. AI every day.</h1>
      <p>Culirated is a recipe platform with one difference: all recipes are generated daily by AI. No user submissions, no editorial team, no dusty database. Every day 24 fresh recipes — trend-driven, seasonal, quality-checked.</p>
      <div className="stat-row">
        <div className="stat"><div className="stat-n">24/day</div><div className="stat-l">New recipes</div></div>
        <div className="stat"><div className="stat-n">20+</div><div className="stat-l">Languages</div></div>
        <div className="stat"><div className="stat-n">80+</div><div className="stat-l">Min. AI score</div></div>
      </div>
      <hr className="divider" />
      <h2>How it works</h2>
      <p>Every day, AI searches for what is trending per category — from breakfast to BBQ, from vegetarian to gluten-free. Based on that it generates a complete recipe: ingredients, steps, prep time and calories. The recipe then goes through an independent AI quality check on completeness, ratios and logic. Score below 80? Not published.</p>
      <hr className="divider" />
      <h2>The community</h2>
      <p>The community is the real quality check. People cook the recipes, upload their photos and share their verdict. That way you know not just that the recipe is mathematically sound — but whether it actually works in practice and tastes good.</p>
      <hr className="divider" />
      <h2>Transparency</h2>
      <p>All recipes on Culirated are AI-generated. We do not hide that — it is on every page. We always show the AI score so you know how the recipe was evaluated. Dietary labels (like gluten-free or vegan) are AI-assessed — always check the packaging if in doubt.</p>
      <hr className="divider" />
      <div style={{ background: "#1e1609", borderRadius: "20px", padding: "40px", textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "700", color: "#e8dfc8", marginBottom: "12px" }}>Questions or feedback?</div>
        <p style={{ color: "#8a7355", fontSize: "15px", marginBottom: "24px" }}>We would love to hear from you.</p>
        <a href="/contact" style={{ textDecoration: "none" }}><button style={{ background: "#e8581a", color: "#fff", border: "none", borderRadius: "24px", padding: "13px 28px", fontFamily: "monospace", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>Get in touch</button></a>
      </div>
    </>
  );
}

export default function AboutPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; font-family: Georgia, serif; color: #1e1609; }
        .content { max-width: 720px; margin: 0 auto; padding: clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px); }
        h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 12px; }
        h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; margin-top: 40px; color: #1e1609; }
        p { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 16px; }
        ul { margin: 0 0 16px 24px; }
        li { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 6px; }
        .label { font-family: monospace; font-size: 12px; color: #e8581a; letter-spacing: 2px; margin-bottom: 16px; }
        .divider { border: none; border-top: 1px solid rgba(180,160,120,0.2); margin: 40px 0; }
        a { color: #2d5a27; }
        .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 40px 0; }
        .stat { background: #faf8f3; border-radius: 16px; padding: 24px; border: 1px solid rgba(180,160,120,0.2); text-align: center; }
        .stat-n { font-size: 32px; font-weight: 700; color: #1e1609; margin-bottom: 4px; }
        .stat-l { font-family: monospace; font-size: 11px; color: #8a7355; }
        .translated-content h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 12px; }
        .translated-content h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; margin-top: 40px; }
        .translated-content p { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 16px; }
        .translated-content ul { margin: 0 0 16px 24px; }
        .translated-content li { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 6px; }
        .translated-content hr { border: none; border-top: 1px solid rgba(180,160,120,0.2); margin: 40px 0; }
        @media (max-width: 600px) { .stat-row { grid-template-columns: 1fr; } }
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
        <StaticPageClient page="about">
          <AboutContent />
        </StaticPageClient>
      </div>
      <footer style={{ borderTop: "1px solid rgba(180,160,120,0.2)", padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 48px)", textAlign: "center" }}>
        <a href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none" }}>Back to Culirated</a>
      </footer>
    </>
  );
}
