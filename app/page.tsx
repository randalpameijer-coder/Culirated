"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function detectLocalLang(): string {
  if (typeof document === "undefined") return "en";
  // Lees taal uit cookie (gezet door middleware via Accept-Language header)
  const cookie = document.cookie.split(";").find(c => c.trim().startsWith("culirated_lang="));
  if (cookie) {
    const val = cookie.split("=")[1]?.trim();
    const supported = ["en","nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];
    if (val && supported.includes(val)) return val;
  }
  // Fallback: navigator.language
  const b = (navigator.language || "en").split("-")[0].toLowerCase();
  return ["nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"].includes(b) ? b : "en";
}

const LOCAL_NAMES: Record<string, string> = {
  nl: "🇳🇱 Nederlands", de: "🇩🇪 Deutsch", fr: "🇫🇷 Français",
  es: "🇪🇸 Español", it: "🇮🇹 Italiano", pt: "🇵🇹 Português",
  pl: "🇵🇱 Polski", ru: "🇷🇺 Русский", ja: "🇯🇵 日本語",
  zh: "🇨🇳 中文", ko: "🇰🇷 한국어", ar: "🇸🇦 العربية",
  tr: "🇹🇷 Türkçe", sv: "🇸🇪 Svenska", da: "🇩🇰 Dansk",
  no: "🇳🇴 Norsk", hi: "🇮🇳 हिन्दी", id: "🇮🇩 Bahasa",
  th: "🇹🇭 ภาษาไทย",
};

const T: Record<string, any> = {
  en: {
    topbar: "🤖 AI CREATES THE RECIPE  \u00b7  👨‍🍳 YOU COOK IT  \u00b7  ✨ COMMUNITY RATES",
    nav: ["Discover", "Categories", "Trending", "Season", "Challenges"],
    search: "Search recipes",
    badge: "AI-GENERATED \u00b7 COMMUNITY TESTED",
    h1a: "Cook what", h1b: "AI dreams up.",
    sub: "Every day, AI generates 24 new recipes \u2014 trending-driven, quality-checked. Your job: pick one, cook it, and rate it. The community decides what's worth making.",
    generateLabel: "AI CREATES", generateText: "24 fresh recipes every day \u2014 trending-driven, seasonal, quality-checked.",
    checkLabel: "YOU COOK", checkText: "Pick a recipe, make it at home. Photos, tips, variations all welcome.",
    liveLabel: "COMMUNITY RATES", liveText: "Reactions & scores \u2014 the best rise to the top",
    btnDiscover: "See today's recipes ", btnHow: "This week's challenge",
    stats: [["24/day", "New recipes"], ["20+", "Languages"], ["100%", "AI-generated"]],
    aiScoreLabel: "AI SCORE", aiCriteria: ["✓ Completeness", "✓ Ratios", "✓ Logic", "✓ Nutrition"],
    catTitle: "Latest per category", catMore: "All recipes ",
    cats: [
      { name: "Vegetarian", icon: "🥗", url: "/recipes?diet=Vegetarian" }, { name: "Vegan", icon: "🌱", url: "/recipes?diet=Vegan" },
      { name: "Gluten-free", icon: "🌾", url: "/recipes?diet=Gluten-free" }, { name: "Italian", icon: "🍝", url: "/recipes?cuisine=Italian" },
      { name: "Asian", icon: "🍜", url: "/recipes?cuisine=Asian" }, { name: "Mediterranean", icon: "🫒", url: "/recipes?cuisine=Mediterranean" },
      { name: "Quick", icon: "⚡", url: "/recipes?time=%3C+30+min" }, { name: "High-protein", icon: "💪", url: "/recipes?diet=High-protein" },
    ],
    gridTitle: "Today's AI Recipes", gridSub: "Fresh from the AI kitchen \u2014 cook one and rate it",
    filters: ["Newest", "Top Rated"], loadMore: "Load more recipes",
    howLabel: " HOW IT WORKS", howH2a: "AI creates.", howH2b: "You cook it.",
    howSub: "No human submissions. AI generates fresh recipes daily based on what's trending. The community cooks them, rates them, and decides what's actually worth making.",
    generateCard: ["🤖", "AI CREATES", "Trending-driven, quality-checked before going live. 24 new recipes every day."],
    checkCard: ["👨‍🍳", "YOU COOK IT", "Pick a recipe, make it, share your result. The community votes on the best versions."],
    steps: [
      ["1", "🔍", "Trending search", "AI searches what's trending per category \u2014 ingredients, cuisines, seasonal topics."],
      ["2", "", "Recipe generation", "Claude generates a complete recipe: ingredients, steps, prep time, calories."],
      ["3", "📊", "Quality check", "Ratios, completeness, logic verified. Score below 80? Not published."],
      ["4", "🌍", "Goes live", "Approved recipes go live automatically \u2014 categorised, searchable, in 20+ languages."],
      ["5", "👨‍🍳", "Your turn", "Think you can do better? Cook it, tweak it, improve it. Post your version with #culirated and show the AI how it's really done."],
    ],
    stepWord: "STEP",
    challengeLabel: "THIS WEEK'S CHALLENGE",
    challengeH2: "AI made it. Now you make it better.",
    challengeSub: "Pick this week's featured recipe, cook it your way, and share your result. The community votes on the best versions.",
    challengeBtn: "Join the challenge",
    makeIt: "Make this",
    navCats: {
      diet: "Diet", time: "Time", cuisine: "Cuisine", meal: "Meal", level: "Level",
      dietItems: ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "High-protein", "Low-carb", "Keto", "Pescatarian"],
      timeItems: ["< 15 min", "< 30 min", "< 45 min", "< 1 hour", "Weekend"],
      cuisineItems: ["Italian", "Asian", "Mexican", "Indian", "Mediterranean", "Middle Eastern", "French", "Greek", "Japanese", "Chinese", "Thai", "American", "Vietnamese", "Korean", "North African"],
      mealItems: ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Salad", "Starter", "Side dish"],
      levelItems: ["Easy", "Medium", "Advanced"],
    },
    share: "Share", copyLink: "Copy link",
    footerLinks: ["About", "How it works", "Privacy", "Terms", "Contact"],
    footerTag: "AI creates \u00b7 You cook \u00b7 Community rates",
    disclaimer: "Recipes on Culirated are AI-generated and quality-checked before publication. Always follow food safety guidelines when preparing and storing food. Culirated is not liable for errors in recipes. Stated dietary labels (e.g. gluten-free, vegan) are AI-assessed \u2014 always verify with product packaging if you have allergies.",
    aiChecked: "AI generated",
    catL: { meast: "Middle Eastern", ital: "Italian", asian: "Asian", bake: "Baking", fus: "Fusion" },
    tagL: { prot: "High-protein", gf: "Gluten-free", veg: "Vegetarian", quick: "Quick", wknd: "Weekend", vegan: "Vegan" },
  },
};

// In-memory translation cache
const translationCache: Record<string, any> = { en: null };

function getNavCats(t: any) {
  const nc = t.navCats || {};
  return [
    { label: nc.diet || "Diet", icon: "🥗", items: nc.dietItems || ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "High-protein", "Low-carb", "Keto", "Pescatarian"] },
    { label: nc.time || "Time", icon: "⏰", items: nc.timeItems || ["< 15 min", "< 30 min", "< 45 min", "< 1 hour", "Weekend"] },
    { label: nc.cuisine || "Cuisine", icon: "🌍", items: nc.cuisineItems || ["Italian", "Asian", "Mexican", "Indian", "Mediterranean", "Middle Eastern", "French", "Greek", "Japanese", "Chinese", "Thai", "American", "Vietnamese", "Korean", "North African"] },
    { label: nc.meal || "Meal", icon: "🍽️", items: nc.mealItems || ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Salad", "Starter", "Side dish"] },
    { label: nc.level || "Level", icon: "◆", items: nc.levelItems || ["Easy", "Medium", "Advanced"] },
  ];
}

export default function Home() {
  const [lang, setLang] = useState<string | null>(null);
  // browserLang = echte browsertaal, altijd via navigator \u2014 nooit de cookie
  const [browserLang] = useState<string>(() => {
    if (typeof navigator === "undefined") return "en";
    const b = (navigator.language || "en").split("-")[0].toLowerCase();
    const supported = ["nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];
    return supported.includes(b) ? b : "en";
  });
  const [t, setT] = useState<any>(T.en);
  const [translating, setTranslating] = useState(true);
  const [activeNav, setActiveNav] = useState("");
  const [latestByCat, setLatestByCat] = useState<any[]>([]);
  const [heroRecipe, setHeroRecipe] = useState<any>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const savedLang = detectLocalLang();
    // Probeer vertaling direct uit localStorage te laden
    const savedT = localStorage.getItem(`culirated_t_v5_${savedLang}`);
    // Clear old v3 cache if present
    try { localStorage.removeItem(`culirated_t_${savedLang}`); try { localStorage.removeItem(`culirated_t_v4_${savedLang}`); } catch {}; } catch {}
    if (savedLang === "en") {
      setTranslating(false);
    } else if (savedT) {
      try {
        const parsed = JSON.parse(savedT);
        translationCache[savedLang] = parsed;
        setT(parsed);
        setTranslating(false);
      } catch {
        // parse fout: laat API het oplossen
      }
    }
    setLang(savedLang);
  }, []);

  function changeLang(l: string) {
    document.cookie = `culirated_lang=${l};max-age=${60*60*24*365};path=/;samesite=lax`;
    window.location.reload();
  }

  useEffect(() => {
    if (lang === null) return;
    if (lang === "en") {
      setT(T.en);
      setTranslating(false);
      return;
    }
    if (translationCache[lang]) {
      setT(translationCache[lang]);
      setTranslating(false);
      return;
    }
// Direct Supabase — geen API tussenlaag, 1 netwerkstap
    supabase
      .from("ui_translations")
      .select("strings")
      .eq("lang", lang)
      .single()
      .then(({ data, error }) => {
        if (!error && data?.strings) {
          translationCache[lang] = data.strings;
          try { localStorage.setItem(`culirated_t_v5_${lang}`, JSON.stringify(data.strings)); } catch {}
          setT(data.strings);
        } else {
          setT(T.en);
        }
        setTranslating(false);
      });
  }, [lang]);

  const isEN = lang === "en";
  const isNL = lang === "nl";
  const isDE = lang === "de";
  const isFR = lang === "fr";

  useEffect(() => {
    async function fetchLatestRecipes(currentLang: string) {
      // 8 meest recente recepten ongeacht categorie
      const { data: recipes } = await supabase
        .from("recipes")
        .select("id, title, prep_time, ai_score, image_url")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(8);

      if (!recipes?.length) { setLatestByCat([]); return; }

      // Haal slugs op voor de huidige taal
      const ids = recipes.map((r: any) => r.id);
      const { data: slugData } = await supabase
        .from("recipe_translations")
        .select("recipe_id, slug")
        .eq("lang", currentLang)
        .in("recipe_id", ids);

      const slugMap: Record<string, string> = {};
      (slugData || []).forEach((s: any) => { slugMap[s.recipe_id] = s.slug; });

      const withSlugs = recipes.map((r: any) => ({
        label: r.ai_score?.cuisine || r.ai_score?.course || "",
        icon: "",
        link: `/recept/${currentLang}/${slugMap[r.id] || ""}`,
        recipe: { ...r, slug: slugMap[r.id] || null, lang: currentLang },
      }));

      setLatestByCat(withSlugs);

      // Hero: hoogste AI score van de afgelopen 7 dagen
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: topRecipes } = await supabase
        .from("recipes")
        .select("id, title, ai_score, image_url, created_at")
        .eq("status", "approved")
        .gte("created_at", sevenDaysAgo)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (topRecipes?.length) {
        // Sorteer op score desc, dan created_at desc — bij gelijke score niet het meest recente
        const firstRecipeId = withSlugs[0]?.recipe?.id;
        const sorted = [...topRecipes].sort((a: any, b: any) => {
          const scoreDiff = (b.ai_score?.score || 0) - (a.ai_score?.score || 0);
          if (scoreDiff !== 0) return scoreDiff;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        // Sla het eerste recept in de grid over
        const best = sorted.find((r: any) => r.id !== firstRecipeId) || sorted[0];
        const { data: heroSlug } = await supabase
          .from("recipe_translations")
          .select("slug")
          .eq("recipe_id", best.id)
          .eq("lang", currentLang)
          .single();
        setHeroRecipe({ ...best, slug: heroSlug?.slug || null, lang: currentLang });
      }
    }
    const cookieLang = document.cookie.split(";").find(c => c.trim().startsWith("culirated_lang="))?.split("=")[1]?.trim() || "en";
    fetchLatestRecipes(cookieLang);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const nav = document.getElementById("main-nav");
      if (nav && !nav.contains(e.target as Node)) {
        setActiveNav("");
        setShowShare(false);
      }
    }
    function handleVisibility() {
      if (document.visibilityState === "visible") setActiveNav("");
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (lang === null || translating) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
        <style>{"@keyframes tiktak { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(20deg)} }"}</style>
        <div style={{ fontSize: "80px", display: "inline-block", animation: "tiktak 0.7s ease-in-out infinite", transformOrigin: "50% 10%" }}>⏱️</div>
        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#c8b080", letterSpacing: "6px" }}>• • •</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100vw; }
        body { background: #f5f0e8; font-family: Georgia, serif; color: #1e1609; }

        .hero-grid { display: grid; grid-template-columns: 1fr 440px; gap: 64px; align-items: center; padding: 72px 48px 56px; max-width: 1280px; margin: 0 auto; }
        .hero-images { position: relative; height: 480px; }
        .hero-img-main { position: absolute; top: 20px; right: 0; width: 350px; height: 400px; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 80px rgba(30,22,9,0.25); }
        .hero-img-secondary { position: absolute; bottom: 10px; left: 0; width: 210px; height: 175px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(30,22,9,0.2); border: 4px solid #f5f0e8; }
        .hero-score-card { position: absolute; top: -16px; left: -16px; background: #fff; border-radius: 16px; padding: 16px 20px; box-shadow: 0 12px 32px rgba(30,22,9,0.15); border: 1px solid rgba(180,160,120,0.2); min-width: 145px; z-index: 2; }

        .cats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .recipe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .recipe-card { border-radius: 16px; overflow: hidden; background: #faf8f3; border: 1px solid rgba(180,160,120,0.2); cursor: pointer; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
        .recipe-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(30,22,9,0.12); }
        .recipe-img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; flex-shrink: 0; }
        .recipe-img-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; transition: transform 0.3s; }
        .recipe-card:hover .recipe-img-wrap img { transform: scale(1.04); }
        .make-it-overlay { position: absolute; inset: 0; background: rgba(30,22,9,0); display: flex; align-items: center; justify-content: center; transition: background 0.25s; pointer-events: none; }
        .recipe-card:hover .make-it-overlay { background: rgba(30,22,9,0.42); pointer-events: auto; }
        .make-it-btn { background: #e8581a; color: #fff; border: none; border-radius: 24px; padding: 11px 22px; font-family: monospace; font-size: 13px; font-weight: 600; cursor: pointer; opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s; }
        .recipe-card:hover .make-it-btn { opacity: 1; transform: translateY(0); }
        .recipe-card-title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .how-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1280px; margin: 0 auto; padding: 80px 48px; }
        .cat-nav { max-width: 1280px; margin: 0 auto; padding: 0 48px; display: flex; flex-wrap: wrap; gap: 0; }
        .cat-nav-item { position: relative; }
        @media (max-width: 768px) {
          .cat-nav { padding: 0 12px; flex-wrap: wrap; gap: 2px; }
          .cat-nav-btn { padding: 8px 10px !important; font-size: 11px !important; }
        }
        .nav-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; height: 70px; gap: 24px; padding: 0 48px; }

        @media (max-width: 768px) {
          .nav-inner { padding: 0 16px; gap: 10px; height: 60px; }
          .nav-search { display: none; }
          .nav-share { display: none; }
          .hero-grid { grid-template-columns: 1fr; padding: 28px 16px 36px; gap: 32px; }
          .hero-images { display: none; }
          h1 { font-size: 36px !important; letter-spacing: -1px !important; }
          .ai-strip { flex-direction: column !important; }
          .ai-strip > div { border-right: none !important; border-bottom: 1px solid rgba(180,160,120,0.2); }
          .ai-strip > div:last-child { border-bottom: none; }
          .stats-row { gap: 20px !important; flex-wrap: wrap !important; }
          .cats-grid { grid-template-columns: 1fr; gap: 10px; }
          .cats-pad { padding: 28px 16px !important; }
          .recipe-grid { grid-template-columns: 1fr; }
          .section-pad { padding: 0 16px 48px !important; }
          .how-grid { grid-template-columns: 1fr; gap: 32px; padding: 40px 16px; }
          h2.how-h2 { font-size: 32px !important; }
          .how-cards { flex-direction: column !important; }
          .footer-inner { flex-direction: column; gap: 16px; padding: 28px 16px !important; }
          .footer-links { flex-wrap: wrap; gap: 12px !important; }
          h2.grid-title { font-size: 28px !important; }
          #challenge > div { grid-template-columns: 1fr !important; gap: 24px !important; }
        }

        @media (max-width: 480px) {
          h1 { font-size: 30px !important; }
          .nav-inner { gap: 8px !important; }
          .stats-row > div { flex: 1 1 40%; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f0e8", overflowX: "hidden", maxWidth: "100vw" }}>
        {/* Top bar */}
        <div style={{ background: "#1e1609", padding: "8px 16px", textAlign: "center", overflow: "hidden" }}>
          <span style={{ color: "#c8b080", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px", whiteSpace: "nowrap", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{t.topbar}</span>
        </div>

        {/* Nav */}
        <nav id="main-nav" style={{ background: "rgba(245,240,232,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(180,160,120,0.25)", position: "sticky", top: 0, zIndex: 100 }}>
          <div className="nav-inner" style={{ borderBottom: "1px solid rgba(180,160,120,0.12)" }}>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🌿</div>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "22px", color: "#1e1609" }}>Culirated</span>
            </a>
            <div style={{ flex: 1 }} />
            <div className="nav-search" style={{ position: "relative" }}>
              <input
                placeholder={t.search}
                onKeyDown={e => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) window.location.href = `/recipes?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`; }}
                style={{ background: "rgba(180,160,120,0.12)", border: "1px solid transparent", borderRadius: "24px", padding: "9px 16px 9px 36px", fontFamily: "monospace", fontSize: "12px", color: "#1e1609", outline: "none", width: "200px" }} />
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#8a7355", cursor: "pointer" }}
                onClick={e => { const input = (e.currentTarget.previousElementSibling as HTMLInputElement); if (input?.value.trim()) window.location.href = `/recipes?q=${encodeURIComponent(input.value.trim())}`; }}>🔍</span>
            </div>
            {!isEN && (
              <button onClick={() => changeLang("en")} style={{ flexShrink: 0, background: "rgba(30,22,9,0.05)", border: "1px solid rgba(180,160,120,0.3)", borderRadius: "20px", padding: "7px 14px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: "#4a3820", whiteSpace: "nowrap" }}>🇬🇧 EN</button>
            )}
            {isEN && browserLang !== "en" && (
              <button onClick={() => changeLang(browserLang)} style={{ flexShrink: 0, background: "rgba(30,22,9,0.05)", border: "1px solid rgba(180,160,120,0.3)", borderRadius: "20px", padding: "7px 14px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: "#4a3820", whiteSpace: "nowrap" }}>{LOCAL_NAMES[browserLang]}</button>
            )}
            <div className="nav-share" style={{ position: "relative", flexShrink: 0 }}>
              <button onClick={() => setShowShare(!showShare)} style={{ background: "#e8581a", border: "none", borderRadius: "20px", padding: "10px 16px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: "#fff", whiteSpace: "nowrap", fontWeight: "500" }}>
                📤 {t.share || "Share"}
              </button>
              {showShare && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: "16px", padding: "8px", border: "1px solid rgba(180,160,120,0.2)", boxShadow: "0 12px 40px rgba(30,22,9,0.12)", zIndex: 200, minWidth: "200px" }}>
                  {[
                    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent("Check Culirated \u2014 AI-generated recipes: https://culirated.com")}`, icon: "💬" },
                    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=https://culirated.com`, icon: "👥" },
                    { label: "X / Twitter", href: `https://x.com/intent/tweet?text=${encodeURIComponent("AI-generated recipes, quality-checked daily")}&url=https://culirated.com`, icon: "🐦" },
                    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=https://culirated.com`, icon: "📌" },
                    { label: "Instagram", href: `https://www.instagram.com/`, icon: "📸" },
                    { label: "TikTok", href: `https://www.tiktok.com/`, icon: "🎵" },
                    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=https://culirated.com`, icon: "💼" },
                    { label: "Reddit", href: `https://reddit.com/submit?url=https://culirated.com&title=${encodeURIComponent("Culirated \u2014 AI-generated recipes")}`, icon: "🤖" },
                    { label: "Email", href: `mailto:?subject=${encodeURIComponent("Check Culirated")}&body=https://culirated.com`, icon: "ԣ봩Å" },
                  ].map(b => (
                    <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderRadius: "10px", fontFamily: "monospace", fontSize: "12px", color: "#1e1609", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f5f0e8")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <span style={{ fontSize: "15px" }}>{b.icon}</span> {b.label}
                      </div>
                    </a>
                  ))}
                  <div onClick={() => { navigator.clipboard.writeText("https://culirated.com"); setShowShare(false); }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderRadius: "10px", fontFamily: "monospace", fontSize: "12px", color: "#1e1609", cursor: "pointer", borderTop: "1px solid rgba(180,160,120,0.15)", marginTop: "4px" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f5f0e8")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: "15px" }}>🔗</span> {t.copyLink || "Copy link"}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Category nav */}
          <div className="cat-nav" onClick={e => { if ((e.target as HTMLElement).closest('.cat-nav-item') === null) setActiveNav(""); }}>
            {getNavCats(t).map((cat) => (
              <div key={cat.label} className="cat-nav-item" style={{ position: "relative" }}>
                <button
                  className="cat-nav-btn"
                  onClick={() => setActiveNav(activeNav === cat.label ? "" : cat.label)}
                  style={{ background: activeNav === cat.label ? "rgba(74,122,61,0.08)" : "transparent", border: "none", padding: "12px 14px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: activeNav === cat.label ? "#2d5a27" : "#6b5840", fontWeight: activeNav === cat.label ? "500" : "400", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap", borderRadius: "8px" }}>
                  {cat.icon} {cat.label} <span style={{ fontSize: "9px", opacity: 0.6, transform: activeNav === cat.label ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
                </button>
                {activeNav === cat.label && (
                  <div className="cat-nav-dropdown" style={{ position: "absolute", top: "calc(100% + 4px)", left: "0", right: "auto", background: "#fff", border: "1px solid rgba(180,160,120,0.2)", borderRadius: "12px", boxShadow: "0 12px 40px rgba(30,22,9,0.15)", padding: "8px", minWidth: "180px", maxWidth: "calc(100vw - 32px)", zIndex: 300, display: "grid", gridTemplateColumns: cat.items.length > 6 ? "1fr 1fr" : "1fr", gap: "2px" }}>
                    {cat.items.map((item: string) => (
                      <a key={item} href={`/recipes?${cat.label.toLowerCase()}=${encodeURIComponent(item)}`}
                        onClick={() => setActiveNav("")}
                        style={{ display: "block", padding: "8px 12px", fontFamily: "monospace", fontSize: "12px", color: "#4a3820", textDecoration: "none", borderRadius: "8px", whiteSpace: "nowrap", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,122,61,0.08)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >{item}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Hero */}
        <div className="hero-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px", background: "rgba(232,88,26,0.1)", borderRadius: "24px", padding: "7px 18px", border: "1px solid rgba(232,88,26,0.15)" }}>
              <span>🤖</span>
              <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#c43d00", letterSpacing: "0.8px" }}>{t.badge}</span>
              <span>👨‍🍳</span>
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "62px", lineHeight: 1.0, color: "#1e1609", marginBottom: "24px", letterSpacing: "-2px" }}>
              {t.h1a}<br /><em style={{ color: "#3a7a32" }}>{t.h1b}</em>
            </h1>
            <p style={{ color: "#6b5840", fontSize: "17px", lineHeight: 1.75, maxWidth: "520px", marginBottom: "24px" }}>{t.sub}</p>
            <div className="ai-strip" style={{ display: "flex", marginBottom: "36px", background: "rgba(30,22,9,0.04)", borderRadius: "14px", border: "1px solid rgba(180,160,120,0.2)", overflow: "hidden" }}>
              {[["🤖", t.generateLabel, t.generateText], ["👨‍🍳", t.checkLabel, t.checkText], ["✨", t.liveLabel, t.liveText]].map(([icon, label, text], i) => (
                <div key={i} style={{ flex: 1, padding: "16px 18px", borderRight: i < 2 ? "1px solid rgba(180,160,120,0.2)" : "none" }}>
                  <div style={{ fontSize: "18px", marginBottom: "5px" }}>{icon}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#e8581a", letterSpacing: "0.8px", marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#4a3820", lineHeight: 1.5 }}>{text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "44px" }}>
              <button style={{ background: "transparent", color: "#e8581a", border: "1.5px solid #e8581a", borderRadius: "28px", padding: "14px 22px", fontFamily: "monospace", fontSize: "14px", cursor: "pointer" }} onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                {t.btnHow || "How does it work?"}
              </button>
            </div>
            <div className="stats-row" style={{ display: "flex", gap: "44px" }}>
              {t.stats.map(([n, l]: [string, string]) => (
                <div key={l}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "30px", fontWeight: "700", color: "#1e1609" }}>{n}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#8a7355", marginTop: "2px" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-images">
            {heroRecipe ? (
              <>
                {/* Wrapper met overflow visible — kaartje kan erbuiten */}
                <a href={`/recept/${heroRecipe.lang}/${heroRecipe.slug}`} style={{ textDecoration: "none", display: "block", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: "24px", overflow: "visible", boxShadow: "0 30px 80px rgba(30,22,9,0.25)" }}>
                  {/* Inner div voor overflow hidden zodat foto afgerond is */}
                  <div style={{ position: "absolute", inset: 0, borderRadius: "24px", overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroRecipe.image_url} alt={heroRecipe.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(30,22,9,0.75) 0%, rgba(30,22,9,0.1) 50%, transparent 100%)" }} />
                    <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px" }}>
                      <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#c8b080", letterSpacing: "1.5px", marginBottom: "6px" }}>{t.makeIt || "Make this"} →</div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "700", color: "#fff", lineHeight: 1.2 }}>{heroRecipe.title}</div>
                    </div>
                  </div>
                  {/* AI score kaartje — buiten inner div, overflow visible zodat het uitsteekt */}
                  {heroRecipe.ai_score?.score && (
                    <div style={{ position: "absolute", top: "40px", left: "-65px", background: "#fff", borderRadius: "16px", padding: "14px 18px", boxShadow: "0 8px 28px rgba(30,22,9,0.18)", border: "1px solid rgba(180,160,120,0.2)", minWidth: "130px", zIndex: 3 }}>
                      <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#8a7355", letterSpacing: "1px", marginBottom: "8px" }}>{t.aiScoreLabel}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: "700", color: "#2d5a27", lineHeight: 1 }}>{heroRecipe.ai_score.score}</span>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355" }}>/100</span>
                      </div>
                      {t.aiCriteria.map((c: string) => <div key={c} style={{ fontFamily: "monospace", fontSize: "10px", color: "#4a7a3d", marginBottom: "2px" }}>{c}</div>)}
                    </div>
                  )}
                </a>
              </>
            ) : (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: "24px", background: "linear-gradient(135deg,#2d5a27,#4a8c41)" }} />
            )}
          </div>
        </div>

        {/* Recipe grid \u2014 24 latest */}
        <div className="section-pad" style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(32px, 5vw, 64px) clamp(16px, 4vw, 48px) 80px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 className="grid-title" style={{ fontFamily: "Georgia, serif", fontSize: "38px", fontWeight: "700", color: "#1e1609", letterSpacing: "-0.5px" }}>{t.gridTitle}</h2>
              <p style={{ color: "#8a7355", fontFamily: "monospace", fontSize: "13px", marginTop: "6px" }}>{t.gridSub}</p>
            </div>
            <a href="/recipes" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent", color: "#1e1609", border: "1.5px solid rgba(30,22,9,0.25)", borderRadius: "20px", padding: "7px 16px", fontFamily: "monospace", fontSize: "12px", cursor: "pointer" }}>{t.catMore}</button>
            </a>
          </div>
          <div className="recipe-grid">
            {latestByCat.length > 0 ? latestByCat.map((cat) => (
              <a key={cat.label} href={cat.recipe?.slug ? `/recept/${cat.recipe.lang}/${cat.recipe.slug}` : cat.recipe ? `/recipe/${cat.recipe.id}` : cat.link} style={{ textDecoration: "none" }}>
                <div className="recipe-card">
                  <div className="recipe-img-wrap">
                    {cat.recipe?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.recipe.image_url} alt={cat.recipe?.title || cat.label} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2d5a27,#4a8c41)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "48px" }}>{cat.icon}</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(30,22,9,0.65)", backdropFilter: "blur(6px)", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontFamily: "monospace", color: "#e8dfc8" }}>
                      {cat.icon} {cat.label}
                    </div>
                    {cat.recipe?.ai_score?.score && (
                      <div style={{ position: "absolute", top: "12px", right: "12px", background: "linear-gradient(135deg,#2d5a27,#4a8c41)", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontFamily: "monospace", color: "#e8f5e6" }}>
                         AI {cat.recipe.ai_score.score}/100
                      </div>
                    )}
                    <div className="make-it-overlay">
                      <button className="make-it-btn">👨‍🍳 {t.makeIt || "Make this →"}</button>
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                    <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: "700", color: "#1e1609", lineHeight: 1.25, marginBottom: "8px" }}>
                      {cat.recipe?.title || "Coming soon"}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(180,160,120,0.15)" }}>
                      {cat.recipe?.prep_time
                        ? <span style={{ fontSize: "12px", color: "#8a7355", fontFamily: "monospace" }}>⏰ {cat.recipe.prep_time} min</span>
                        : <span />}
                      <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#e8581a", fontWeight: "600" }}>{t.makeIt || "Make this "}</span>
                    </div>
                  </div>
                </div>
              </a>
            )) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="recipe-card" style={{ minHeight: "280px", background: "rgba(180,160,120,0.08)" }} />
              ))
            )}
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" style={{ background: "linear-gradient(135deg,#2d5a27,#1a3d16)" }}>
          <div className="how-grid">
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#9fcf9a", letterSpacing: "2px", marginBottom: "20px" }}>{t.howLabel}</div>
              <h2 className="how-h2" style={{ fontFamily: "Georgia, serif", fontSize: "48px", fontWeight: "700", color: "#e8f5e4", lineHeight: 1.05, marginBottom: "24px" }}>
                {t.howH2a}<br /><em>{t.howH2b}</em>
              </h2>
              <p style={{ color: "#9fcf9a", fontSize: "16px", lineHeight: 1.75, marginBottom: "24px" }}>{t.howSub}</p>
              <div className="how-cards" style={{ display: "flex", gap: "14px" }}>
                {[t.generateCard, t.checkCard].map(([icon, label, text]: [string, string, string]) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", flex: 1 }}>
                    <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#6aaa65", letterSpacing: "1px", marginBottom: "5px" }}>{label}</div>
                    <div style={{ fontSize: "13px", color: "#c8f0c4", lineHeight: 1.5 }}>{text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {t.steps.map(([num, icon, title, desc]: [string, string, string, string]) => (
                <div key={num} style={{ background: num === "5" ? "rgba(232,88,26,0.12)" : "rgba(255,255,255,0.07)", border: `1px solid ${num === "5" ? "rgba(232,88,26,0.35)" : "rgba(255,255,255,0.12)"}`, borderRadius: "14px", padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: num === "5" ? "#f4a070" : "#6aaa65", background: num === "5" ? "rgba(232,88,26,0.2)" : "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "5px 12px", flexShrink: 0, marginTop: "2px", whiteSpace: "nowrap" }}>
                    {icon} {t.stepWord} {num}
                  </div>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "17px", color: num === "5" ? "#ffd4b8" : "#e8f5e4", marginBottom: "5px" }}>{title}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: num === "5" ? "#f4a070" : "#9fcf9a", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(180,160,120,0.2)" }}>
          <div className="footer-inner" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 48px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "18px", color: "#1e1609" }}>Culirated</span>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#b8a882" }}>— {t.footerTag}</span>
            </div>
            <div className="footer-links" style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
              {(t.footerLinks || ["About", "How it works", "Privacy", "Terms", "Contact"]).map((label: string, i: number) => {
                const hrefs = ["/about", "/#how-it-works", "/privacy", "/terms", "/contact"];
                return <a key={i} href={hrefs[i]} style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", textDecoration: "none" }}>{label}</a>;
              })}
              <FooterShareButton lang={lang} t={t} />
            </div>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#b8a882" }}>© 2025 Culirated</span>
          </div>
          <div style={{ borderTop: "1px solid rgba(180,160,120,0.1)", padding: "12px clamp(16px, 4vw, 48px)", textAlign: "center" }}>
            <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#b8a882", lineHeight: 1.6, maxWidth: "900px", margin: "0 auto" }}>
              {t.disclaimer || "Recipes on Culirated are AI-generated and quality-checked before publication. Always follow food safety guidelines when preparing and storing food. Culirated is not liable for errors in recipes. Stated dietary labels are AI-assessed \u2014 always verify with product packaging if you have allergies."}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

function FooterShareButton({ lang, t }: { lang: string; t: any }) {
  const [show, setShow] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const socials = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent("Check Culirated \u2014 AI-generated recipes: https://culirated.com")}`, icon: "💬" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=https://culirated.com`, icon: "👥" },
    { label: "X / Twitter", href: `https://x.com/intent/tweet?text=${encodeURIComponent("AI-generated recipes, quality-checked daily")}&url=https://culirated.com`, icon: "🐦" },
    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=https://culirated.com`, icon: "📌" },
    { label: "Instagram", href: `https://www.instagram.com/`, icon: "📸" },
    { label: "TikTok", href: `https://www.tiktok.com/`, icon: "🎵" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=https://culirated.com`, icon: "💼" },
    { label: "Reddit", href: `https://reddit.com/submit?url=https://culirated.com&title=${encodeURIComponent("Culirated")}`, icon: "🤖" },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent("Check Culirated")}&body=https://culirated.com`, icon: "ԣ봩Å" },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setShow(!show)} style={{ background: "#e8581a", border: "none", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: "#fff", fontWeight: "500" }}>
        📤 {t.share || "Share"}
      </button>
      {show && (
        <div style={{ position: "absolute", bottom: "calc(100% + 8px)", right: "auto", left: 0, background: "#fff", borderRadius: "16px", padding: "8px", border: "1px solid rgba(180,160,120,0.2)", boxShadow: "0 12px 40px rgba(30,22,9,0.12)", zIndex: 200, minWidth: "200px", maxWidth: "calc(100vw - 32px)" }}>
          {socials.map(b => (
            <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderRadius: "10px", fontFamily: "monospace", fontSize: "12px", color: "#1e1609" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f0e8")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span style={{ fontSize: "15px" }}>{b.icon}</span> {b.label}
              </div>
            </a>
          ))}
          <div onClick={() => { navigator.clipboard.writeText("https://culirated.com"); setShow(false); }}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderRadius: "10px", fontFamily: "monospace", fontSize: "12px", color: "#1e1609", cursor: "pointer", borderTop: "1px solid rgba(180,160,120,0.15)", marginTop: "4px" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f5f0e8")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <span style={{ fontSize: "15px" }}>🔗</span> {t.copyLink || "Copy link"}
          </div>
        </div>
      )}
    </div>
  );
}
