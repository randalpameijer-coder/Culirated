import StaticPageClient from "../StaticPageClient";

function ContactContent() {
  return (
    <>
      <div className="label">CONTACT</div>
      <h1>Get in touch.</h1>
      <p style={{ fontSize: "18px", color: "#6b5840", lineHeight: "1.7", marginBottom: "48px" }}>Questions, feedback, collaboration or found a bug? We would love to hear from you.</p>
      <div className="card">
        <div className="card-icon">&#x2709;&#xFE0F;</div>
        <div>
          <div className="card-title">Email</div>
          <div className="card-body">
            <p style={{ marginBottom: "8px" }}>For all questions and feedback:</p>
            <a href="mailto:culirated@gmail.com">culirated@gmail.com</a>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-icon">&#x1F91D;</div>
        <div>
          <div className="card-title">Collaboration and partnerships</div>
          <div className="card-body">
            <p>Interested in a collaboration, integration or partnership? Send us an email and we will get back to you as soon as possible.</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-icon">&#x1F41B;</div>
        <div>
          <div className="card-title">Found a bug?</div>
          <div className="card-body">
            <p>Describe what is wrong, which page it is on and what you expected to see. We will fix it as soon as possible.</p>
          </div>
        </div>
      </div>
      <hr className="divider" />
      <p style={{ color: "#8a7355", fontFamily: "monospace", fontSize: "13px" }}>We typically respond within 1-2 business days.</p>
    </>
  );
}

export default function ContactPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; font-family: Georgia, serif; color: #1e1609; }
        .content { max-width: 720px; margin: 0 auto; padding: clamp(48px, 8vw, 96px) clamp(16px, 4vw, 48px); }
        h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 12px; }
        h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; margin-top: 40px; color: #1e1609; }
        p { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 16px; }
        .label { font-family: monospace; font-size: 12px; color: #e8581a; letter-spacing: 2px; margin-bottom: 16px; }
        .divider { border: none; border-top: 1px solid rgba(180,160,120,0.2); margin: 40px 0; }
        a { color: #2d5a27; }
        .card { background: #faf8f3; border-radius: 20px; padding: 32px; border: 1px solid rgba(180,160,120,0.2); margin-bottom: 20px; display: flex; gap: 24px; align-items: flex-start; }
        .card-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
        .card-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #1e1609; }
        .card-body { font-size: 15px; color: #6b5840; line-height: 1.7; }
        .card-body a { color: #e8581a; text-decoration: none; font-weight: 600; }
        .translated-content h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 12px; }
        .translated-content h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; margin-top: 40px; }
        .translated-content p { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 16px; }
        .translated-content hr { border: none; border-top: 1px solid rgba(180,160,120,0.2); margin: 40px 0; }
        .translated-content a { color: #2d5a27; }
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
        <StaticPageClient page="contact">
          <ContactContent />
        </StaticPageClient>
      </div>
      <footer style={{ borderTop: "1px solid rgba(180,160,120,0.2)", padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 48px)", textAlign: "center" }}>
        <a href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none" }}>Back to Culirated</a>
      </footer>
    </>
  );
}
