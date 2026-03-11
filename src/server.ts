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

  CLI: npx tsx src/cli.ts
═══════════════════════════════════════════
  `);
});
