import type { FredObservation, FredSeries, MacroSnapshot, DataPoint } from '../types.js';
import { cacheGet, cacheGetStale, cacheSet } from './cache.js';

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const OBSERVATION_LIMIT = 60; // Fetch last ~5 years of monthly data

const FETCH_TIMEOUT_MS = 8000; // 8 seconds per FRED request

async function fetchFred(seriesId: string, apiKey: string): Promise<FredObservation[]> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    sort_order: 'desc',
    limit: String(OBSERVATION_LIMIT),
  });
  const url = `${FRED_BASE}?${params}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`FRED API error for ${seriesId}: ${res.status} ${res.statusText}`);
    }
    const json = await res.json() as { observations: FredObservation[] };
    return json.observations.reverse(); // oldest → newest
  } finally {
    clearTimeout(timer);
  }
}

function parseObservations(observations: FredObservation[]): DataPoint[] {
  return observations
    .filter(o => o.value !== '.' && o.value !== '')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))
    .filter(p => !isNaN(p.value));
}

function calcTrend(data: DataPoint[]): 'up' | 'down' | 'flat' {
  if (data.length < 3) return 'flat';
  const last = data[data.length - 1].value;
  const prev = data[data.length - 3].value; // 3 periods ago for stability
  const delta = last - prev;
  if (Math.abs(delta) < 0.01) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

async function fetchSeries(seriesId: string, apiKey: string): Promise<FredSeries> {
  const cacheKey = `fred_${seriesId}`;

  // Try cache first
  const cached = await cacheGet<FredObservation[]>(cacheKey);
  let observations: FredObservation[];

  if (cached) {
    observations = cached;
  } else {
    try {
      observations = await fetchFred(seriesId, apiKey);
      await cacheSet(cacheKey, observations);
    } catch (err) {
      // On failure, try stale cache
      const stale = await cacheGetStale<FredObservation[]>(cacheKey);
      if (stale) {
        console.warn(`FRED fetch failed for ${seriesId}, using stale cache`);
        observations = stale;
      } else {
        console.error(`FRED fetch failed for ${seriesId} and no cache:`, err);
        return {
          id: seriesId,
          data: [],
          latest: null,
          prev: null,
          trend: 'flat',
        };
      }
    }
  }

  const data = parseObservations(observations);
  const latest = data.length > 0 ? data[data.length - 1].value : null;
  const prev = data.length > 1 ? data[data.length - 2].value : null;
  const trend = calcTrend(data);

  return { id: seriesId, data, latest, prev, trend };
}

export async function fetchAllSeries(apiKey: string): Promise<{ snapshot: MacroSnapshot; stale: boolean }> {
  const seriesIds = [
    'FEDFUNDS', 'DFF', 'DGS2', 'DGS10', 'DGS30',
    'T10Y2Y', 'T10Y3M', 'UNRATE', 'PAYEMS', 'CPIAUCSL',
    'PCEPI', 'MORTGAGE30US', 'GDP', 'WALCL', 'BAMLH0A0HYM2',
    'DFEDTARU', 'DFEDTARL', 'SP500', 'T5YIE', 'ICSA',
  ];

  let stale = false;

  const results = await Promise.allSettled(
    seriesIds.map(id => fetchSeries(id, apiKey))
  );

  const get = (i: number): FredSeries => {
    const r = results[i];
    if (r.status === 'fulfilled') return r.value;
    stale = true;
    return { id: seriesIds[i], data: [], latest: null, prev: null, trend: 'flat' };
  };

  const snapshot: MacroSnapshot = {
    timestamp: new Date().toISOString(),
    stale,
    rates: {
      fedFunds: get(0),
      dff: get(1),
      dgs2: get(2),
      dgs10: get(3),
      dgs30: get(4),
      t10y2y: get(5),
      t10y3m: get(6),
      mortgage30: get(7),
      dfedtaru: get(14),
      dfedtarl: get(15),
    },
    inflation: {
      cpi: get(9),
      pce: get(10),
      t5yie: get(18),
    },
    labor: {
      unrate: get(8),
      payems: get(9), // Note: index adjusts below
      icsa: get(19),
    },
    growth: {
      gdp: get(12),
    },
    credit: {
      hySpread: get(14),
      walcl: get(13),
    },
    market: {
      sp500: get(17),
    },
  };

  // Fix the index mapping properly
  const seriesMap: Record<string, FredSeries> = {};
  seriesIds.forEach((id, i) => {
    const r = results[i];
    if (r.status === 'fulfilled') {
      seriesMap[id] = r.value;
    } else {
      stale = true;
      seriesMap[id] = { id, data: [], latest: null, prev: null, trend: 'flat' };
    }
  });

  const snapshotFixed: MacroSnapshot = {
    timestamp: new Date().toISOString(),
    stale,
    rates: {
      fedFunds: seriesMap['FEDFUNDS'],
      dff: seriesMap['DFF'],
      dgs2: seriesMap['DGS2'],
      dgs10: seriesMap['DGS10'],
      dgs30: seriesMap['DGS30'],
      t10y2y: seriesMap['T10Y2Y'],
      t10y3m: seriesMap['T10Y3M'],
      mortgage30: seriesMap['MORTGAGE30US'],
      dfedtaru: seriesMap['DFEDTARU'],
      dfedtarl: seriesMap['DFEDTARL'],
    },
    inflation: {
      cpi: seriesMap['CPIAUCSL'],
      pce: seriesMap['PCEPI'],
      t5yie: seriesMap['T5YIE'],
    },
    labor: {
      unrate: seriesMap['UNRATE'],
      payems: seriesMap['PAYEMS'],
      icsa: seriesMap['ICSA'],
    },
    growth: {
      gdp: seriesMap['GDP'],
    },
    credit: {
      hySpread: seriesMap['BAMLH0A0HYM2'],
      walcl: seriesMap['WALCL'],
    },
    market: {
      sp500: seriesMap['SP500'],
    },
  };

  return { snapshot: snapshotFixed, stale };
}
