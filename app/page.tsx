"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function detectLocalLang(): string {
  if (typeof navigator === "undefined") return "en";
  const b = (navigator.language || "en").split("-")[0].toLowerCase();
  return ["nl", "de", "fr"].includes(b) ? b : "en";
}

const LOCAL_NAMES: Record<string, string> = {
  nl: "🇳🇱 Nederlands",
  de: "🇩🇪 Deutsch",
  fr: "🇫🇷 Français",
};

const T: Record<string, any> = {
  en: {
    topbar: "👨‍🍳 RECIPES BY PEOPLE · ✦ CURATED BY AI · ONLY THE BEST GOES LIVE",
    nav: ["Discover", "Categories", "Trending", "Season", "Meal Planner"],
    search: "Search recipes…", submit: "+ Submit Recipe",
    badge: "HUMAN-MADE · AI-CURATED",
    h1a: "Real recipes.", h1b: "Guaranteed quality.",
    sub: "Every recipe on Culirated is submitted by a real cook — home, food blogger or professional chef. Before it goes live, AI automatically checks whether it holds up.",
    humanLabel: "THE COOK", humanText: "Invents, cooks and writes the recipe. Real knowledge, real experience.",
    aiLabel: "THE AI", aiText: "Checks completeness, ratios and logic. Gatekeeper, not author.",
    liveLabel: "RESULT", liveText: "Only quality goes live",
    btnDiscover: "Discover Recipes →", btnHow: "How does the AI check work?",
    stats: [["12,400+", "Recipes"], ["500K", "Visitors/mo"], ["97%", "AI approval"]],
    aiScoreLabel: "AI SCORE", aiCriteria: ["✓ Completeness", "✓ Ratios", "✓ Logic", "✓ SEO"],
    catTitle: "Popular Categories", catMore: "All categories →",
    cats: [
      { name: "Quick (<20 min)", icon: "⚡", count: 1240 }, { name: "Vegetarian", icon: "🌿", count: 3870 },
      { name: "Italian", icon: "🍝", count: 2150 }, { name: "Asian", icon: "🥢", count: 1980 },
      { name: "Baking", icon: "🍞", count: 890 }, { name: "BBQ", icon: "🔥", count: 640 },
      { name: "Vegan", icon: "✦", count: 2300 }, { name: "Meal Prep", icon: "📦", count: 770 },
    ],
    gridTitle: "Freshly Approved", gridSub: "Latest recipes that passed the AI quality check",
    filters: ["Newest", "Top Rated", "Quick"], loadMore: "Load more recipes",
    howLabel: "✦ HOW IT WORKS", howH2a: "You cook.", howH2b: "AI approves.",
    howSub: "Recipes on Culirated are made by real people. AI doesn't touch the recipe; it only checks whether it checks out.",
    humanCard: ["👨‍🍳", "THE COOK", "Invents, cooks and writes the recipe. Real knowledge, real experience."],
    aiCard: ["✦", "THE AI", "Checks completeness, ratios and logic. Gatekeeper, not author."],
    steps: [
      ["1", "👨‍🍳", "You make the recipe", "Write, photograph or paste your recipe. Every format works: text, photo, PDF or URL."],
      ["2", "⚙️", "Normalisation", "Claude structures your submission automatically — your words, clean layout."],
      ["3", "✦", "AI quality check", "Ratios, completeness, logic and prep time verified. You get feedback if something's off."],
      ["4", "🟢", "Live!", "Approved? Your recipe goes live — categorised, searchable and visible to everyone."],
    ],
    stepWord: "STEP", pipeBtn: "Submit a recipe →",
    ctaH2a: "Your recipe", ctaH2b: "deserves a place.",
    ctaSub: "Submit as text, photo, PDF or URL. AI checks it automatically. The recipe stays yours.",
    ctaBtn: "+ Submit Recipe", ctaNote: "Free · No account needed for your first submission",
    footerLinks: ["About", "How it works", "Privacy", "Terms", "Contact"],
    footerTag: "Recipes by people · Curated by AI",
    featDesc: "Submitted by a home cook and approved by AI — ratios, step logic and prep time all checked.",
    aiChecked: "✦ AI approved",
    catL: { meast: "Middle Eastern", ital: "Italian", asian: "Asian", bake: "Baking", fus: "Fusion" },
    tagL: { prot: "High-protein", gf: "Gluten-free", veg: "Vegetarian", quick: "Quick", wknd: "Weekend", vegan: "Vegan" },
  },
  nl: {
    topbar: "👨‍🍳 RECEPTEN DOOR MENSEN · ✦ GEKWALIFICEERD DOOR AI · ALLEEN HET BESTE GAAT LIVE",
    nav: ["Ontdekken", "Categorieën", "Trending", "Seizoen", "Weekmenu"],
    search: "Zoek recepten…", submit: "+ Recept Insturen",
    badge: "DOOR MENSEN GEMAAKT · DOOR AI GECUREERD",
    h1a: "Echte recepten.", h1b: "Gegarandeerde kwaliteit.",
    sub: "Elk recept op Culirated is ingediend door een echte kok — thuis, foodblogger of professioneel chef. Voordat het live gaat, controleert AI automatisch of het klopt.",
    humanLabel: "DE KOK", humanText: "Bedenkt, kookt en schrijft het recept. Echte kennis, echte ervaring.",
    aiLabel: "DE AI", aiText: "Controleert volledigheid, verhoudingen en logica. Poortwachter, geen auteur.",
    liveLabel: "RESULTAAT", liveText: "Alleen kwaliteit gaat live",
    btnDiscover: "Recepten Ontdekken →", btnHow: "Hoe werkt de AI-check?",
    stats: [["12.400+", "Recepten"], ["500K", "Bezoekers/mnd"], ["97%", "AI-goedkeuring"]],
    aiScoreLabel: "AI SCORE", aiCriteria: ["✓ Volledigheid", "✓ Verhoudingen", "✓ Logica", "✓ SEO"],
    catTitle: "Populaire Categorieën", catMore: "Alle categorieën →",
    cats: [
      { name: "Snel (<20 min)", icon: "⚡", count: 1240 }, { name: "Vegetarisch", icon: "🌿", count: 3870 },
      { name: "Italiaans", icon: "🍝", count: 2150 }, { name: "Aziatisch", icon: "🥢", count: 1980 },
      { name: "Bakken", icon: "🍞", count: 890 }, { name: "BBQ", icon: "🔥", count: 640 },
      { name: "Vegan", icon: "✦", count: 2300 }, { name: "Meal Prep", icon: "📦", count: 770 },
    ],
    gridTitle: "Vers Goedgekeurd", gridSub: "Laatste recepten die de AI-kwaliteitscheck hebben gehaald",
    filters: ["Nieuwste", "Hoogste Score", "Snel"], loadMore: "Meer recepten laden",
    howLabel: "✦ HOE HET WERKT", howH2a: "Jij kookt.", howH2b: "AI keurt goed.",
    howSub: "De recepten op Culirated zijn gemaakt door echte mensen. AI doet niets aan het recept zelf; het controleert alleen of het klopt.",
    humanCard: ["👨‍🍳", "DE MENS", "Bedenkt, kookt en schrijft het recept. Echte kennis, echte ervaring."],
    aiCard: ["✦", "DE AI", "Controleert volledigheid, verhoudingen en logica. Poortwachter, geen auteur."],
    steps: [
      ["1", "👨‍🍳", "Jij maakt het recept", "Schrijf, fotografeer of plak je recept. Elk formaat werkt: tekst, foto, PDF of URL."],
      ["2", "⚙️", "Normalisatie", "Claude structureert je inzending automatisch — jouw woorden, nette indeling."],
      ["3", "✦", "AI-kwaliteitscheck", "Verhoudingen, volledigheid, logica en bereidingstijd worden gecontroleerd."],
      ["4", "🟢", "Live!", "Goedgekeurd? Jouw recept gaat live — gecategoriseerd, vindbaar en zichtbaar voor iedereen."],
    ],
    stepWord: "STAP", pipeBtn: "Recept insturen →",
    ctaH2a: "Jij kookt het.", ctaH2b: "Wij checken het.",
    ctaSub: "Stuur je recept in als tekst, foto, PDF of URL. AI controleert automatisch. Het recept blijft van jou.",
    ctaBtn: "+ Recept Insturen", ctaNote: "Gratis · Geen account nodig bij eerste inzending",
    footerLinks: ["Over ons", "Hoe werkt het?", "Privacybeleid", "Gebruiksvoorwaarden", "Contact"],
    footerTag: "Recepten door mensen · Gecureerd door AI",
    featDesc: "Ingediend door een thuiskok en goedgekeurd door AI — verhoudingen, stappenlogica en bereidingstijd gecheckt.",
    aiChecked: "✦ AI goedgekeurd",
    catL: { meast: "Midden-Oosters", ital: "Italiaans", asian: "Aziatisch", bake: "Bakken", fus: "Fusion" },
    tagL: { prot: "Hoog-eiwit", gf: "Glutenvrij", veg: "Vegetarisch", quick: "Snel", wknd: "Weekend", vegan: "Vegan" },
  },
  de: {
    topbar: "👨‍🍳 REZEPTE VON MENSCHEN · ✦ KURATIERT VON KI · NUR DAS BESTE WIRD VERÖFFENTLICHT",
    nav: ["Entdecken", "Kategorien", "Trending", "Saison", "Wochenplan"],
    search: "Rezepte suchen…", submit: "+ Rezept einreichen",
    badge: "VON MENSCHEN GEMACHT · VON KI KURATIERT",
    h1a: "Echte Rezepte.", h1b: "Garantierte Qualität.",
    sub: "Jedes Rezept auf Culirated wurde von einem echten Koch eingereicht. Bevor es live geht, prüft die KI automatisch, ob es wirklich stimmt.",
    humanLabel: "DER KOCH", humanText: "Erfindet, kocht und schreibt das Rezept. Echtes Wissen, echte Erfahrung.",
    aiLabel: "DIE KI", aiText: "Prüft Vollständigkeit, Mengen und Logik. Türsteher, kein Autor.",
    liveLabel: "ERGEBNIS", liveText: "Nur Qualität wird live",
    btnDiscover: "Rezepte entdecken →", btnHow: "Wie funktioniert die KI-Prüfung?",
    stats: [["12.400+", "Rezepte"], ["500K", "Besucher/Mo"], ["97%", "KI-Genehmigung"]],
    aiScoreLabel: "KI-SCORE", aiCriteria: ["✓ Vollständigkeit", "✓ Mengen", "✓ Logik", "✓ SEO"],
    catTitle: "Beliebte Kategorien", catMore: "Alle Kategorien →",
    cats: [
      { name: "Schnell (<20 Min)", icon: "⚡", count: 1240 }, { name: "Vegetarisch", icon: "🌿", count: 3870 },
      { name: "Italienisch", icon: "🍝", count: 2150 }, { name: "Asiatisch", icon: "🥢", count: 1980 },
      { name: "Backen", icon: "🍞", count: 890 }, { name: "BBQ", icon: "🔥", count: 640 },
      { name: "Vegan", icon: "✦", count: 2300 }, { name: "Meal Prep", icon: "📦", count: 770 },
    ],
    gridTitle: "Frisch Genehmigt", gridSub: "Neueste Rezepte, die die KI-Qualitätsprüfung bestanden haben",
    filters: ["Neueste", "Höchste Bewertung", "Schnell"], loadMore: "Mehr Rezepte laden",
    howLabel: "✦ SO FUNKTIONIERT ES", howH2a: "Du kochst.", howH2b: "KI genehmigt.",
    howSub: "Die Rezepte auf Culirated werden von echten Menschen erstellt. Die KI verändert das Rezept nicht; sie prüft nur, ob es stimmt.",
    humanCard: ["👨‍🍳", "DER MENSCH", "Erfindet, kocht und schreibt das Rezept. Echtes Wissen, echte Erfahrung."],
    aiCard: ["✦", "DIE KI", "Prüft Vollständigkeit, Mengen und Logik. Türsteher, kein Autor."],
    steps: [
      ["1", "👨‍🍳", "Du machst das Rezept", "Schreib, fotografiere oder füge dein Rezept ein. Jedes Format funktioniert."],
      ["2", "⚙️", "Normalisierung", "Claude strukturiert deine Einreichung automatisch — deine Worte, sauberes Layout."],
      ["3", "✦", "KI-Qualitätsprüfung", "Mengen, Vollständigkeit, Logik und Zubereitungszeit werden geprüft."],
      ["4", "🟢", "Live!", "Genehmigt? Dein Rezept geht live — kategorisiert und für alle auffindbar."],
    ],
    stepWord: "SCHRITT", pipeBtn: "Rezept einreichen →",
    ctaH2a: "Du kochst es.", ctaH2b: "Wir prüfen es.",
    ctaSub: "Reiche dein Rezept als Text, Foto, PDF oder URL ein. Die KI prüft es automatisch. Das Rezept bleibt deins.",
    ctaBtn: "+ Rezept einreichen", ctaNote: "Kostenlos · Kein Konto für die erste Einreichung nötig",
    footerLinks: ["Über uns", "Wie es funktioniert", "Datenschutz", "Nutzungsbedingungen", "Kontakt"],
    footerTag: "Rezepte von Menschen · Kuratiert von KI",
    featDesc: "Von einem Hobbykoch eingereicht und von der KI genehmigt — Mengen, Schrittlogik und Zubereitungszeit geprüft.",
    aiChecked: "✦ KI-geprüft",
    catL: { meast: "Naher Osten", ital: "Italienisch", asian: "Asiatisch", bake: "Backen", fus: "Fusion" },
    tagL: { prot: "Eiweißreich", gf: "Glutenfrei", veg: "Vegetarisch", quick: "Schnell", wknd: "Wochenende", vegan: "Vegan" },
  },
  fr: {
    topbar: "👨‍🍳 RECETTES PAR DES HUMAINS · ✦ SÉLECTIONNÉES PAR L'IA · SEUL LE MEILLEUR EST PUBLIÉ",
    nav: ["Découvrir", "Catégories", "Tendances", "Saison", "Menu semaine"],
    search: "Rechercher des recettes…", submit: "+ Soumettre une recette",
    badge: "CRÉÉES PAR DES HUMAINS · SÉLECTIONNÉES PAR L'IA",
    h1a: "Vraies recettes.", h1b: "Qualité garantie.",
    sub: "Chaque recette sur Culirated est soumise par un vrai cuisinier. Avant d'être publiée, l'IA vérifie automatiquement qu'elle tient la route.",
    humanLabel: "LE CUISINIER", humanText: "Invente, cuisine et rédige la recette. Vraie connaissance, vraie expérience.",
    aiLabel: "L'IA", aiText: "Vérifie la complétude, les proportions et la logique. Gardien, pas auteur.",
    liveLabel: "RÉSULTAT", liveText: "Seule la qualité est publiée",
    btnDiscover: "Découvrir les recettes →", btnHow: "Comment fonctionne la vérification IA ?",
    stats: [["12 400+", "Recettes"], ["500K", "Visiteurs/mois"], ["97%", "Approbation IA"]],
    aiScoreLabel: "SCORE IA", aiCriteria: ["✓ Complétude", "✓ Proportions", "✓ Logique", "✓ SEO"],
    catTitle: "Catégories Populaires", catMore: "Toutes les catégories →",
    cats: [
      { name: "Rapide (<20 min)", icon: "⚡", count: 1240 }, { name: "Végétarien", icon: "🌿", count: 3870 },
      { name: "Italien", icon: "🍝", count: 2150 }, { name: "Asiatique", icon: "🥢", count: 1980 },
      { name: "Pâtisserie", icon: "🍞", count: 890 }, { name: "BBQ", icon: "🔥", count: 640 },
      { name: "Vegan", icon: "✦", count: 2300 }, { name: "Meal Prep", icon: "📦", count: 770 },
    ],
    gridTitle: "Fraîchement Approuvé", gridSub: "Dernières recettes ayant passé le contrôle qualité IA",
    filters: ["Plus récentes", "Meilleur score", "Rapide"], loadMore: "Charger plus de recettes",
    howLabel: "✦ COMMENT ÇA MARCHE", howH2a: "Vous cuisinez.", howH2b: "L'IA approuve.",
    howSub: "Les recettes sur Culirated sont créées par de vraies personnes. L'IA ne touche pas à la recette ; elle vérifie seulement qu'elle est correcte.",
    humanCard: ["👨‍🍳", "L'HUMAIN", "Invente, cuisine et rédige la recette. Vraie connaissance, vraie expérience."],
    aiCard: ["✦", "L'IA", "Vérifie la complétude, les proportions et la logique. Gardien, pas auteur."],
    steps: [
      ["1", "👨‍🍳", "Vous créez la recette", "Écrivez, photographiez ou collez votre recette. Tous les formats fonctionnent."],
      ["2", "⚙️", "Normalisation", "Claude structure automatiquement votre soumission — vos mots, mise en page propre."],
      ["3", "✦", "Vérification IA", "Les proportions, la complétude, la logique et le temps de préparation sont vérifiés."],
      ["4", "🟢", "En ligne !", "Approuvée ? Votre recette est publiée — catégorisée et visible par tous."],
    ],
    stepWord: "ÉTAPE", pipeBtn: "Soumettre une recette →",
    ctaH2a: "Vous cuisinez.", ctaH2b: "Nous vérifions.",
    ctaSub: "Soumettez votre recette en texte, photo, PDF ou URL. L'IA la vérifie automatiquement. La recette reste la vôtre.",
    ctaBtn: "+ Soumettre une recette", ctaNote: "Gratuit · Aucun compte requis pour la première soumission",
    footerLinks: ["À propos", "Comment ça marche", "Confidentialité", "CGU", "Contact"],
    footerTag: "Recettes par des humains · Sélectionnées par l'IA",
    featDesc: "Soumise par un cuisinier amateur et approuvée par l'IA — proportions, logique des étapes et temps de préparation vérifiés.",
    aiChecked: "✦ Approuvé par l'IA",
    catL: { meast: "Moyen-Orient", ital: "Italien", asian: "Asiatique", bake: "Pâtisserie", fus: "Fusion" },
    tagL: { prot: "Riche en protéines", gf: "Sans gluten", veg: "Végétarien", quick: "Rapide", wknd: "Week-end", vegan: "Vegan" },
  },
};

const NAV_CATS = [
  { label: "Cuisine", icon: "🌍", items: ["Italian", "Mexican", "Asian", "Indian", "Thai", "Chinese", "Japanese", "Greek", "Middle Eastern", "French", "American", "Mediterranean"] },
  { label: "Course", icon: "🍽️", items: ["Breakfast", "Lunch", "Dinner", "Appetizer", "Side dish", "Dessert", "Snack", "Drink"] },
  { label: "Diet", icon: "🌿", items: ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Low-carb", "High-protein", "Mediterranean", "Low-FODMAP"] },
  { label: "Method", icon: "🔥", items: ["Air fryer", "Slow cooker", "Sheet pan", "BBQ & Grill", "One pot", "No-cook"] },
  { label: "Time", icon: "⏱️", items: ["Under 20 min", "Under 30 min", "Under 1 hour", "Weekend project"] },
  { label: "Occasion", icon: "🎉", items: ["Weeknight", "Meal prep", "Holidays", "Kids", "Date night", "Batch cooking"] },
  { label: "Ingredient", icon: "🥩", items: ["Chicken", "Beef", "Fish & seafood", "Pasta", "Rice", "Eggs", "Vegetables", "Legumes", "Pork"] },
];


const RECIPES = [
  { id: 1, titles: { en: "Moroccan Lamb Stew", nl: "Marokkaanse Lamsschotel", de: "Marokkanischer Lammeintopf", fr: "Tajine Agneau Marocain" }, time: "90", score: 97, author: "Fatima B.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80", calories: 480, cat: "meast", tags: ["prot", "gf"] },
  { id: 2, titles: { en: "Creamy Truffle Risotto", nl: "Cremeux Risotto met Truffel", de: "Cremiges Truffel-Risotto", fr: "Risotto Cremeux Truffe" }, time: "35", score: 94, author: "Marco V.", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80", calories: 390, cat: "ital", tags: ["veg"] },
  { id: 3, titles: { en: "Thai Prawn Soup", nl: "Thaise Garnalen Soep", de: "Thaisuppe mit Garnelen", fr: "Soupe Crevettes Thaie" }, time: "20", score: 98, author: "Nong P.", image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80", calories: 280, cat: "asian", tags: ["quick", "gf"] },
  { id: 4, titles: { en: "Classic Apple Pie", nl: "Klassieke Appeltaart", de: "Klassischer Apfelkuchen", fr: "Tarte aux Pommes Classique" }, time: "75", score: 96, author: "Lieke D.", image: "https://images.unsplash.com/photo-1568571780765-9276837fa9f7?w=600&q=80", calories: 340, cat: "bake", tags: ["veg", "wknd"] },
  { id: 5, titles: { en: "Miso Buddha Bowl", nl: "Buddha Bowl met Miso", de: "Miso-Buddha-Bowl", fr: "Buddha Bowl Miso" }, time: "25", score: 92, author: "Sanne K.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80", calories: 310, cat: "fus", tags: ["vegan", "quick"] },
];

function AIBadge({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px", background: score >= 95 ? "linear-gradient(135deg,#2d5a27,#4a8c41)" : "linear-gradient(135deg,#5a4a27,#8c7a41)", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontFamily: "monospace", color: "#e8f5e6" }}>
      <span style={{ fontSize: "9px" }}>✦</span> AI {score}/100
    </div>
  );
}

function HumanBadge({ author }: { author: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(245,240,232,0.92)", backdropFilter: "blur(8px)", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontFamily: "monospace", color: "#4a3820", border: "1px solid rgba(180,160,120,0.3)" }}>
      👨‍🍳 {author}
    </div>
  );
}

function RecipeCard({ recipe, featured, lang, t }: { recipe: any; featured?: boolean; lang: string; t: any }) {
  const title = recipe.titles[lang] || recipe.titles.en;
  const cat = t.catL[recipe.cat] || recipe.cat;
  const tags = recipe.tags.map((k: string) => t.tagL[k] || k);
  return (
    <div className={featured ? "recipe-card featured-card" : "recipe-card"}>
      <div className="recipe-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={recipe.image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(30,22,10,0.6) 0%,transparent 55%)" }} />
        <div style={{ position: "absolute", top: "12px", right: "12px" }}><AIBadge score={recipe.score} /></div>
        <div style={{ position: "absolute", bottom: "12px", left: "12px" }}><HumanBadge author={recipe.author} /></div>
      </div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#8a7355", background: "rgba(140,115,80,0.12)", borderRadius: "20px", padding: "3px 10px" }}>{cat}</span>
            {tags.slice(0, 2).map((tag: string) => (
              <span key={tag} style={{ fontSize: "11px", fontFamily: "monospace", color: "#4a7a3d", background: "rgba(74,122,61,0.1)", borderRadius: "20px", padding: "3px 10px" }}>{tag}</span>
            ))}
          </div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: "700", color: "#1e1609", lineHeight: 1.25, marginBottom: "8px" }}>{title}</h3>
          {featured && <p style={{ color: "#8a7355", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px" }}>{t.featDesc}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(180,160,120,0.15)" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "#8a7355", fontFamily: "monospace" }}>⏱ {recipe.time} min</span>
            <span style={{ fontSize: "12px", color: "#8a7355", fontFamily: "monospace" }}>🔥 {recipe.calories} kcal</span>
          </div>
          <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#4a7a3d", background: "rgba(74,122,61,0.1)", borderRadius: "10px", padding: "2px 8px" }}>{t.aiChecked}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const localLang = detectLocalLang();
  const [lang, setLang] = useState(localLang);
  const [activeNav, setActiveNav] = useState("");
  const [activeFilter, setFilter] = useState(0);
  const [dbRecipes, setDbRecipes] = useState<any[]>([]);
  const t = T[lang];
  const isEN = lang === "en";

  useEffect(() => {
    async function fetchRecipes() {
      const orderCol = activeFilter === 1 ? "ai_score->>score" : "created_at";
      const { data } = await supabase
        .from("recipes")
        .select("id, title, description, prep_time, calories, difficulty, ai_score, status")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) {
        if (activeFilter === 1) {
          data.sort((a: any, b: any) => (b.ai_score?.score || 0) - (a.ai_score?.score || 0));
        }
        setDbRecipes(data);
      }
    }
    fetchRecipes();
  }, [activeFilter]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; font-family: Georgia, serif; color: #1e1609; }

        .hero-grid { display: grid; grid-template-columns: 1fr 440px; gap: 64px; align-items: center; padding: 72px 48px 56px; max-width: 1280px; margin: 0 auto; }
        .hero-images { position: relative; height: 480px; }
        .hero-img-main { position: absolute; top: 20px; right: 0; width: 350px; height: 400px; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 80px rgba(30,22,9,0.25); }
        .hero-img-secondary { position: absolute; bottom: 10px; left: 0; width: 210px; height: 175px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(30,22,9,0.2); border: 4px solid #f5f0e8; }
        .hero-score-card { position: absolute; top: 16px; left: 0; background: #fff; border-radius: 16px; padding: 16px 20px; box-shadow: 0 12px 32px rgba(30,22,9,0.15); border: 1px solid rgba(180,160,120,0.2); min-width: 165px; }

        .cats-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px; }
        .recipe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .recipe-card { border-radius: 16px; overflow: hidden; background: #faf8f3; border: 1px solid rgba(180,160,120,0.2); cursor: pointer; }
        .featured-card { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; }
        .recipe-img-wrap { position: relative; height: 220px; }
        .featured-card .recipe-img-wrap { height: 100%; min-height: 280px; }

        .how-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; max-width: 1280px; margin: 0 auto; padding: 80px 48px; }
        .cta-grid { display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center; }
        .cat-nav { max-width: 1280px; margin: 0 auto; padding: 0 48px; display: flex; gap: 0; }
        .cat-nav-item { position: relative; }
        @media (max-width: 768px) {
          .cat-nav { padding: 0 16px; overflow-x: auto; }
          .cat-nav::-webkit-scrollbar { display: none; }
        }
        .nav-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; height: 70px; gap: 24px; padding: 0 48px; }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr; padding: 32px 20px 40px; gap: 40px; }
          .hero-images { display: none; }
          h1 { font-size: 40px !important; letter-spacing: -1px !important; }
          .human-ai-strip { flex-direction: column !important; }
          .human-ai-strip > div { border-right: none !important; border-bottom: 1px solid rgba(180,160,120,0.2); }
          .human-ai-strip > div:last-child { border-bottom: none; }
          .stats-row { gap: 24px !important; }

          .cats-grid { grid-template-columns: repeat(4, 1fr); }
          .recipe-grid { grid-template-columns: 1fr; }
          .featured-card { grid-column: span 1; display: block; }
          .featured-card .recipe-img-wrap { height: 220px; }

          .how-grid { grid-template-columns: 1fr; gap: 40px; padding: 48px 20px; }
          h2.how-h2 { font-size: 36px !important; }
          .how-cards { flex-direction: column !important; }

          .cta-grid { grid-template-columns: 1fr; gap: 24px; }
          .cta-inner { padding: 36px 24px !important; }
          h2.cta-h2 { font-size: 32px !important; }

          .nav-inner { padding: 0 16px; gap: 12px; height: 60px; }
          .nav-links { display: none; }
          .nav-search { display: none; }

          .section-pad { padding: 0 20px 60px !important; }
          .cats-pad { padding: 32px 20px !important; }
          .footer-inner { flex-direction: column; gap: 16px; padding: 32px 20px !important; }
          .footer-links { flex-wrap: wrap; gap: 16px !important; }
        }

        @media (max-width: 480px) {
          .cats-grid { grid-template-columns: repeat(2, 1fr); }
          h1 { font-size: 34px !important; }
          .submit-btn span { display: none; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>
        {/* Top bar */}
        <div style={{ background: "#1e1609", padding: "8px 0", textAlign: "center", overflow: "hidden" }}>
          <span style={{ color: "#c8b080", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px", whiteSpace: "nowrap" }}>{t.topbar}</span>
        </div>

        {/* Nav */}
        <nav style={{ background: "rgba(245,240,232,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(180,160,120,0.25)", position: "sticky", top: 0, zIndex: 100 }}>
          {/* Top row: logo + search + lang + submit */}
          <div className="nav-inner" style={{ borderBottom: "1px solid rgba(180,160,120,0.12)" }}>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#2d5a27,#6aa86e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍃</div>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "22px", color: "#1e1609" }}>Culirated</span>
            </a>
            <div style={{ flex: 1 }} />
            <div className="nav-search" style={{ position: "relative" }}>
              <input placeholder={t.search} style={{ background: "rgba(180,160,120,0.12)", border: "1px solid transparent", borderRadius: "24px", padding: "9px 16px 9px 36px", fontFamily: "monospace", fontSize: "12px", color: "#1e1609", outline: "none", width: "200px" }} />
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#8a7355" }}>🔍</span>
            </div>
            {!isEN && (
              <button onClick={() => setLang("en")} style={{ flexShrink: 0, background: "rgba(30,22,9,0.05)", border: "1px solid rgba(180,160,120,0.3)", borderRadius: "20px", padding: "7px 14px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: "#4a3820", whiteSpace: "nowrap" }}>🇬🇧 EN</button>
            )}
            {isEN && localLang !== "en" && (
              <button onClick={() => setLang(localLang)} style={{ flexShrink: 0, background: "rgba(30,22,9,0.05)", border: "1px solid rgba(180,160,120,0.3)", borderRadius: "20px", padding: "7px 14px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: "#4a3820", whiteSpace: "nowrap" }}>{LOCAL_NAMES[localLang]}</button>
            )}
            <a href="/submit" style={{ textDecoration: "none", flexShrink: 0 }}>
              <button className="submit-btn" style={{ background: "#3a7a32", color: "#e8f5e4", border: "none", borderRadius: "24px", padding: "10px 18px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", fontWeight: "500", whiteSpace: "nowrap" }}>{t.submit}</button>
            </a>
          </div>
          {/* Category nav row with dropdowns */}
          <div className="cat-nav" onClick={e => { if ((e.target as HTMLElement).closest('.cat-nav-item') === null) setActiveNav(""); }}>
            {NAV_CATS.map((cat) => (
              <div key={cat.label} className="cat-nav-item" style={{ position: "relative" }}>
                <button
                  onClick={() => setActiveNav(activeNav === cat.label ? "" : cat.label)}
                  style={{ background: activeNav === cat.label ? "rgba(74,122,61,0.08)" : "transparent", border: "none", padding: "12px 14px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px", color: activeNav === cat.label ? "#2d5a27" : "#6b5840", fontWeight: activeNav === cat.label ? "500" : "400", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap", borderRadius: "8px" }}>
                  {cat.icon} {cat.label} <span style={{ fontSize: "9px", opacity: 0.6, transform: activeNav === cat.label ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▾</span>
                </button>
                {activeNav === cat.label && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: "0", background: "#fff", border: "1px solid rgba(180,160,120,0.2)", borderRadius: "12px", boxShadow: "0 12px 40px rgba(30,22,9,0.15)", padding: "8px", minWidth: "180px", zIndex: 300, display: "grid", gridTemplateColumns: cat.items.length > 6 ? "1fr 1fr" : "1fr", gap: "2px" }}>
                    {cat.items.map((item) => (
                      <a key={item} href={`/recipes/${cat.label.toLowerCase()}/${item.toLowerCase().replace(/ /g, "-")}`}
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
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px", background: "rgba(74,122,61,0.1)", borderRadius: "24px", padding: "7px 18px" }}>
              <span>👨‍🍳</span>
              <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#2d5a27", letterSpacing: "0.8px" }}>{t.badge}</span>
              <span>✦</span>
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "62px", lineHeight: 1.0, color: "#1e1609", marginBottom: "24px", letterSpacing: "-2px" }}>
              {t.h1a}<br /><em style={{ color: "#3a7a32" }}>{t.h1b}</em>
            </h1>
            <p style={{ color: "#6b5840", fontSize: "17px", lineHeight: 1.75, maxWidth: "520px", marginBottom: "24px" }}>{t.sub}</p>
            <div className="human-ai-strip" style={{ display: "flex", marginBottom: "36px", background: "rgba(30,22,9,0.04)", borderRadius: "14px", border: "1px solid rgba(180,160,120,0.2)", overflow: "hidden" }}>
              {[["👨‍🍳", t.humanLabel, t.humanText], ["✦", t.aiLabel, t.aiText], ["🟢", t.liveLabel, t.liveText]].map(([icon, label, text], i) => (
                <div key={i} style={{ flex: 1, padding: "16px 18px", borderRight: i < 2 ? "1px solid rgba(180,160,120,0.2)" : "none" }}>
                  <div style={{ fontSize: "18px", marginBottom: "5px" }}>{icon}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#3a7a32", letterSpacing: "0.8px", marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontSize: "12px", color: "#4a3820", lineHeight: 1.5 }}>{text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "44px" }}>
              <a href="/submit" style={{ textDecoration: "none" }}><button style={{ background: "#1e1609", color: "#f5f0e8", border: "none", borderRadius: "28px", padding: "14px 28px", fontFamily: "monospace", fontSize: "14px", cursor: "pointer", fontWeight: "500" }}>{t.btnDiscover}</button></a>
              <button style={{ background: "transparent", color: "#3a7a32", border: "1.5px solid #3a7a32", borderRadius: "28px", padding: "14px 22px", fontFamily: "monospace", fontSize: "14px", cursor: "pointer" }} onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>{t.btnHow}</button>
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
            <div className="hero-img-main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=700&q=90" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div className="hero-img-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=90" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div className="hero-score-card">
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#8a7355", letterSpacing: "1px", marginBottom: "8px" }}>{t.aiScoreLabel}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "10px" }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: "700", color: "#2d5a27", lineHeight: 1 }}>98</span>
                <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#8a7355" }}>/100</span>
              </div>
              {t.aiCriteria.map((c: string) => <div key={c} style={{ fontFamily: "monospace", fontSize: "10px", color: "#4a7a3d", marginBottom: "3px" }}>{c}</div>)}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div style={{ background: "#1e1609" }}>
          <div className="cats-pad" style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 48px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", color: "#e8dfc8", fontSize: "22px" }}>{t.catTitle}</h2>
              <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", cursor: "pointer" }}>{t.catMore}</span>
            </div>
            <div className="cats-grid">
              {t.cats.map((cat: any) => (
                <div key={cat.name} style={{ background: "rgba(245,240,232,0.06)", border: "1px solid rgba(245,240,232,0.1)", borderRadius: "14px", padding: "18px 12px", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{cat.icon}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#c8b898", marginBottom: "4px", lineHeight: 1.35 }}>{cat.name}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#6b5840" }}>{cat.count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recipe grid */}
        <div className="section-pad" style={{ maxWidth: "1280px", margin: "0 auto", padding: "64px 48px 80px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "38px", fontWeight: "700", color: "#1e1609", letterSpacing: "-0.5px" }}>{t.gridTitle}</h2>
              <p style={{ color: "#8a7355", fontFamily: "monospace", fontSize: "13px", marginTop: "6px" }}>{t.gridSub}</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[t.filters[0], t.filters[1]].map((f: string, i: number) => (
                <button key={f} onClick={() => setFilter(i)} style={{ background: activeFilter === i ? "#1e1609" : "transparent", color: activeFilter === i ? "#e8dfc8" : "#8a7355", border: `1px solid ${activeFilter === i ? "#1e1609" : "rgba(138,115,80,0.3)"}`, borderRadius: "20px", padding: "7px 16px", fontFamily: "monospace", fontSize: "12px", cursor: "pointer" }}>{f}</button>
              ))}
            </div>
          </div>
          <div className="recipe-grid">
            {dbRecipes.length > 0 ? (
              dbRecipes.slice(0, 5).map((r, i) => (
                <div key={r.id} className={i === 0 ? "recipe-card featured-card" : "recipe-card"} style={{ borderRadius: "16px", overflow: "hidden", background: "#faf8f3", border: "1px solid rgba(180,160,120,0.2)", cursor: "pointer", ...(i === 0 ? { gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 1fr" } : {}) }}>
                  <div style={{ position: "relative", height: i === 0 ? "100%" : "220px", minHeight: i === 0 ? "280px" : "auto", background: "linear-gradient(135deg,#2d5a27,#4a8c41)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "48px" }}>🍽️</span>
                    <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", alignItems: "center", gap: "5px", background: "linear-gradient(135deg,#2d5a27,#4a8c41)", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontFamily: "monospace", color: "#e8f5e6" }}>
                      ✦ AI {r.ai_score?.score || 90}/100
                    </div>
                  </div>
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                        {r.ai_score?.cuisine && <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#8a7355", background: "rgba(140,115,80,0.12)", borderRadius: "20px", padding: "3px 10px" }}>{r.ai_score.cuisine}</span>}
                        {r.ai_score?.diet?.[0] && <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#4a7a3d", background: "rgba(74,122,61,0.1)", borderRadius: "20px", padding: "3px 10px" }}>{r.ai_score.diet[0]}</span>}
                      </div>
                      <h3 style={{ fontFamily: "Georgia, serif", fontSize: i === 0 ? "24px" : "18px", fontWeight: "700", color: "#1e1609", lineHeight: 1.25, marginBottom: "8px" }}>{r.title}</h3>
                      {i === 0 && r.description && <p style={{ color: "#8a7355", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px" }}>{r.description}</p>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(180,160,120,0.15)" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        {r.prep_time && <span style={{ fontSize: "12px", color: "#8a7355", fontFamily: "monospace" }}>⏱ {r.prep_time} min</span>}
                        {r.calories && <span style={{ fontSize: "12px", color: "#8a7355", fontFamily: "monospace" }}>🔥 {r.calories} kcal</span>}
                      </div>
                      <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#4a7a3d", background: "rgba(74,122,61,0.1)", borderRadius: "10px", padding: "2px 8px" }}>{t.aiChecked}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "span 3", textAlign: "center", padding: "60px", color: "#8a7355", fontFamily: "monospace", fontSize: "13px" }}>
                Loading recipes…
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <button style={{ background: "transparent", color: "#1e1609", border: "1.5px solid rgba(30,22,9,0.25)", borderRadius: "28px", padding: "14px 40px", fontFamily: "monospace", fontSize: "13px", cursor: "pointer" }}>{t.loadMore}</button>
          </div>
        </div>

        {/* How it works */}
        <div style={{ background: "linear-gradient(135deg,#2d5a27,#1a3d16)" }}>
          <div className="how-grid">
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#9fcf9a", letterSpacing: "2px", marginBottom: "20px" }}>{t.howLabel}</div>
              <h2 className="how-h2" style={{ fontFamily: "Georgia, serif", fontSize: "48px", fontWeight: "700", color: "#e8f5e4", lineHeight: 1.05, marginBottom: "24px" }}>
                {t.howH2a}<br /><em>{t.howH2b}</em>
              </h2>
              <p style={{ color: "#9fcf9a", fontSize: "16px", lineHeight: 1.75, marginBottom: "24px" }}>{t.howSub}</p>
              <div className="how-cards" style={{ display: "flex", gap: "14px", marginBottom: "36px" }}>
                {[t.humanCard, t.aiCard].map(([icon, label, text]: [string, string, string]) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", flex: 1 }}>
                    <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#6aaa65", letterSpacing: "1px", marginBottom: "5px" }}>{label}</div>
                    <div style={{ fontSize: "13px", color: "#c8f0c4", lineHeight: 1.5 }}>{text}</div>
                  </div>
                ))}
              </div>
              <a href="/submit" style={{ textDecoration: "none" }}><button style={{ background: "#e8f5e4", color: "#1a3d16", border: "none", borderRadius: "24px", padding: "13px 28px", fontFamily: "monospace", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>{t.pipeBtn}</button></a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {t.steps.map(([num, icon, title, desc]: [string, string, string, string]) => (
                <div key={num} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#6aaa65", background: "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "5px 12px", flexShrink: 0, marginTop: "2px", whiteSpace: "nowrap" }}>
                    {icon} {t.stepWord} {num}
                  </div>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "17px", color: "#e8f5e4", marginBottom: "5px" }}>{title}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#9fcf9a", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "72px 48px" }}>
          <div className="cta-inner" style={{ background: "#1e1609", borderRadius: "28px", padding: "64px" }}>
            <div className="cta-grid">
              <div>
                <h2 className="cta-h2" style={{ fontFamily: "Georgia, serif", fontSize: "44px", color: "#e8dfc8", marginBottom: "16px", letterSpacing: "-0.5px" }}>
                  {t.ctaH2a}<br />{t.ctaH2b}
                </h2>
                <p style={{ color: "#8a7355", fontSize: "16px", lineHeight: 1.75, maxWidth: "520px" }}>{t.ctaSub}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                <a href="/submit" style={{ textDecoration: "none" }}><button style={{ background: "#3a7a32", color: "#e8f5e4", border: "none", borderRadius: "24px", padding: "16px 32px", fontFamily: "monospace", fontSize: "14px", cursor: "pointer", fontWeight: "500", whiteSpace: "nowrap" }}>{t.ctaBtn}</button></a>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#6b5840", textAlign: "center" }}>{t.ctaNote}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(180,160,120,0.2)" }}>
          <div className="footer-inner" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", padding: "40px 48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "900", fontSize: "18px", color: "#1e1609" }}>Culirated</span>
              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#b8a882" }}>— {t.footerTag}</span>
            </div>
            <div className="footer-links" style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {t.footerLinks.map((l: string) => (
                <span key={l} style={{ fontFamily: "monospace", fontSize: "12px", color: "#8a7355", cursor: "pointer" }}>{l}</span>
              ))}
            </div>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#b8a882" }}>© 2025 Culirated</span>
          </div>
        </footer>
      </div>
    </>
  );
}
