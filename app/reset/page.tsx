"use client";
import { useEffect } from "react";

export default function ResetPage() {
  useEffect(() => {
    localStorage.clear();
    // Wis taal cookie zodat middleware opnieuw browsertaal detecteert
    document.cookie = "culirated_lang=;max-age=0;path=/;samesite=lax";
    window.location.href = "/";
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: "14px", color: "#8a7355" }}>
      ⏱️ Cache wissen...
    </div>
  );
}
