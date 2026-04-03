# Culirated — Platform Cost Overview
*Updated: March 2026*

---

## Fixed Monthly Costs

| Service | Plan | Cost/month |
|---|---|---|
| Vercel | Pro | $20.00 |
| Supabase | Free tier | $0.00 |
| Namecheap domain (culirated.com) | Annual / 12 | $1.25 |
| Claude Max (development & sessions) | Max plan | $100.00 |
| **Fixed total** | | **$121.25/month** |

---

## Variable API Costs — Current (8 recipes/day, EN only)

| Component | Model | Per recipe | Per day (8) | Per month |
|---|---|---|---|---|
| Trending search | Claude Opus | ~$0.05 | ~$0.40 | ~$12.00 |
| Recipe generation | Claude Opus | ~$0.10 | ~$0.80 | ~$24.00 |
| Quality check (independent) | Claude Opus | ~$0.08 | ~$0.64 | ~$19.20 |
| Food photo | DALL-E 3 | $0.04 | $0.32 | ~$9.60 |
| **Variable total (current)** | | | **~$2.16/day** | **~$64.80/month** |

---

## Variable API Costs — With Multilingual (20 languages)

| Component | Model | Per day | Per month |
|---|---|---|---|
| All current costs (above) | — | ~$2.16 | ~$64.80 |
| Translations (20 languages × 8 recipes) | Claude Sonnet | ~$0.20 | ~$6.00 |
| **Variable total (multilingual)** | | **~$2.36/day** | **~$70.80/month** |

---

## Total Monthly Cost

| Scenario | Fixed | Variable | **Total** |
|---|---|---|---|
| Current (EN only) | $121.25 | $64.80 | **~$186/month** |
| With multilingual (20 languages) | $121.25 | $70.80 | **~$192/month** |

---

## Annual Cost Estimate

| Scenario | Cost/year |
|---|---|
| Current (EN only) | ~$2,230 |
| With multilingual | ~$2,300 |

---

## Notes

- Claude Max ($100/month) covers all development sessions and manual testing — not charged per token in that plan
- Supabase Free tier covers up to 500MB database and 1GB storage; upgrade to Pro ($25/month) when traffic grows
- DALL-E 3 at $0.04/image (standard quality, 1024×1024)
- Anthropic API token costs are estimates based on average recipe length (~800 tokens input, ~600 tokens output)
- Vercel Pro required for cron jobs on custom domains
- Domain renewal: Namecheap ~$15/year = ~$1.25/month

---

## Content Growth

| Period | Recipes (EN) | Indexed pages (multilingual) |
|---|---|---|
| Month 1 | ~240 | ~4,800 |
| Month 3 | ~720 | ~14,400 |
| Month 6 | ~1,440 | ~28,800 |
| Month 12 | ~2,920 | ~58,400 |

*Based on 8 recipes/day × 20 languages*

---

## Cost per Recipe Published

| Scenario | Cost per recipe |
|---|---|
| Current (EN only) | ~$0.27 |
| With multilingual (20 languages) | ~$0.30 total / ~$0.015 per language version |
