# Architecture

## Overview

```
FRED API (17 series)
       ↓
  4hr file cache (data/cache/)
       ↓
  fetchAllSeries()  [src/lib/fred.ts]
       ↓
  classifySeason()  [src/lib/season.ts]   ← 7 weighted indicators
       ↓
  buildPortfolioRec()  [src/lib/portfolio.ts]
       ↓
  GET /api/data  [src/server.ts]           ← also logs to Supabase season_log
       ↓
  React SPA  [client/src/]
       ↓
  SeasonContext → CSS custom properties → all pages themed
```

---

## Classification Engine

**File:** `src/lib/season.ts`

7 indicators scored 0–1 for each of 4 seasons, then normalized to 0–100:

| Indicator | Weight | Source |
|-----------|--------|--------|
| Fed direction | 25% | FEDFUNDS trend |
| Yield curve | 20% | T10Y2Y spread |
| Unemployment | 15% | UNRATE trend |
| Inflation | 15% | CPIAUCSL trend |
| HY spreads | 10% | BAMLH0A0HYM2 |
| NFP (payrolls) | 10% | PAYEMS trend |
| Fed balance sheet | 5% | WALCL trend |

Winner = highest normalized score → season. Phase (early/late) from leading indicators. Confidence = margin between top two scores, scaled 50–99%.

---

## Data Flow

### FRED Cache
- `src/lib/fred.ts` fetches 17 FRED series (60 observations each, ~5 years)
- `src/lib/cache.ts` stores each series as JSON in `data/cache/` with a 4hr TTL
- On cache hit: returns cached data immediately
- On cache miss: fetches from FRED, stores, returns
- On FRED error: returns stale cached data with `stale: true` flag

### API Response Shape
`GET /api/data` returns:
```ts
{
  snapshot: MacroSnapshot,   // all 17 FRED series + computed trends
  season: SeasonResult,      // season, phase, confidence, raw scores
  portfolio: PortfolioRec,   // allocation, sectors, trades, overlays
  prediction: Prediction,    // next season probability
  fomc: FomcMeeting[],       // upcoming FOMC dates
  timestamp: string,
  stale: boolean
}
```

---

## Frontend

**Stack:** React 19, React Router v7, Tailwind CSS 4, Vite

### Season Theming
`client/src/context/SeasonContext.tsx` fetches `/api/data` on mount and sets CSS custom properties on `<html>`:
```
--season-primary, --season-accent, --season-dark, --season-bg, --season-bg-dark
```
All 7 pages read these properties — changing season automatically re-themes the entire app.

### Dev vs Prod
- **Dev:** `cd client && npm run dev` — Vite on `:5173`, proxies `/api/*` to `:3000`
- **Prod:** `npm run build` in client/ → outputs to `client-dist/` → Express serves it as static files

### Pages
Each page is a React component in `client/src/pages/`. Data fetched from the Express API. Routing via React Router in `client/src/App.tsx`.

---

## Portfolio Feature

### Backend (`src/server.ts`)
- `GET /api/portfolio/positions` — reads from Supabase `positions` table, enriches auto-mode positions with live prices from Yahoo Finance / CoinGecko
- `POST /api/portfolio/positions` — inserts to Supabase
- `DELETE /api/portfolio/positions/:id` — deletes from Supabase
- `GET/POST /api/portfolio/snapshots` — weekly total-value history

### Price Fetching (`src/lib/priceService.ts`)
- Stocks/ETFs: Yahoo Finance (unofficial API)
- Crypto: CoinGecko public API
- 15-minute in-memory cache per symbol

### Frontend (`client/src/pages/Portfolio.tsx`)
- Donut chart showing allocation by asset type
- Position list with live prices and current values
- Weekly snapshot chart (gain/loss over time)

---

## Supabase

4 tables — see [supabase/SUPABASE.md](../supabase/SUPABASE.md):
- `positions` — portfolio holdings
- `portfolio_snapshots` — weekly total-value history
- `keepalive_pings` — single-row updated by scheduled keepalive
- `season_log` — auto-populated on every `/api/data` call (fire-and-forget)

Client: `src/lib/supabaseClient.ts` (backend) + `client/src/lib/supabase.ts` (frontend). Both return `null` if env vars are missing — all Supabase-dependent routes gracefully return 503.
