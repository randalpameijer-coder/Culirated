# Culirated — Vertaalstrategie

## Welke pagina's worden vertaald?

**20 talen (volledig vertaald):**
- Receptpagina's: `culirated.com/recept/[lang]/[slug]` — actieve route via `app/recept/[lang]/[slug]/page.tsx`
- Homepage UI: titels, knoppen, labels via server-side taaldetectie (middleware + cookie)

**Alleen Engels (bewust niet vertaald):**
- `/about`, `/how-it-works`, `/privacy`, `/terms`, `/contact`

Reden: statische pagina's met weinig SEO-waarde.

## URL-architectuur (KRITIEK)

**Actieve route:** `app/recept/[lang]/[slug]/page.tsx`
**Nooit gebruiken:** `app/[lang]/recept/[slug]/page.tsx` — bestaat als redirect naar de actieve route

De volgorde is `/recept/[lang]/[slug]` — NIET `/[lang]/recept/[slug]`.

Canonical tags en hreflang zitten correct in `generateMetadata()` in de server component.

## Taaldetectie

- Homepage leest `culirated_lang` cookie via `detectLang()` functie
- `useState<string>(() => detectLang())` — direct initialiseren, NIET via useEffect (anders verkeerde taal bij eerste fetch)
- Receptenpagina: zelfde patroon — `useState<string>(() => typeof window === "undefined" ? "en" : detectLang())`
- `/reset` route wist cookie voor testen

## Batching: 1 taal per API call (april 2026)

**Huidige aanpak:** 1 taal per batch — meest betrouwbaar, geen JSON truncatie.

Eerder: 2 talen per batch. Daarvoor: 4 talen. Daarvoor: 19 talen in één call (veroorzaakte JSON truncatie).

```js
const LANG_BATCHES = [
  ["nl"], ["de"], ["fr"], ["es"],
  ["it"], ["pt"], ["pl"], ["ru"],
  ["ja"], ["zh"], ["ko"], ["ar"],
  ["tr"], ["sv"], ["da"], ["no"],
  ["hi"], ["id"], ["th"],
];
```

## Backfill script

Script: `backfill.mjs` in de root van het project.
- Haalt automatisch onvertaalde recepten op uit Supabase
- 1 taal per batch, 300ms delay tussen batches
- Gebruik `upsert` met `onConflict: "recipe_id,lang"`

```powershell
node C:\Users\Randa\culirated\backfill.mjs
```

Controleer onvertaalde recepten:
```sql
select count(*) from recipes r
where status = 'approved'
and not exists (
  select 1 from recipe_translations rt
  where rt.recipe_id = r.id
);
```

## Dagelijkse generatie

24 recepten per dag via Vercel cron (`?cat=0` t/m `?cat=23`).
- Vertalingen worden direct na generatie opgeslagen
- Als vertalingen mislukken: recept staat wel in database maar zonder vertalingen → run `backfill.mjs`
- Controleer Vercel cron logs als recepten zonder vertalingen opduiken

**Let op:** Cron gebruikt `SUPABASE_SERVICE_KEY` (niet `SUPABASE_SERVICE_ROLE_KEY`).

## Sitemap

Ingediend bij Google Search Console: `sitemaps.xml` (de index).

| Bestand | URL | Inhoud |
|---|---|---|
| `app/sitemap.ts` | `/sitemap.xml` | Alleen statische pagina's |
| `app/sitemaps.xml/route.ts` | `/sitemaps.xml` | Sitemap index |
| `app/sitemap/[lang]/route.ts` | `/sitemap/en.xml` etc. | Per taal alle recepten |

## Huidige stand (2 april 2026)

- ~630 recepten approved, volledig vertaald in 20 talen
- ~12.600 URLs in sitemap (630 × 20 talen)
- Duplicate canonical probleem opgelost (redirect van oude `[lang]/recept/[slug]` route)
- Batching: 1 taal per call

## Kosten

| Model | Per recept (20 talen) | Per dag (24 recepten) | Per maand |
|---|---|---|---|
| Haiku | ~$0,02 | ~$0,48 | ~$14 |
