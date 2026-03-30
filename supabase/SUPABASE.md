# Supabase Setup — Macro Cycle Tracker

## Project
- **URL:** https://eaisuwnrzzfiwldwzmzg.supabase.co
- **Purpose:** Persistent storage for portfolio tracker + season classification history

---

## Key: Anon Key vs Service Role Key

> **Important:** `SUPABASE_SERVICE_ROLE_KEY` in `.env` currently holds the **anon key** (JWT role = `"anon"`). This works for data reads/writes when RLS is off, but the real service role key (JWT role = `"service_role"`) bypasses RLS entirely — better for server-side use.
>
> To get the real service role key: Supabase Dashboard → Project Settings → API → **service_role** (click reveal). Swap it into `.env` when ready.

---

## Tables

### `positions`
Individual portfolio holdings.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Auto-generated PK |
| symbol | text | Ticker or coin ID. Nullable for cash/other. |
| name | text | Display name |
| asset_type | text | stock \| etf \| crypto \| cash \| bond \| commodity \| real_estate \| other |
| mode | text | `auto` = quantity × live price · `static` = fixed total |
| quantity | numeric | Shares/coins (auto mode) |
| static_value | numeric | Total USD value (static mode) |
| notes | text | Optional |
| created_at | timestamptz | |

### `portfolio_snapshots`
Weekly total-value snapshots for gain/loss tracking.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Auto-generated PK |
| snapshot_date | date | Unique per day |
| total_value | numeric | Total portfolio value in USD |
| positions_json | jsonb | Full positions at snapshot time |
| week_change_pct | numeric | % vs prior snapshot |
| created_at | timestamptz | |

### `keepalive_pings`
Single-row table updated on every keepalive run.

| Column | Type | Notes |
|--------|------|-------|
| id | int | Always 1 |
| last_ping | timestamptz | When keepalive last ran |
| ping_count | int | Total keepalive runs |

### `season_log`
Running history of season classifications. Auto-populated on every `/api/data` call.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Auto-generated PK |
| logged_at | timestamptz | When this reading was made |
| season | text | spring \| summer \| autumn \| winter |
| phase | text | early \| late |
| confidence | numeric | 0–100 |
| scores | jsonb | `{ spring, summer, autumn, winter }` raw scores |
| fed_rate | numeric | Fed funds rate at time of log |
| yield_curve | numeric | 10Y-2Y spread |

---

## First-Time Setup

Run migrations in order in Supabase Dashboard → **SQL Editor → New Query**:

```
001_schema.sql      → positions + portfolio_snapshots
002_keepalive.sql   → keepalive_pings
003_season_log.sql  → season_log
```

Then seed realistic fake data so tables aren't empty:
```bash
npx tsx supabase/seed.ts
```

---

## Environment Variables

```env
SUPABASE_URL=https://eaisuwnrzzfiwldwzmzg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<anon key works; service_role key is better>
VITE_SUPABASE_URL=https://eaisuwnrzzfiwldwzmzg.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

- **Backend** (`src/lib/supabaseClient.ts`) — uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- **Frontend** (`client/src/lib/supabase.ts`) — uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`

---

## Keepalive Strategy

Supabase free-tier pauses after **7 days of no DB activity**. Three layers prevent this:

| Layer | Mechanism | Frequency |
|-------|-----------|-----------|
| Organic | `/api/data` logs to `season_log` on every call | Whenever app is used |
| Scheduled | GitHub Actions runs `keepalive.ts` → writes to `keepalive_pings` | Daily at 8am UTC |
| Manual | `npx tsx supabase/keepalive.ts` | On demand |

### GitHub Actions secrets setup
1. GitHub repo → **Settings → Secrets and variables → Actions**
2. Add two repository secrets:
   - `SUPABASE_URL` = `https://eaisuwnrzzfiwldwzmzg.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = your key
3. Push `.github/workflows/supabase-keepalive.yml` — runs daily automatically

> GitHub disables scheduled workflows on repos with no push activity for ~60 days. Trigger manually from the Actions tab or push any small change to reset the clock.

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/portfolio/positions` | All positions with live prices |
| POST | `/api/portfolio/positions` | Add a position |
| DELETE | `/api/portfolio/positions/:id` | Remove a position |
| GET | `/api/portfolio/snapshots` | Last 52 weekly snapshots |
| POST | `/api/portfolio/snapshot` | Save today's snapshot |

Season logging is automatic — no route needed, fires on every `/api/data` call.

---

## Future Plans
- Auth — each user gets their own positions + snapshots
- Paywall / subscription gating
- Deploy: Render (backend) + Netlify (frontend)
- Blue-Chip Opportunity Engine results cached in Supabase
