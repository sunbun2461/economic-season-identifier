-- Macro Cycle Tracker — Supabase Schema
-- Run this once in your Supabase dashboard: SQL Editor → New Query → paste → Run

-- ─────────────────────────────────────────────────────────────
-- TABLE: positions
-- Stores individual portfolio holdings (stocks, ETFs, crypto, etc.)
-- Used by: POST/GET/DELETE /api/portfolio/positions
-- ─────────────────────────────────────────────────────────────
create table if not exists positions (
  id           uuid primary key default gen_random_uuid(),
  symbol       text,                          -- ticker / coin id (nullable for cash, real estate, etc.)
  name         text not null,                 -- display name (e.g. "Apple", "Bitcoin", "Emergency Fund")
  asset_type   text not null,                 -- stock | etf | crypto | cash | bond | commodity | real_estate | other
  mode         text not null check (mode in ('auto', 'static')),
                                              -- auto = quantity × live price  |  static = fixed total value
  quantity     numeric,                       -- number of shares/coins (auto mode)
  static_value numeric,                       -- total value in USD (static mode)
  notes        text,                          -- optional notes
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: portfolio_snapshots
-- Weekly total-value snapshots for tracking gains/losses over time
-- Used by: GET/POST /api/portfolio/snapshots
-- ─────────────────────────────────────────────────────────────
create table if not exists portfolio_snapshots (
  id               uuid primary key default gen_random_uuid(),
  snapshot_date    date not null unique,      -- one row per day (upserted weekly)
  total_value      numeric not null,          -- total portfolio value in USD
  positions_json   jsonb not null,            -- full positions array at time of snapshot
  week_change_pct  numeric,                   -- % change vs previous snapshot (nullable first week)
  created_at       timestamptz not null default now()
);

-- Index for fast date-range queries on snapshots
create index if not exists idx_portfolio_snapshots_date
  on portfolio_snapshots (snapshot_date desc);
