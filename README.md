# Macro Economic Cycle Tracker

Track where we are in the economic cycle and get portfolio guidance — powered by live FRED data, classified by a weighted 7-indicator engine, displayed as a React SPA.

---

## Concept

The economy moves in cycles — **Spring** (recovery), **Summer** (peak), **Autumn** (tightening), **Winter** (contraction). Each season has an early and late phase = 8 total positions. This app fetches live FRED data, classifies the current phase using weighted indicator scoring, and provides phase-appropriate portfolio recommendations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript (`tsx`) |
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Data | FRED API (17 series, 4hr file cache) |
| Database | Supabase (portfolio positions + snapshots + season log) |
| Prices | Yahoo Finance (stocks/ETFs) + CoinGecko (crypto) |

---

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env: add FRED_API_KEY and Supabase keys
npm run dev           # starts Express on :3000
```

For the React frontend in development:
```bash
cd client && npm install && npm run dev   # Vite on :5173 with proxy to :3000
```

See [docs/architecture.md](docs/architecture.md) for how it all fits together.

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Current season, confidence, 16 macro metrics, portfolio allocation |
| Playbook | `/playbook` | Phase model — trade ideas, sector weights, alts/crypto |
| Charts | `/charts` | 41 TradingView chart links in 10 categories |
| History | `/history` | 35 years of Fed rate decisions (113 total) |
| Learn | `/learn` | Cheat sheets, glossary, video library |
| About | `/about` | Project overview |
| Portfolio | `/portfolio` | Your holdings, live prices, pie chart, weekly snapshots |

---

## API

Full reference: [docs/api.md](docs/api.md)

| Endpoint | Description |
|----------|-------------|
| `GET /api/data` | Season classification + portfolio rec + FOMC calendar |
| `GET /api/refresh` | Bust cache, re-fetch all FRED series |
| `GET /api/history` | 113 rate decisions (1990–2026) |
| `GET /api/charts` | 41 TradingView chart links |
| `GET /api/glossary` | 35 economic terms |
| `GET /api/phases` | All 8 phase models |
| `GET /api/price/:symbol` | Live stock/ETF price |
| `GET /api/price/crypto/:coinId` | Live crypto price |
| `GET /api/portfolio/positions` | Portfolio holdings with live prices |
| `POST /api/portfolio/positions` | Add a position |
| `DELETE /api/portfolio/positions/:id` | Remove a position |
| `GET/POST /api/portfolio/snapshot` | Weekly snapshot history |

---

## Supabase

Portfolio data and season history are stored in Supabase. See [supabase/SUPABASE.md](supabase/SUPABASE.md) for:
- Table schemas
- First-time migration steps
- Keepalive strategy (daily GitHub Actions + organic `/api/data` logging)
- GitHub secrets setup

---

## Data Sources

- [FRED API](https://fred.stlouisfed.org/docs/api/fred/) — Federal Reserve Economic Data
- Yahoo Finance — stock/ETF prices
- CoinGecko — crypto prices
- FOMC calendar hardcoded for 2026
- Rate history hardcoded 1990–2026

---

## Disclaimer

Educational only. Not financial advice. Historical patterns from public data. Past performance ≠ future results. Do your own research. Consult a financial advisor.
