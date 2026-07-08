import YahooFinance from 'yahoo-finance2';
import { cacheGet, cacheSet } from './cache.js';
import { CURATED_TICKERS } from '../data/tickers.js';
import type { ScreenerSignal, ScreenerMetrics, ApiScreenerResponse } from '../types.js';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// Run promises in batches to avoid rate-limiting Yahoo Finance
async function batch<T>(items: (() => Promise<T>)[], size = 15): Promise<(T | null)[]> {
  const results: (T | null)[] = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = await Promise.allSettled(items.slice(i, i + size).map(fn => fn()));
    chunk.forEach(r => results.push(r.status === 'fulfilled' ? r.value : null));
  }
  return results;
}

function scoreStock(metrics: ScreenerMetrics): { score: number; verdict: string } {
  let score = 0;
  const reasons: string[] = [];

  if (metrics.epsGrowthYoY != null) {
    if (metrics.epsGrowthYoY > 0.20)   { score += 40; reasons.push('strong EPS growth'); }
    else if (metrics.epsGrowthYoY > 0) { score += 25; reasons.push('positive EPS growth'); }
  }
  if (metrics.revenueGrowthYoY != null && metrics.revenueGrowthYoY > 0) {
    score += 20; reasons.push('revenue growing');
  }
  if (metrics.netMargin != null) {
    if (metrics.netMargin > 0.20)      { score += 30; reasons.push('high margin'); }
    else if (metrics.netMargin > 0.10) { score += 20; reasons.push('solid margin'); }
  }
  if (metrics.debtEquity != null) {
    if (metrics.debtEquity < 0.5)      { score += 30; reasons.push('low debt'); }
    else if (metrics.debtEquity < 1.0) { score += 20; reasons.push('manageable debt'); }
  }
  if (metrics.downsideFromHigh <= -0.30) { score += 10; reasons.push('deeply oversold'); }

  return {
    score: Math.min(score, 100),
    verdict: reasons.length
      ? reasons.slice(0, 3).map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' · ')
      : 'Weak fundamental signals',
  };
}

interface QuoteRow {
  ticker: string;
  company: string;
  sector: string;
  price: number;
  yearHigh: number;
  marketCap: number;
  downsideFromHigh: number;
}

export async function runScreener(_apiKey: string): Promise<ApiScreenerResponse> {
  const ALL_CACHE_KEY = 'screener_all';
  const cached = await cacheGet<ApiScreenerResponse>(ALL_CACHE_KEY);
  if (cached) return cached;

  const sectorMap = new Map(CURATED_TICKERS.map(t => [t.symbol, t.sector]));

  // Step 1: fetch basic quote for every ticker to get price + 52wk high + market cap
  const quoteRows = await batch(
    CURATED_TICKERS.map(t => async (): Promise<QuoteRow | null> => {
      try {
        const q = await yf.quote(t.symbol, {}, { validateResult: false });
        const price   = q.regularMarketPrice ?? 0;
        const hi      = (q as any).fiftyTwoWeekHigh ?? 0;
        const cap     = (q as any).marketCap ?? 0;
        if (!price || !hi || !cap) return null;
        return {
          ticker: t.symbol,
          company: (q.shortName ?? q.longName ?? t.symbol) as string,
          sector: t.sector,
          price,
          yearHigh: hi,
          marketCap: cap,
          downsideFromHigh: (price - hi) / hi,
        };
      } catch { return null; }
    }),
    15
  );

  const valid = quoteRows.filter((r): r is QuoteRow => r !== null);

  // Step 2: filter to stocks down >= 20% from 52-week high
  const candidates = valid
    .filter(r => r.downsideFromHigh <= -0.20)
    .sort((a, b) => a.downsideFromHigh - b.downsideFromHigh);

  // Step 3: fetch financials for each candidate
  const enriched = await batch(
    candidates.map(c => async (): Promise<ScreenerSignal | null> => {
      try {
        const summary = await yf.quoteSummary(c.ticker, { modules: ['financialData'] }, { validateResult: false });
        const fd = (summary as any).financialData ?? {};
        const metrics: ScreenerMetrics = {
          epsGrowthYoY:     fd.earningsGrowth  ?? null,
          revenueGrowthYoY: fd.revenueGrowth   ?? null,
          netMargin:        fd.profitMargins    ?? null,
          debtEquity:       fd.debtToEquity != null ? fd.debtToEquity / 100 : null,
          downsideFromHigh: c.downsideFromHigh,
        };
        const { score, verdict } = scoreStock(metrics);
        return {
          ticker: c.ticker, company: c.company,
          sector: sectorMap.get(c.ticker) ?? 'Unknown',
          marketCap: c.marketCap / 1e9,
          price: c.price, score, metrics, verdict,
        };
      } catch { return null; }
    }),
    10
  );

  const signals = enriched.filter((s): s is ScreenerSignal => s !== null && s.score >= 20);

  // Split into tiers
  const inTier = (s: ScreenerSignal, min: number, max: number | null) =>
    s.marketCap >= min && (max === null || s.marketCap < max);

  const topN = (tier: ScreenerSignal[]) =>
    tier.sort((a, b) => b.score - a.score).slice(0, 5);

  const result: ApiScreenerResponse = {
    large: topN(signals.filter(s => inTier(s, 10, null))),
    mid:   topN(signals.filter(s => inTier(s, 2, 10))),
    small: topN(signals.filter(s => inTier(s, 0.3, 2))),
    timestamp: new Date().toISOString(),
    stale: false,
  };

  await cacheSet(ALL_CACHE_KEY, result);
  return result;
}

export async function analyzeStock(_apiKey: string, ticker: string): Promise<ScreenerSignal | null> {
  try {
    const sym = ticker.toUpperCase();
    const [q, summary] = await Promise.all([
      yf.quote(sym, {}, { validateResult: false }),
      yf.quoteSummary(sym, { modules: ['financialData'] }, { validateResult: false }),
    ]);
    const price   = q.regularMarketPrice ?? 0;
    const hi      = (q as any).fiftyTwoWeekHigh ?? 0;
    const cap     = (q as any).marketCap ?? 0;
    const fd      = (summary as any).financialData ?? {};

    const metrics: ScreenerMetrics = {
      epsGrowthYoY:     fd.earningsGrowth  ?? null,
      revenueGrowthYoY: fd.revenueGrowth   ?? null,
      netMargin:        fd.profitMargins    ?? null,
      debtEquity:       fd.debtToEquity != null ? fd.debtToEquity / 100 : null,
      downsideFromHigh: hi > 0 ? (price - hi) / hi : 0,
    };
    const { score, verdict } = scoreStock(metrics);
    const sector = CURATED_TICKERS.find(t => t.symbol === sym)?.sector ?? '—';
    const name   = (q.shortName ?? q.longName ?? sym) as string;

    return { ticker: sym, company: name, sector, marketCap: cap / 1e9, price, score, metrics, verdict };
  } catch { return null; }
}
