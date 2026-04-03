# Culirated — Vertaalstrategie

## Welke pagina's worden vertaald?

**20 talen (volledig vertaald):**
- Receptpagina's: `culirated.com/recept/[lang]/[slug]` — actieve route via `app/recept/[lang]/[slug]/page.tsx`
- Homepage UI: titels, knoppen, labels — direct uit Supabase `ui_translations` tabel
- Statische pagina's: `/about`, `/how-it-works`, `/privacy`, `/terms`, `/contact` — via `StaticPageClient.tsx` + Supabase `static_page_translations` tabel

## URL-architectuur (KRITIEK)

**Actieve route:** `app/recept/[lang]/[slug]/page.tsx`
**Nooit gebruiken:** `app/[lang]/recept/[slug]/page.tsx` — bestaat als redirect naar de actieve route

De volgorde is `/recept/[lang]/[slug]` — NIET `/[lang]/recept/[slug]`.

## Taaldetectie

- Homepage leest `culirated_lang` cookie via `detectLang()` functie
- `useState<string>(() => detectLang())` — direct initialiseren, NIET via useEffect
- `/reset` route wist cookie voor testen

## Homepage UI vertalingen

**Architectuur:** Homepage leest direct uit Supabase `ui_translations` — geen API tussenlaag.
- Eerste bezoek: Supabase query (~1-2 sec)
- Tweede bezoek: localStorage cache (instant)
- localStorage key: `culirated_t_v5_[lang]`

**Versie: v5** — `EN_STRINGS` in `app/api/translate-ui/route.ts` is de bron van waarheid.

**Bij wijziging `EN_STRINGS`:**
1. Versie ophogen in `route.ts` (v5 → v6)
2. Script runnen: `node C:\Users\Randa\culirated\translate-ui-all.mjs`
3. `/reset` bezoeken om eigen localStorage te wissen

**Bevat:**
- Alle homepage teksten (topbar, nav, hero, steps, footer)
- Stap 5 (community/your turn)
- Nav filter dropdowns (`navCats` met alle items)
- Footer links, footerTag, disclaimer
- Share-knop en Copy link labels
- AI criteria: Completeness, Ratios, Logic, Nutrition

## Statische pagina's vertalingen

- Supabase tabel: `static_page_translations` (page, lang, content, version, updated_at)
- Versie: **v1**
- Component: `app/StaticPageClient.tsx` — leest cookie, haalt vertaling op, toont niks tijdens laden (geen Engels flash), valt terug op Engels als geen vertaling
- Gebruikt anon key voor lezen (RLS policy: public select)
- Script gebruikt `SUPABASE_SERVICE_KEY` voor schrijven

**Bij wijziging statische pagina:**
1. Versie ophogen in `translate-static-pages.mjs` (v1 → v2)
2. Script runnen: `node C:\Users\Randa\culirated\translate-static-pages.mjs`

## RLS policies (KRITIEK)

Beide tabellen hebben RLS aan. Vereiste policies:

**`ui_translations`:**
- Lezen: public select policy (anon key mag lezen)
- Schrijven: service role policy (scripts gebruiken SUPABASE_SERVICE_KEY)

**`static_page_translations`:**
- Lezen: public select policy
- Schrijven: service role policy

## Scripts overzicht (root project)

| Script | Doel | Key | Wanneer runnen |
|---|---|---|---|
| `backfill.mjs` | Recepten zonder vertalingen | SERVICE_KEY | Als cron vertalingen heeft gemist |
| `translate-ui-all.mjs` | Homepage UI naar 19 talen | SERVICE_KEY | Na wijziging `EN_STRINGS` |
| `translate-static-pages.mjs` | Statische pagina's naar 19 talen | SERVICE_KEY | Na wijziging statische pagina |

## Batching recepten: 1 taal per API call

```js
const LANG_BATCHES = [
  ["nl"], ["de"], ["fr"], ["es"],
  ["it"], ["pt"], ["pl"], ["ru"],
  ["ja"], ["zh"], ["ko"], ["ar"],
  ["tr"], ["sv"], ["da"], ["no"],
  ["hi"], ["id"], ["th"],
];
```

## Dagelijkse generatie

24 recepten per dag via Vercel cron (`?cat=0` t/m `?cat=23`).
- Vertalingen worden direct na generatie opgeslagen
- Als vertalingen mislukken → run `backfill.mjs`

**Let op:** Cron gebruikt `SUPABASE_SERVICE_KEY` (niet `SUPABASE_SERVICE_ROLE_KEY`).

## Sitemap

| Bestand | URL | Inhoud |
|---|---|---|
| `app/sitemap.ts` | `/sitemap.xml` | Alleen statische pagina's |
| `app/sitemaps.xml/route.ts` | `/sitemaps.xml` | Sitemap index |
| `app/sitemap/[lang]/route.ts` | `/sitemap/en.xml` etc. | Per taal alle recepten |

## Huidige stand (april 2026)

- ~630+ recepten, volledig vertaald in 20 talen
- Homepage UI: versie v5, direct Supabase (geen API tussenlaag)
- Statische pagina's: versie v1
- AI criteria: Completeness, Ratios, Logic, Nutrition (SEO vervangen)
- 24 recepten per dag

## Kosten

| Model | Per recept (20 talen) | Per dag (24 recepten) | Per maand |
|---|---|---|---|
| Haiku | ~$0,02 | ~$0,48 | ~$14 |
