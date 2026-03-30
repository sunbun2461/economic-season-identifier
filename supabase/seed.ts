/**
 * Supabase Seed Script
 *
 * Populates the DB with realistic fake portfolio data so tables are never empty
 * and queries return real rows (counts as genuine DB activity to Supabase).
 *
 * Safe to run multiple times — uses upsert / insert-if-empty logic.
 *
 * Usage:
 *   npx tsx supabase/seed.ts
 */

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!url || !key) {
  console.error('❌  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

// ─────────────────────────────────────────────────────────────
// Fake positions — a plausible diversified retail portfolio
// ─────────────────────────────────────────────────────────────
const fakePositions = [
  { symbol: 'AAPL',  name: 'Apple Inc.',            asset_type: 'stock',     mode: 'auto',   quantity: 25,    static_value: null, notes: 'Core holding' },
  { symbol: 'MSFT',  name: 'Microsoft Corp.',        asset_type: 'stock',     mode: 'auto',   quantity: 12,    static_value: null, notes: 'Core holding' },
  { symbol: 'NVDA',  name: 'NVIDIA Corp.',           asset_type: 'stock',     mode: 'auto',   quantity: 8,     static_value: null, notes: 'AI / semis play' },
  { symbol: 'JPM',   name: 'JPMorgan Chase',         asset_type: 'stock',     mode: 'auto',   quantity: 15,    static_value: null, notes: 'Financials, late-cycle' },
  { symbol: 'XOM',   name: 'Exxon Mobil',            asset_type: 'stock',     mode: 'auto',   quantity: 20,    static_value: null, notes: 'Energy / inflation hedge' },
  { symbol: 'SPY',   name: 'SPDR S&P 500 ETF',       asset_type: 'etf',       mode: 'auto',   quantity: 10,    static_value: null, notes: 'Core index exposure' },
  { symbol: 'QQQ',   name: 'Invesco QQQ ETF',        asset_type: 'etf',       mode: 'auto',   quantity: 8,     static_value: null, notes: 'Tech / growth tilt' },
  { symbol: 'BND',   name: 'Vanguard Total Bond ETF', asset_type: 'etf',      mode: 'auto',   quantity: 30,    static_value: null, notes: 'Fixed income ballast' },
  { symbol: 'GLD',   name: 'SPDR Gold Shares',        asset_type: 'etf',      mode: 'auto',   quantity: 12,    static_value: null, notes: 'Inflation hedge' },
  { symbol: 'BTC',   name: 'Bitcoin',                asset_type: 'crypto',    mode: 'auto',   quantity: 0.15,  static_value: null, notes: 'Speculative / alts sleeve' },
  { symbol: 'ETH',   name: 'Ethereum',               asset_type: 'crypto',    mode: 'auto',   quantity: 1.2,   static_value: null, notes: 'Speculative / alts sleeve' },
  { symbol: null,    name: 'High-Yield Savings',      asset_type: 'cash',     mode: 'static', quantity: null,  static_value: 8500, notes: 'Emergency fund + dry powder' },
];

// ─────────────────────────────────────────────────────────────
// Fake portfolio snapshots — 12 weeks of history
// Macro story: recovery from late-2025 dip, trending up into spring 2026
// ─────────────────────────────────────────────────────────────
function weeksAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d.toISOString().split('T')[0];
}

const fakeSnapshots = [
  { snapshot_date: weeksAgo(12), total_value: 84200,  week_change_pct: null  },
  { snapshot_date: weeksAgo(11), total_value: 85800,  week_change_pct: 1.90  },
  { snapshot_date: weeksAgo(10), total_value: 83500,  week_change_pct: -2.68 },
  { snapshot_date: weeksAgo(9),  total_value: 86100,  week_change_pct: 3.11  },
  { snapshot_date: weeksAgo(8),  total_value: 88700,  week_change_pct: 3.02  },
  { snapshot_date: weeksAgo(7),  total_value: 91200,  week_change_pct: 2.82  },
  { snapshot_date: weeksAgo(6),  total_value: 89400,  week_change_pct: -1.97 },
  { snapshot_date: weeksAgo(5),  total_value: 93100,  week_change_pct: 4.14  },
  { snapshot_date: weeksAgo(4),  total_value: 97800,  week_change_pct: 5.05  },
  { snapshot_date: weeksAgo(3),  total_value: 100400, week_change_pct: 2.66  },
  { snapshot_date: weeksAgo(2),  total_value: 103200, week_change_pct: 2.79  },
  { snapshot_date: weeksAgo(1),  total_value: 105700, week_change_pct: 2.42  },
];

// ─────────────────────────────────────────────────────────────
// Fake season log — last ~6 months of classifications
// Macro story: Winter (Oct) → Early Spring (Jan) → Late Spring (Mar)
// ─────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const fakeSeasonLog = [
  { logged_at: daysAgo(175), season: 'winter', phase: 'early', confidence: 68, scores: { spring: 22, summer: 14, autumn: 18, winter: 68 }, fed_rate: 5.33, yield_curve: -0.41 },
  { logged_at: daysAgo(145), season: 'winter', phase: 'late',  confidence: 61, scores: { spring: 28, summer: 16, autumn: 19, winter: 61 }, fed_rate: 5.33, yield_curve: -0.28 },
  { logged_at: daysAgo(115), season: 'winter', phase: 'late',  confidence: 54, scores: { spring: 35, summer: 17, autumn: 20, winter: 54 }, fed_rate: 4.83, yield_curve: -0.12 },
  { logged_at: daysAgo(85),  season: 'spring', phase: 'early', confidence: 55, scores: { spring: 55, summer: 18, autumn: 16, winter: 41 }, fed_rate: 4.58, yield_curve: 0.08  },
  { logged_at: daysAgo(60),  season: 'spring', phase: 'early', confidence: 60, scores: { spring: 60, summer: 20, autumn: 14, winter: 32 }, fed_rate: 4.33, yield_curve: 0.19  },
  { logged_at: daysAgo(40),  season: 'spring', phase: 'early', confidence: 63, scores: { spring: 63, summer: 22, autumn: 12, winter: 28 }, fed_rate: 4.33, yield_curve: 0.24  },
  { logged_at: daysAgo(18),  season: 'spring', phase: 'late',  confidence: 67, scores: { spring: 67, summer: 25, autumn: 11, winter: 22 }, fed_rate: 4.08, yield_curve: 0.31  },
  { logged_at: daysAgo(3),   season: 'spring', phase: 'late',  confidence: 62, scores: { spring: 62, summer: 27, autumn: 11, winter: 20 }, fed_rate: 4.08, yield_curve: 0.29  },
];

// ─────────────────────────────────────────────────────────────
// Seed functions
// ─────────────────────────────────────────────────────────────

async function seedPositions() {
  // Only seed if positions table is empty
  const { count } = await supabase.from('positions').select('*', { count: 'exact', head: true });
  if ((count ?? 0) > 0) {
    console.log(`ℹ️   positions: ${count} rows already exist, skipping`);
    return;
  }

  const { error } = await supabase.from('positions').insert(fakePositions);
  if (error) {
    console.error('❌  positions seed failed:', error.message);
  } else {
    console.log(`✅  positions: inserted ${fakePositions.length} fake holdings`);
  }
}

async function seedSnapshots() {
  const { count } = await supabase.from('portfolio_snapshots').select('*', { count: 'exact', head: true });
  if ((count ?? 0) > 0) {
    console.log(`ℹ️   portfolio_snapshots: ${count} rows already exist, skipping`);
    return;
  }

  const rows = fakeSnapshots.map(s => ({
    ...s,
    positions_json: fakePositions, // snapshot of positions at time of each entry
  }));

  const { error } = await supabase.from('portfolio_snapshots').insert(rows);
  if (error) {
    console.error('❌  portfolio_snapshots seed failed:', error.message);
  } else {
    console.log(`✅  portfolio_snapshots: inserted ${rows.length} weekly snapshots`);
  }
}

async function seedSeasonLog() {
  const { count } = await supabase.from('season_log').select('*', { count: 'exact', head: true });
  if ((count ?? 0) > 0) {
    console.log(`ℹ️   season_log: ${count} rows already exist, skipping`);
    return;
  }

  const { error } = await supabase.from('season_log').insert(fakeSeasonLog);
  if (error) {
    console.error('❌  season_log seed failed:', error.message);
  } else {
    console.log(`✅  season_log: inserted ${fakeSeasonLog.length} historical season readings`);
  }
}

async function main() {
  console.log('Seeding Supabase with fake portfolio data...\n');
  await seedPositions();
  await seedSnapshots();
  await seedSeasonLog();
  console.log('\nDone.');
}

main();
