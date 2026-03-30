# API Reference

Base URL: `http://localhost:3000` (dev) or your deployed URL.

---

## Macro Data

### `GET /api/data`
Main endpoint. Returns the current macro snapshot, season classification, portfolio recommendation, and FOMC calendar.

**Response:**
```json
{
  "snapshot": { /* MacroSnapshot — 17 FRED series */ },
  "season": {
    "season": "spring",
    "phase": "late",
    "confidence": 62,
    "scores": { "spring": 62, "summer": 27, "autumn": 11, "winter": 20 }
  },
  "portfolio": {
    "phase": "Late Spring",
    "risk": "Moderate",
    "allocation": { "equities": 60, "bonds": 20, "cash": 10, "alts": 10 },
    "sectors": [ /* overweight/neutral/underweight */ ],
    "trades": { "buy": [], "hold": [], "sell": [] },
    "overlays": []
  },
  "prediction": { /* next season probabilities */ },
  "fomc": [ /* upcoming FOMC meeting dates */ ],
  "timestamp": "2026-03-30T08:00:00.000Z",
  "stale": false
}
```

---

### `GET /api/refresh`
Busts the FRED file cache and re-fetches all 17 series. Same response shape as `/api/data` plus `"refreshed": true`.

---

### `GET /api/history`
113 Fed rate decisions from 1990–2026.

**Response:**
```json
{
  "decisions": [
    {
      "date": "2026-01-29",
      "chair": "Powell",
      "rateBefore": 4.33,
      "rateAfter": 4.33,
      "direction": "hold",
      "basisPoints": 0,
      "note": "..."
    }
  ],
  "stats": {
    "totalCuts": 53,
    "totalHikes": 51,
    "totalHolds": 9,
    "avgCycleLength": "..."
  }
}
```

---

### `GET /api/charts`
41 TradingView chart links grouped into 10 categories.

**Response:**
```json
{
  "categories": [
    {
      "name": "US Indices",
      "charts": [
        { "name": "S&P 500", "symbol": "SPX", "url": "...", "description": "..." }
      ]
    }
  ]
}
```

---

### `GET /api/glossary`
35 economic terms with definitions and analogies.

**Response:**
```json
{
  "terms": [
    { "term": "Yield Curve", "definition": "...", "analogy": "..." }
  ]
}
```

---

### `GET /api/phases`
All 8 phase models (for the Learn page and Playbook).

**Response:**
```json
{
  "phases": [ /* array of 8 PortfolioRec objects */ ]
}
```

---

### `GET /api/theme`
Season color palettes and phase metadata.

---

## Prices

### `GET /api/price/:symbol`
Live stock or ETF price from Yahoo Finance.

**Example:** `GET /api/price/AAPL`

**Response:**
```json
{ "symbol": "AAPL", "price": 213.49, "name": "Apple Inc." }
```

**Error (404):** `{ "error": "Symbol not found", "symbol": "AAPL", "message": "..." }`

---

### `GET /api/price/crypto/:coinId`
Live crypto price from CoinGecko.

**Example:** `GET /api/price/crypto/bitcoin`

**Response:**
```json
{ "symbol": "bitcoin", "price": 87420.50, "name": "Bitcoin" }
```

---

### `GET /api/price/crypto-ids`
Map of uppercase ticker → CoinGecko ID, for crypto positions in the portfolio.

**Response:**
```json
{ "BTC": "bitcoin", "ETH": "ethereum", "SOL": "solana", ... }
```

---

## Portfolio (Supabase)

All portfolio routes return `503` if `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are not set.

---

### `GET /api/portfolio/positions`
All positions with live prices injected for auto-mode holdings.

**Response:**
```json
{
  "positions": [
    {
      "id": "uuid",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "asset_type": "stock",
      "mode": "auto",
      "quantity": 25,
      "static_value": null,
      "price": 213.49,
      "value": 5337.25,
      "notes": "Core holding",
      "created_at": "..."
    }
  ]
}
```

---

### `POST /api/portfolio/positions`
Add a new position.

**Body:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "asset_type": "stock",
  "mode": "auto",
  "quantity": 25,
  "static_value": null,
  "notes": "optional"
}
```

`name`, `asset_type`, and `mode` are required. Returns the inserted row.

---

### `DELETE /api/portfolio/positions/:id`
Remove a position by ID.

**Response:** `{ "ok": true }`

---

### `GET /api/portfolio/snapshots`
Last 52 weekly snapshots ordered by date descending.

**Response:**
```json
{
  "snapshots": [
    {
      "id": "uuid",
      "snapshot_date": "2026-03-30",
      "total_value": 105700,
      "week_change_pct": 2.42,
      "created_at": "..."
    }
  ]
}
```

---

### `POST /api/portfolio/snapshot`
Save a snapshot for today (upsert — one per day).

**Body:**
```json
{
  "total_value": 105700,
  "positions_json": [ /* array of position objects */ ],
  "week_change_pct": 2.42
}
```

`total_value` and `positions_json` are required.
