"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SUPPORTED = ["nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];

function detectLang(): string {
  if (typeof document === "undefined") return "en";
  const cookie = document.cookie.split(";").find(c => c.trim().startsWith("culirated_lang="));
  if (cookie) {
    const val = cookie.split("=")[1]?.trim();
    if (val && SUPPORTED.includes(val)) return val;
  }
  const b = (navigator.language || "en").split("-")[0].toLowerCase();
  return SUPPORTED.includes(b) ? b : "en";
}

export default function StaticPageClient({
  page,
  children,
}: {
  page: string;
  children: React.ReactNode;
}) {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const detectedLang = detectLang();
    setLang(detectedLang);

    if (detectedLang === "en") {
      setReady(true);
      return;
    }

    supabase
      .from("static_page_translations")
      .select("content")
      .eq("page", page)
      .eq("lang", detectedLang)
      .single()
      .then(({ data }) => {
        if (data?.content) setTranslatedContent(data.content);
        setReady(true);
      });
  }, [page]);

  // Toon niks tijdens het laden (voorkomt flash van Engelse content)
  if (!ready) return null;

  // Vertaald
  if (translatedContent) {
    return (
      <div
        className="translated-content"
        dangerouslySetInnerHTML={{ __html: translatedContent }}
      />
    );
  }

  // Engels fallback
  return <>{children}</>;
}
