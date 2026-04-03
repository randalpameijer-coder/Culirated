import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGS = ["en","nl","de","fr","es","it","pt","pl","ru","ja","zh","ko","ar","tr","sv","da","no","hi","id","th"];
const COOKIE_NAME = "culirated_lang";

function detectLang(req: NextRequest): string {
  // Accept-Language header
  const header = req.headers.get("accept-language") || "";
  const langs = header.split(",").map(l => l.split(";")[0].trim().split("-")[0].toLowerCase());
  for (const lang of langs) {
    if (SUPPORTED_LANGS.includes(lang)) return lang;
  }
  return "en";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sla statische bestanden en API routes over
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Alleen cookie zetten als er nog geen bestaat (gebruikerskeuze heeft prioriteit)
  const existingCookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!existingCookie || !SUPPORTED_LANGS.includes(existingCookie)) {
    const lang = detectLang(req);
    response.cookies.set(COOKIE_NAME, lang, {
      maxAge: 60 * 60 * 24 * 365, // 1 jaar
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
