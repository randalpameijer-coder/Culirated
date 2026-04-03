import StaticPageClient from "../StaticPageClient";

function PrivacyContent() {
  return (
    <>
      <div className="label">PRIVACY POLICY</div>
      <h1>Privacy Policy</h1>
      <div className="date">Last updated: March 2026</div>
      <h2>What we collect</h2>
      <p>Culirated collects as little personal data as possible. Specifically:</p>
      <ul>
        <li>Community photo uploads: photo, optional name and optional tip. No account required.</li>
        <li>Reactions on recipes: anonymous counts, no personal data linked to individuals.</li>
        <li>Analytics data via Google Analytics (anonymised IP, page views, session duration).</li>
      </ul>
      <hr className="divider" />
      <h2>How we use it</h2>
      <ul>
        <li>Photo uploads: display on the recipe page the photo was uploaded to.</li>
        <li>Analytics: understand which recipes are popular and how to improve the site.</li>
      </ul>
      <hr className="divider" />
      <h2>Storage and security</h2>
      <p>All data is stored in Supabase (servers in Frankfurt, EU). Photos are stored in Supabase Storage. We do not use external advertising networks and do not sell data to third parties.</p>
      <hr className="divider" />
      <h2>Cookies</h2>
      <p>Culirated only uses functional cookies (language preference) and Google Analytics cookies. There are no tracking cookies from advertising networks.</p>
      <hr className="divider" />
      <h2>Your rights (GDPR)</h2>
      <p>You have the right to view, correct or delete your data. Contact us at <a href="mailto:culirated@gmail.com">culirated@gmail.com</a> for requests.</p>
      <hr className="divider" />
      <h2>Contact</h2>
      <p>Questions about this privacy policy? Email us at <a href="mailto:culirated@gmail.com">culirated@gmail.com</a>.</p>
    </>
  );
}

export default function PrivacyPage() {
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
        .date { font-family: monospace; font-size: 12px; color: #8a7355; margin-bottom: 48px; }
        .divider { border: none; border-top: 1px solid rgba(180,160,120,0.2); margin: 40px 0; }
        a { color: #2d5a27; }
        .translated-content h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-bottom: 12px; }
        .translated-content h2 { font-size: 22px; font-weight: 700; margin-bottom: 12px; margin-top: 40px; }
        .translated-content p { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 16px; }
        .translated-content ul { margin: 0 0 16px 24px; }
        .translated-content li { font-size: 16px; line-height: 1.8; color: #4a3820; margin-bottom: 6px; }
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
        <StaticPageClient page="privacy">
          <PrivacyContent />
        </StaticPageClient>
      </div>
      <footer style={{ borderTop: "1px solid rgba(180,160,120,0.2)", padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 48px)", textAlign: "center" }}>
        <a href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none" }}>Back to Culirated</a>
      </footer>
    </>
  );
}
