-- Season classification log
-- One row inserted on every /api/data call (fire-and-forget from the server).
-- Builds a running history of how the macro season has shifted over time.

create table if not exists season_log (
  id          uuid primary key default gen_random_uuid(),
  logged_at   timestamptz not null default now(),
  season      text not null,   -- spring | summer | autumn | winter
  phase       text not null,   -- early | late
  confidence  numeric not null,
  scores      jsonb not null,  -- { spring, summer, autumn, winter } raw 0-100 scores
  fed_rate    numeric,         -- fed funds rate at time of log
  yield_curve numeric          -- 10Y-2Y spread at time of log
);

create index if not exists idx_season_log_logged_at
  on season_log (logged_at desc);
