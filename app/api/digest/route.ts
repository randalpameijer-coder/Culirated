import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Kanaal labels NL + kleuren
const CHANNEL_META: Record<string, { label: string; color: string }> = {
  "Organic Search":  { label: "Organisch zoeken",  color: "#3a7a32" },
  "Organic Social":  { label: "Organisch social",   color: "#185FA5" },
  "Direct":          { label: "Direct",              color: "#854F0B" },
  "Referral":        { label: "Referral",            color: "#534AB7" },
  "Paid Search":     { label: "Betaald zoeken",      color: "#993C1D" },
  "Paid Social":     { label: "Betaald social",      color: "#993C1D" },
  "Email":           { label: "E-mail",              color: "#3B6D11" },
  "Unassigned":      { label: "Onbekend",            color: "#b8a882" },
};

// Platform iconen
const PLATFORM_ICON: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  pinterest: "📌",
  facebook: "👤",
  twitter: "🐦",
  youtube: "▶️",
  linkedin: "💼",
  reddit: "🔴",
  google: "🔍",
  bing: "🔎",
  "(direct)": "🔗",
};

function getPlatformIcon(source: string): string {
  const s = source.toLowerCase();
  for (const [key, icon] of Object.entries(PLATFORM_ICON)) {
    if (s.includes(key)) return icon;
  }
  return "🌐";
}

function buildEmailHtml(data: any) {
  const {
    visitors, pageviews, avgDuration, bounceRate, newVsReturning,
    topPages, trafficSources, countries,
    totalRecipes, translatedRecipes, communityPhotosYesterday,
    seoClicks, seoImpressions, seoPosition, seoTopQueries, seoTopPages,
    topLangs, reactions, socialPostsYesterday,
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Culirated · Dagelijkse Digest</title>
</head>
<body style="margin:0;padding:0;background:#e8e0d0;font-family:sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:24px 16px;">
    <div style="background:#faf7f2;border-radius:12px;overflow:hidden;border:1px solid #d4c8b0;">

      <div style="background:#1e1609;padding:10px 28px;font-family:monospace;font-size:10px;letter-spacing:1.5px;color:#8a7355;text-align:center;">
        AI CREATES THE RECIPE · YOU COOK IT · COMMUNITY RATES
      </div>

      <div style="background:#f5f0e8;padding:28px 32px 20px;border-bottom:1px solid #e0d8c8;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1e1609;letter-spacing:-0.5px;">Culirated</div>
            <div style="font-family:monospace;font-size:10px;color:#8a7355;letter-spacing:1px;margin-top:4px;">DAGELIJKSE ANALYTICS DIGEST</div>
          </div>
          <div style="display:inline-flex;align-items:center;gap:5px;background:#e8f5e4;border:1px solid #3a7a32;border-radius:20px;padding:3px 10px;font-family:monospace;font-size:9px;color:#3a7a32;letter-spacing:1px;">
            AI RAPPORT
          </div>
        </div>
        <div style="font-family:monospace;font-size:11px;color:#b8a882;margin-top:12px;">
          ${new Date().toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · Automatisch verzonden om 07:00
        </div>
      </div>

      <!-- VERKEER -->
      <div style="padding:24px 32px;border-bottom:1px solid #ede6d6;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">Verkeer · afgelopen 24 uur</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${visitors.toLocaleString("nl-NL")}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Bezoekers</div>
              </div>
            </td>
            <td width="33%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${pageviews.toLocaleString("nl-NL")}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Pageviews</div>
              </div>
            </td>
            <td width="33%">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${avgDuration}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Gem. sessieduur</div>
              </div>
            </td>
          </tr>
          <tr><td colspan="3" style="padding-top:8px;"></td></tr>
          <tr>
            <td width="33%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${bounceRate}%</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Bouncepercentage</div>
              </div>
            </td>
            <td width="33%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${newVsReturning}%</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Nieuw vs. terugkerend</div>
              </div>
            </td>
            <td width="33%">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${communityPhotosYesterday}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Foto uploads gisteren</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- CONTENT -->
      <div style="padding:24px 32px;border-bottom:1px solid #ede6d6;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">Content & vertalingen</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${totalRecipes.toLocaleString("nl-NL")}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Totaal recepten</div>
              </div>
            </td>
            <td width="33%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${translatedRecipes.toLocaleString("nl-NL")}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Vertaald (20 talen)</div>
              </div>
            </td>
            <td width="33%">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${socialPostsYesterday}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Social posts gisteren</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- COMMUNITY REACTIES -->
      <div style="padding:24px 32px;border-bottom:1px solid #ede6d6;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">Community reacties · gisteren</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="25%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;text-align:center;">
                <div style="font-size:20px;line-height:1;margin-bottom:6px;">🔥</div>
                <div style="font-family:Georgia,serif;font-size:22px;color:#1e1609;line-height:1;margin-bottom:4px;">${reactions.fire}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;">FIRE</div>
              </div>
            </td>
            <td width="25%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;text-align:center;">
                <div style="font-size:20px;line-height:1;margin-bottom:6px;">❤️</div>
                <div style="font-family:Georgia,serif;font-size:22px;color:#1e1609;line-height:1;margin-bottom:4px;">${reactions.heart}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;">LOVE</div>
              </div>
            </td>
            <td width="25%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;text-align:center;">
                <div style="font-size:20px;line-height:1;margin-bottom:6px;">👨‍🍳</div>
                <div style="font-family:Georgia,serif;font-size:22px;color:#1e1609;line-height:1;margin-bottom:4px;">${reactions.chef}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;">MADE IT</div>
              </div>
            </td>
            <td width="25%">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;text-align:center;">
                <div style="font-size:20px;line-height:1;margin-bottom:6px;">💬</div>
                <div style="font-family:Georgia,serif;font-size:22px;color:#1e1609;line-height:1;margin-bottom:4px;">${reactions.total}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;">TOTAAL</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- SEO -->
      <div style="padding:24px 32px;border-bottom:1px solid #ede6d6;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">SEO · Google Search Console</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${seoPosition}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Gem. positie</div>
              </div>
            </td>
            <td width="33%" style="padding-right:8px;">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${seoClicks.toLocaleString("nl-NL")}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Clicks</div>
              </div>
            </td>
            <td width="33%">
              <div style="background:#fff;border:1px solid #e0d8c8;border-radius:10px;padding:14px 16px;">
                <div style="font-family:Georgia,serif;font-size:26px;color:#1e1609;line-height:1;margin-bottom:4px;">${seoImpressions.toLocaleString("nl-NL")}</div>
                <div style="font-family:monospace;font-size:9px;color:#8a7355;letter-spacing:1px;text-transform:uppercase;">Impressies</div>
              </div>
            </td>
          </tr>
        </table>
        ${seoTopQueries.length > 0 ? `
        <div style="margin-top:16px;">
          <div style="font-family:monospace;font-size:9px;letter-spacing:1px;color:#b8a882;text-transform:uppercase;margin-bottom:8px;">Top zoektermen</div>
          ${seoTopQueries.map((q: any, i: number) => `
            <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #ede6d6;">
              <span style="font-family:monospace;font-size:10px;color:#b8a882;width:16px;">#${i + 1}</span>
              <span style="font-family:Georgia,serif;font-size:13px;color:#1e1609;flex:1;">${q.query}</span>
              <span style="font-family:monospace;font-size:10px;color:#8a7355;">pos. ${q.position}</span>
              <span style="font-family:monospace;font-size:10px;color:#3a7a32;min-width:60px;text-align:right;">${q.clicks} clicks</span>
            </div>
          `).join("")}
        </div>
        ` : `<div style="font-family:monospace;font-size:11px;color:#b8a882;margin-top:12px;">Nog geen Search Console data beschikbaar.</div>`}
      </div>

      <!-- TOP PAGINAS -->
      <div style="padding:24px 32px;border-bottom:1px solid #ede6d6;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">Top 5 pagina's vandaag</div>
        ${topPages.map((p: any, i: number) => `
          <div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid #ede6d6;">
            <span style="font-family:monospace;font-size:11px;color:#b8a882;width:20px;">#${i + 1}</span>
            <span style="font-family:Georgia,serif;font-size:13px;color:#1e1609;flex:1;">${p.title || p.page}</span>
            <span style="font-family:monospace;font-size:11px;color:#3a7a32;">${p.views.toLocaleString("nl-NL")} pv</span>
          </div>
        `).join("")}
      </div>

      <!-- SEO GEINDEXEERDE PAGINAS -->
      ${seoTopPages.length > 0 ? `
      <div style="padding:24px 32px;border-bottom:1px solid #ede6d6;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">Top rankende pagina's · Search Console</div>
        ${seoTopPages.map((p: any, i: number) => `
          <div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid #ede6d6;">
            <span style="font-family:monospace;font-size:11px;color:#b8a882;width:20px;">#${i + 1}</span>
            <span style="font-family:Georgia,serif;font-size:13px;color:#1e1609;flex:1;">${p.title || p.page}</span>
            <span style="font-family:monospace;font-size:10px;color:#8a7355;">pos. ${p.position}</span>
            <span style="font-family:monospace;font-size:10px;color:#3a7a32;min-width:60px;text-align:right;">${p.clicks} clicks</span>
          </div>
        `).join("")}
      </div>
      ` : ""}

      <!-- TOP TALEN -->
      ${topLangs.length > 0 ? `
      <div style="padding:24px 32px;border-bottom:1px solid #ede6d6;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">Top talen · bezochte receptpagina's</div>
        ${topLangs.map((l: any, i: number) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-family:monospace;font-size:11px;color:#b8a882;width:20px;">#${i + 1}</span>
            <span style="font-family:monospace;font-size:11px;color:#1e1609;width:40px;text-transform:uppercase;">${l.lang}</span>
            <div style="flex:1;background:#ede6d6;border-radius:4px;height:8px;">
              <div style="width:${l.pct}%;height:100%;border-radius:4px;background:#185FA5;"></div>
            </div>
            <span style="font-family:monospace;font-size:10px;color:#8a7355;width:36px;text-align:right;">${l.pct}%</span>
            <span style="font-family:monospace;font-size:10px;color:#3a7a32;min-width:40px;text-align:right;">${l.views} pv</span>
          </div>
        `).join("")}
      </div>
      ` : ""}

      <!-- VERKEERSBRONNEN UITGESPLITST -->
      <div style="padding:24px 32px;border-bottom:1px solid #ede6d6;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">Verkeersbronnen · herkomst</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="background:#f5f0e8;">
              <th style="font-family:monospace;font-size:9px;color:#b8a882;letter-spacing:1px;text-transform:uppercase;text-align:left;padding:8px 10px;border-bottom:2px solid #e0d8c8;">Kanaal</th>
              <th style="font-family:monospace;font-size:9px;color:#b8a882;letter-spacing:1px;text-transform:uppercase;text-align:left;padding:8px 10px;border-bottom:2px solid #e0d8c8;">Platform</th>
              <th style="font-family:monospace;font-size:9px;color:#b8a882;letter-spacing:1px;text-transform:uppercase;text-align:right;padding:8px 10px;border-bottom:2px solid #e0d8c8;">Sessies</th>
              <th style="font-family:monospace;font-size:9px;color:#b8a882;letter-spacing:1px;text-transform:uppercase;text-align:right;padding:8px 10px;border-bottom:2px solid #e0d8c8;">%</th>
            </tr>
          </thead>
          <tbody>
            ${trafficSources.map((r: any) => `
              <tr style="background:${r.isSubrow ? "#faf7f2" : "#fff"};">
                <td style="font-family:monospace;font-size:${r.isSubrow ? "10px" : "11px"};color:${r.isSubrow ? "#b8a882" : r.color};padding:${r.isSubrow ? "5px 10px 5px 24px" : "9px 10px"};border-bottom:1px solid #ede6d6;font-weight:${r.isSubrow ? "normal" : "600"};">
                  ${!r.isSubrow ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${r.color};margin-right:6px;vertical-align:middle;"></span>` : ""}${r.channel}
                </td>
                <td style="font-family:monospace;font-size:11px;color:#1e1609;padding:${r.isSubrow ? "5px 10px" : "9px 10px"};border-bottom:1px solid #ede6d6;">
                  ${r.icon ? `${r.icon} ` : ""}${r.source}
                </td>
                <td style="font-family:Georgia,serif;font-size:${r.isSubrow ? "12px" : "14px"};color:#1e1609;text-align:right;padding:${r.isSubrow ? "5px 10px" : "9px 10px"};border-bottom:1px solid #ede6d6;">${r.sessions}</td>
                <td style="font-family:monospace;font-size:10px;color:#8a7355;text-align:right;padding:${r.isSubrow ? "5px 10px" : "9px 10px"};border-bottom:1px solid #ede6d6;">${r.pct}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- LANDEN -->
      <div style="padding:24px 32px;">
        <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#b8a882;text-transform:uppercase;margin-bottom:14px;">Top landen</div>
        ${countries.map((c: any) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ede6d6;font-family:monospace;font-size:11px;">
            <span>${c.name}</span>
            <span style="color:#3a7a32;">${c.sessions.toLocaleString("nl-NL")} sessies</span>
          </div>
        `).join("")}
      </div>

      <div style="background:#1e1609;padding:20px 32px;">
        <p style="font-family:monospace;font-size:10px;color:#6b5840;line-height:1.7;margin:0;">
          Automatisch gegenereerd · Google Analytics 4 + Search Console · culirated.com · © 2025 Culirated
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const credentials = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY!);
    const analyticsClient = new BetaAnalyticsDataClient({ credentials });
    const propertyId = process.env.GA4_PROPERTY_ID!;
    const siteUrl = "https://culirated.com";

    // ── GA4 ──────────────────────────────────────────────────────────────────
    const [overviewResponse] = await analyticsClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "newUsers" },
      ],
    });

    const [pagesResponse] = await analyticsClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5,
    });

    // Bronnen: kanaal + source gecombineerd voor maximale uitsplitsing
    const [channelResponse] = await analyticsClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      dimensions: [
        { name: "sessionDefaultChannelGroup" },
        { name: "sessionSource" },
      ],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 30,
    });

    const [countriesResponse] = await analyticsClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 5,
    });

    // Top talen via pagePath
    const [langsResponse] = await analyticsClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/recept/" },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 200,
    });

    const row = overviewResponse.rows?.[0];
    const visitors = parseInt(row?.metricValues?.[0]?.value || "0");
    const pageviews = parseInt(row?.metricValues?.[1]?.value || "0");
    const durationSec = parseFloat(row?.metricValues?.[2]?.value || "0");
    const minutes = Math.floor(durationSec / 60);
    const seconds = Math.floor(durationSec % 60);
    const avgDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    const bounceRate = Math.round(parseFloat(row?.metricValues?.[3]?.value || "0") * 100);
    const newUsers = parseInt(row?.metricValues?.[4]?.value || "0");
    const newVsReturning = visitors > 0 ? Math.round((newUsers / visitors) * 100) : 0;

    const rawTopPages = (pagesResponse.rows || []).map((r) => ({
      page: r.dimensionValues?.[0]?.value || "/",
      views: parseInt(r.metricValues?.[0]?.value || "0"),
    }));

    // Bronnen verwerken: groepeer per kanaal, toon subrows per platform
    const totalSessions = (channelResponse.rows || []).reduce(
      (sum, r) => sum + parseInt(r.metricValues?.[0]?.value || "0"), 0
    );

    type ChannelGroup = { sessions: number; sources: { source: string; sessions: number }[] };
    const channelMap: Record<string, ChannelGroup> = {};
    for (const r of channelResponse.rows || []) {
      const channel = r.dimensionValues?.[0]?.value || "Unassigned";
      const source = r.dimensionValues?.[1]?.value || "(direct)";
      const sessions = parseInt(r.metricValues?.[0]?.value || "0");
      if (!channelMap[channel]) channelMap[channel] = { sessions: 0, sources: [] };
      channelMap[channel].sessions += sessions;
      channelMap[channel].sources.push({ source, sessions });
    }

    // Bouw tabelrijen: kanaalregel + subrows per platform
    const trafficSources: any[] = [];
    const sortedChannels = Object.entries(channelMap).sort((a, b) => b[1].sessions - a[1].sessions);

    for (const [channel, data] of sortedChannels) {
      const meta = CHANNEL_META[channel] || { label: channel, color: "#b8a882" };
      const pct = Math.round((data.sessions / Math.max(totalSessions, 1)) * 100);

      trafficSources.push({
        isSubrow: false,
        channel: meta.label,
        source: "",
        icon: "",
        sessions: data.sessions,
        pct,
        color: meta.color,
      });

      const sortedSources = data.sources.sort((a, b) => b.sessions - a.sessions);
      for (const s of sortedSources) {
        if (!s.source || s.source === "(not set)") continue;
        const subPct = Math.round((s.sessions / Math.max(totalSessions, 1)) * 100);
        trafficSources.push({
          isSubrow: true,
          channel: "",
          source: s.source,
          icon: getPlatformIcon(s.source),
          sessions: s.sessions,
          pct: subPct,
          color: meta.color,
        });
      }
    }

    const countries = (countriesResponse.rows || []).map((r) => ({
      name: r.dimensionValues?.[0]?.value || "Onbekend",
      sessions: parseInt(r.metricValues?.[0]?.value || "0"),
    }));

    // Talen aggregeren
    const langViewMap: Record<string, number> = {};
    for (const r of langsResponse.rows || []) {
      const path = r.dimensionValues?.[0]?.value || "";
      const match = path.match(/^\/recept\/([a-z]{2})\//);
      if (match) {
        const lang = match[1];
        langViewMap[lang] = (langViewMap[lang] || 0) + parseInt(r.metricValues?.[0]?.value || "0");
      }
    }
    const totalLangViews = Object.values(langViewMap).reduce((s, v) => s + v, 0);
    const topLangs = Object.entries(langViewMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([lang, views]) => ({
        lang,
        views,
        pct: Math.round((views / Math.max(totalLangViews, 1)) * 100),
      }));

    // ── Supabase ──────────────────────────────────────────────────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const recipeIds = rawTopPages
      .map((p) => { const m = p.page.match(uuidRegex); return m ? m[1] : null; })
      .filter(Boolean) as string[];

    let recipeNameMap: Record<string, string> = {};
    if (recipeIds.length > 0) {
      const { data: recipeRows } = await supabase
        .from("recipes")
        .select("id, title")
        .in("id", recipeIds);
      (recipeRows || []).forEach((r: any) => { recipeNameMap[r.id] = r.title; });
    }

    const topPages = rawTopPages.map((p) => {
      const match = p.page.match(uuidRegex);
      const title = match ? recipeNameMap[match[1]] : null;
      return { ...p, title: title || p.page };
    });

    const { count: totalRecipes } = await supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: translatedRecipes } = await supabase
      .from("recipe_translations")
      .select("recipe_id", { count: "exact", head: true })
      .eq("lang", "en");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: communityPhotosYesterday } = await supabase
      .from("community_photos")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());

    const { count: socialPostsYesterday } = await supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .gte("posted_to_social", yesterday.toISOString())
      .lt("posted_to_social", today.toISOString());

    const { data: reactionRows } = await supabase
      .from("reactions")
      .select("type")
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());

    const reactions = {
      fire: (reactionRows || []).filter((r: any) => r.type === "fire").length,
      heart: (reactionRows || []).filter((r: any) => r.type === "heart").length,
      chef: (reactionRows || []).filter((r: any) => r.type === "chef").length,
      total: (reactionRows || []).length,
    };

    // ── Google Search Console ─────────────────────────────────────────────────
    let seoClicks = 0;
    let seoImpressions = 0;
    let seoPosition = "—";
    let seoTopQueries: { query: string; clicks: number; position: string }[] = [];
    let seoTopPages: { page: string; title: string; clicks: number; position: string }[] = [];

    try {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
      });
      const searchConsole = google.searchconsole({ version: "v1", auth });
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const [overviewSC, queriesSC, pagesSC] = await Promise.all([
        searchConsole.searchanalytics.query({
          siteUrl,
          requestBody: { startDate: yesterdayStr, endDate: yesterdayStr, dimensions: [] },
        }),
        searchConsole.searchanalytics.query({
          siteUrl,
          requestBody: { startDate: yesterdayStr, endDate: yesterdayStr, dimensions: ["query"], rowLimit: 5 },
        }),
        searchConsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: yesterdayStr,
            endDate: yesterdayStr,
            dimensions: ["page"],
            rowLimit: 5,
            dimensionFilterGroups: [{
              filters: [{ dimension: "page", operator: "contains", expression: "/recept/" }],
            }],
          },
        }),
      ]);

      const scRow = overviewSC.data.rows?.[0];
      if (scRow) {
        seoClicks = scRow.clicks || 0;
        seoImpressions = scRow.impressions || 0;
        seoPosition = scRow.position ? scRow.position.toFixed(1) : "—";
      }

      seoTopQueries = (queriesSC.data.rows || []).map((r: any) => ({
        query: r.keys?.[0] || "—",
        clicks: r.clicks || 0,
        position: r.position ? r.position.toFixed(1) : "—",
      }));

      const rawSeoPages = (pagesSC.data.rows || []).map((r: any) => ({
        page: (r.keys?.[0] || "").replace("https://culirated.com", ""),
        clicks: r.clicks || 0,
        position: r.position ? r.position.toFixed(1) : "—",
      }));
      const seoPageIds = rawSeoPages
        .map((p: any) => { const m = p.page.match(uuidRegex); return m ? m[1] : null; })
        .filter(Boolean) as string[];
      let seoPageNameMap: Record<string, string> = {};
      if (seoPageIds.length > 0) {
        const { data: seoRecipeRows } = await supabase
          .from("recipes")
          .select("id, title")
          .in("id", seoPageIds);
        (seoRecipeRows || []).forEach((r: any) => { seoPageNameMap[r.id] = r.title; });
      }
      seoTopPages = rawSeoPages.map((p: any) => {
        const match = p.page.match(uuidRegex);
        const title = match ? seoPageNameMap[match[1]] : null;
        return { ...p, title: title || p.page };
      });
    } catch (scErr) {
      console.warn("Search Console data niet beschikbaar:", scErr);
    }

    // ── Email sturen ──────────────────────────────────────────────────────────
    const html = buildEmailHtml({
      visitors, pageviews, avgDuration, bounceRate, newVsReturning,
      topPages, trafficSources, countries,
      totalRecipes: totalRecipes || 0,
      translatedRecipes: translatedRecipes || 0,
      communityPhotosYesterday: communityPhotosYesterday || 0,
      socialPostsYesterday: socialPostsYesterday || 0,
      seoClicks, seoImpressions, seoPosition, seoTopQueries, seoTopPages,
      topLangs,
      reactions,
    });

    await resend.emails.send({
      from: "Culirated <onboarding@resend.dev>",
      to: "randalpameijer@gmail.com",
      subject: `Culirated digest · ${new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Digest error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
