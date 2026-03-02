import { config } from 'dotenv';
config();

import { fetchAllSeries } from './lib/fred.js';
import { classifySeason } from './lib/season.js';
import { buildPortfolioRec } from './lib/portfolio.js';
import { buildPrediction } from './lib/predictions.js';
import { cacheBustAll } from './lib/cache.js';
import { getDaysUntilNext, getNextMeeting } from './data/fomc.js';
import { SEASON_PALETTES } from './lib/theme.js';
import type { Season } from './types.js';

const FRED_API_KEY = process.env.FRED_API_KEY ?? '';
const args = process.argv.slice(2);
const doRefresh = args.includes('--refresh');

function bar(score: number, width = 10): string {
  const filled = Math.round((score / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function trend(t: 'up' | 'down' | 'flat'): string {
  if (t === 'up') return '↑';
  if (t === 'down') return '↓';
  return '→';
}

function fmt(val: number | null, decimals = 2): string {
  if (val === null) return 'N/A';
  return val.toFixed(decimals) + '%';
}

function fmtLarge(val: number | null): string {
  if (val === null) return 'N/A';
  const T = val / 1_000_000;
  return `$${T.toFixed(2)}T`;
}

const SEASON_EMOJIS: Record<Season, string> = {
  spring: '🌱',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

async function main() {
  if (doRefresh) {
    console.log('🔄 Busting cache...');
    await cacheBustAll();
  }

  if (!FRED_API_KEY) {
    console.error('❌ FRED_API_KEY not set. Copy .env.example to .env and add your key.');
    process.exit(1);
  }

  console.log('Fetching macro data...');
  const { snapshot, stale } = await fetchAllSeries(FRED_API_KEY);
  const seasonResult = classifySeason(snapshot);
  const portfolio = buildPortfolioRec(seasonResult, snapshot);
  const prediction = buildPrediction(seasonResult);
  const nextFomc = getNextMeeting();
  const daysUntil = getDaysUntilNext();

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const emoji = SEASON_EMOJIS[seasonResult.season];
  const palette = SEASON_PALETTES[seasonResult.season];

  const w = 56;
  const line = '═'.repeat(w);
  const thinLine = '─'.repeat(w);

  console.log(`\n${line}`);
  console.log(`  MACRO CYCLE TRACKER — ${today}${stale ? ' [STALE DATA]' : ''}`);
  console.log(line);
  console.log();

  // Season headline
  const phaseLabel = `${seasonResult.phase.toUpperCase()} ${seasonResult.season.toUpperCase()}`;
  const confLabel = `Confidence: ${seasonResult.confidence}%`;
  console.log(`  ${emoji} ${phaseLabel}  |  ${confLabel}`);
  console.log(`  ${seasonResult.summary.substring(0, 52)}`);
  if (seasonResult.summary.length > 52) {
    console.log(`  ${seasonResult.summary.substring(52)}`);
  }
  console.log();
  console.log(`  ${thinLine.substring(0, 52)}`);

  // Key rates
  const { rates, inflation, labor, credit } = snapshot;
  const fedVal = fmt(rates.fedFunds.latest);
  const t10y = fmt(rates.dgs10.latest);
  const curve = fmt(rates.t10y2y.latest);
  const mtg = fmt(rates.mortgage30.latest);

  console.log();
  console.log(`  RATES`);
  console.log(`  Fed Funds:  ${fedVal.padEnd(10)} ${trend(rates.fedFunds.trend)}   10Y:      ${t10y.padEnd(8)} ${trend(rates.dgs10.trend)}`);
  console.log(`  2Y:         ${fmt(rates.dgs2.latest).padEnd(10)} ${trend(rates.dgs2.trend)}   30Y:      ${fmt(rates.dgs30.latest).padEnd(8)} ${trend(rates.dgs30.trend)}`);
  console.log(`  Curve(10-2):${curve.padEnd(10)} ${trend(rates.t10y2y.trend)}   Mortgage: ${mtg.padEnd(8)} ${trend(rates.mortgage30.trend)}`);
  console.log(`  HY Spread:  ${fmt(credit.hySpread.latest).padEnd(10)} ${trend(credit.hySpread.trend)}   Fed BS:   ${fmtLarge(credit.walcl.latest)}`);
  console.log();

  console.log(`  INDICATORS`);
  console.log(`  Unemployment: ${fmt(labor.unrate.latest)} ${trend(labor.unrate.trend)}   CPI (lvl): ${labor.unrate.latest?.toFixed(1) ?? 'N/A'}`);
  console.log(`  PCE (lvl):    ${inflation.pce.latest?.toFixed(1) ?? 'N/A'}         T5Y Breakeven: ${fmt(inflation.t5yie.latest)}`);
  console.log();

  // FOMC
  if (nextFomc) {
    const sep = nextFomc.hasSEP ? ' ★ SEP + Dot Plot' : '';
    console.log(`  Next FOMC: ${nextFomc.startDate} – ${nextFomc.endDate} (${daysUntil} days)${sep}`);
  }
  console.log();

  // Season scores
  console.log(`  SEASON SCORES`);
  const { scores } = seasonResult;
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  for (const s of seasons) {
    const e = SEASON_EMOJIS[s];
    const sc = scores[s];
    const isCurrent = s === seasonResult.season;
    const indicator = isCurrent ? ' ◄ NOW' : '';
    console.log(`  ${e} ${s.charAt(0).toUpperCase() + s.slice(1).padEnd(7)} ${bar(sc)} ${String(sc).padStart(3)}%${indicator}`);
  }
  console.log();

  // Portfolio
  const { allocation, riskLevel, buy, sell, hold } = portfolio;
  console.log(`  PORTFOLIO: ${riskLevel}`);
  console.log(`  Equities ${String(allocation.equities.pct).padStart(3)}% | Bonds ${String(allocation.bonds.pct).padStart(3)}% | Cash ${String(allocation.cash.pct).padStart(3)}% | Alts ${String(allocation.alts.pct).padStart(3)}%`);
  console.log();
  console.log(`  BUY:  ${buy.slice(0, 3).map(b => b.ticker ?? b.asset).join(', ')}`);
  console.log(`  SELL: ${sell.slice(0, 3).map(s => s.ticker ?? s.asset).join(', ')}`);
  console.log(`  HOLD: ${hold.slice(0, 3).map(h => h.ticker ?? h.asset).join(', ')}`);
  console.log();

  // Overlays
  if (seasonResult.detectedOverlays.length > 0) {
    console.log(`  OVERLAYS DETECTED:`);
    for (const o of seasonResult.detectedOverlays) {
      console.log(`  • ${o.substring(0, 52)}`);
    }
    console.log();
  }

  // Prediction
  console.log(`  NEXT: ${prediction.nextPhase.toUpperCase()} ${prediction.nextSeason.toUpperCase()} — ${prediction.timing}`);
  console.log(`  Watch: ${prediction.watchFor[0]}`);
  console.log();

  console.log(`  http://localhost:3000`);
  console.log(line);
  console.log();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
