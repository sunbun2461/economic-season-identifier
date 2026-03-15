import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

import { fetchAllSeries } from './lib/fred.js';
import { classifySeason } from './lib/season.js';
import { buildPortfolioRec } from './lib/portfolio.js';
import { buildPrediction } from './lib/predictions.js';
import { cacheBustAll } from './lib/cache.js';
import { getRateHistory, getHistoryStats } from './data/rate-history.js';
import { fomcMeetings } from './data/fomc.js';
import { chartCategories } from './data/tradingview.js';
import { glossaryTerms } from './data/glossary.js';
import { getAllPhaseModels } from './data/portfolio-models.js';
import { SEASON_PALETTES, ALL_PHASES } from './lib/theme.js';
import { supabase } from './lib/supabaseClient.js';
import { getStockPrice, getCryptoPrice, CRYPTO_IDS } from './lib/priceService.js';
import type { ApiDataResponse, ApiHistoryResponse } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const FRED_API_KEY = process.env.FRED_API_KEY ?? '';

if (!FRED_API_KEY) {
  console.warn('⚠️  FRED_API_KEY not set. Set it in .env file. Data will not load.');
}

// Serve static files — React build in production, public/ as fallback
app.use(express.static(join(__dirname, '..', 'client-dist')));
app.use(express.static(join(__dirname, '..', 'public')));
app.use(express.json());

// Cache for API responses (in-memory, refreshed when FRED cache refreshes)
let lastApiResponse: ApiDataResponse | null = null;

async function buildApiResponse(bustCache = false): Promise<ApiDataResponse> {
  if (bustCache) {
    await cacheBustAll();
  }

  const { snapshot, stale } = await fetchAllSeries(FRED_API_KEY);
  const seasonResult = classifySeason(snapshot);
  const portfolio = buildPortfolioRec(seasonResult, snapshot);
  const prediction = buildPrediction(seasonResult);

  return {
    snapshot,
    season: seasonResult,
    portfolio,
    prediction,
    fomc: fomcMeetings,
    timestamp: new Date().toISOString(),
    stale,
  };
}

// GET /api/data — Main endpoint
app.get('/api/data', async (req, res) => {
  try {
    const data = await buildApiResponse();
    lastApiResponse = data;
    res.json(data);
  } catch (err) {
    console.error('Error in /api/data:', err);
    if (lastApiResponse) {
      res.json({ ...lastApiResponse, stale: true });
    } else {
      res.status(503).json({ error: 'Data unavailable', message: String(err) });
    }
  }
});

// GET /api/refresh — Bust cache and re-fetch
app.get('/api/refresh', async (req, res) => {
  try {
    const data = await buildApiResponse(true);
    lastApiResponse = data;
    res.json({ ...data, refreshed: true });
  } catch (err) {
    console.error('Error in /api/refresh:', err);
    res.status(503).json({ error: 'Refresh failed', message: String(err) });
  }
});

// GET /api/history — Rate decision history
app.get('/api/history', (req, res) => {
  const response: ApiHistoryResponse = {
    decisions: getRateHistory(),
    stats: getHistoryStats(),
  };
  res.json(response);
});

// GET /api/charts — TradingView links
app.get('/api/charts', (req, res) => {
  res.json({ categories: chartCategories });
});

// GET /api/glossary — Glossary terms
app.get('/api/glossary', (req, res) => {
  res.json({ terms: glossaryTerms });
});

// GET /api/phases — All 8 phase models (lightweight, for learn page)
app.get('/api/phases', (req, res) => {
  const models = getAllPhaseModels();
  res.json({ phases: Object.values(models) });
});

// GET /api/theme — Season palette info
app.get('/api/theme', (req, res) => {
  res.json({ palettes: SEASON_PALETTES, phases: ALL_PHASES });
});

// GET /api/price/crypto-ids — Map of ticker → CoinGecko ID (must be before /api/price/:symbol)
app.get('/api/price/crypto-ids', (_req, res) => {
  res.json(CRYPTO_IDS);
});

// GET /api/price/crypto/:coinId — Crypto price lookup (CoinGecko)
app.get('/api/price/crypto/:coinId', async (req, res) => {
  const coinId = req.params.coinId.toLowerCase();
  try {
    const result = await getCryptoPrice(coinId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: 'Coin not found', coinId, message: String(err) });
  }
});

// GET /api/price/:symbol — Stock/ETF price lookup (Yahoo Finance)
app.get('/api/price/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const result = await getStockPrice(symbol);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: 'Symbol not found', symbol, message: String(err) });
  }
});

// POST /api/portfolio/positions — Add a position
app.post('/api/portfolio/positions', async (req, res) => {
  const db = supabase;
  if (!db) return res.status(503).json({ error: 'Supabase not configured' });
  const { symbol, name, asset_type, mode, quantity, static_value, notes } = req.body;
  if (!name || !asset_type || !mode) {
    return res.status(400).json({ error: 'name, asset_type, and mode are required' });
  }
  const { data, error } = await db.from('positions').insert({
    symbol: symbol ?? null,
    name,
    asset_type,
    mode,
    quantity: quantity ?? null,
    static_value: static_value ?? null,
    notes: notes ?? null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/portfolio/positions — Get all positions with live prices
app.get('/api/portfolio/positions', async (req, res) => {
  const db = supabase;
  if (!db) return res.status(503).json({ error: 'Supabase not configured' });
  const { data: positions, error } = await db.from('positions').select('*').order('created_at');
  if (error) return res.status(500).json({ error: error.message });

  // Enrich auto positions with live prices
  const enriched = await Promise.all((positions ?? []).map(async (pos: Record<string, unknown>) => {
    if (pos.mode !== 'auto' || !pos.symbol) return { ...pos, price: null, value: pos.static_value };
    try {
      const assetType = pos.asset_type as string;
      const symbol = pos.symbol as string;
      let priceData: { price: number; name: string };
      if (assetType === 'crypto') {
        const coinId = CRYPTO_IDS[symbol.toUpperCase()] ?? symbol.toLowerCase();
        priceData = await getCryptoPrice(coinId);
      } else {
        priceData = await getStockPrice(symbol);
      }
      const qty = typeof pos.quantity === 'number' ? pos.quantity : parseFloat(String(pos.quantity ?? 0));
      return { ...pos, price: priceData.price, value: priceData.price * qty };
    } catch {
      return { ...pos, price: null, value: null };
    }
  }));

  res.json({ positions: enriched });
});

// DELETE /api/portfolio/positions/:id — Delete a position
app.delete('/api/portfolio/positions/:id', async (req, res) => {
  const db = supabase;
  if (!db) return res.status(503).json({ error: 'Supabase not configured' });
  const { error } = await db.from('positions').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// POST /api/portfolio/snapshot — Create a weekly snapshot
app.post('/api/portfolio/snapshot', async (req, res) => {
  const db = supabase;
  if (!db) return res.status(503).json({ error: 'Supabase not configured' });
  const { total_value, positions_json, week_change_pct } = req.body;
  if (total_value == null || !positions_json) {
    return res.status(400).json({ error: 'total_value and positions_json are required' });
  }
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await db.from('portfolio_snapshots').upsert({
    snapshot_date: today,
    total_value,
    positions_json,
    week_change_pct: week_change_pct ?? null,
  }, { onConflict: 'user_id,snapshot_date' }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/portfolio/snapshots — Get snapshot history
app.get('/api/portfolio/snapshots', async (req, res) => {
  const db = supabase;
  if (!db) return res.status(503).json({ error: 'Supabase not configured' });
  const { data, error } = await db.from('portfolio_snapshots')
    .select('id, snapshot_date, total_value, week_change_pct, created_at')
    .order('snapshot_date', { ascending: false })
    .limit(52);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ snapshots: data });
});

// SPA fallback — serve index.html for all non-API routes (React Router)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = join(__dirname, '..', 'client-dist', 'index.html');
    res.sendFile(indexPath, err => {
      if (err) res.status(404).send('Not found');
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
═══════════════════════════════════════════
  Macro Cycle Tracker
  http://localhost:${PORT}
═══════════════════════════════════════════
  API Endpoints:
    GET /api/data     — Season classification + portfolio
    GET /api/refresh  — Bust cache, re-fetch
    GET /api/history  — 35-year rate history
    GET /api/charts   — TradingView links
    GET /api/glossary — Economic glossary
    GET /api/phases   — All 8 phase models (learn page)
    GET /api/price/:symbol        — Stock/ETF price
    GET /api/price/crypto/:coinId — Crypto price
    GET/POST /api/portfolio/positions
    DELETE   /api/portfolio/positions/:id
    GET/POST /api/portfolio/snapshots

  CLI: npx tsx src/cli.ts
═══════════════════════════════════════════
  `);
});
