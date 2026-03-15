import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// ─── In-memory price cache (15 min TTL) ──────────────────────────────────────

interface CacheEntry { price: number; name: string; fetchedAt: number; }
const cache = new Map<string, CacheEntry>();
const TTL = 15 * 60 * 1000;

function fromCache(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > TTL) { cache.delete(key); return null; }
  return entry;
}

// ─── Crypto coin ID map (ticker → CoinGecko ID) ──────────────────────────────

export const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', ADA: 'cardano',
  DOGE: 'dogecoin', XRP: 'ripple', AVAX: 'avalanche-2', DOT: 'polkadot',
  LINK: 'chainlink', MATIC: 'matic-network', LTC: 'litecoin',
  BCH: 'bitcoin-cash', UNI: 'uniswap', ATOM: 'cosmos', NEAR: 'near',
  FTM: 'fantom', ALGO: 'algorand', VET: 'vechain', ICP: 'internet-computer',
  FIL: 'filecoin', SAND: 'the-sandbox', MANA: 'decentraland',
};

// ─── Stock / ETF price (Yahoo Finance) ───────────────────────────────────────

export async function getStockPrice(symbol: string): Promise<{ price: number; name: string }> {
  const cached = fromCache(symbol.toUpperCase());
  if (cached) return cached;

  const quote = await yahooFinance.quote(symbol);
  const price = quote.regularMarketPrice;
  const name = quote.shortName ?? quote.longName ?? symbol;

  if (!price) throw new Error(`No price found for ${symbol}`);

  const entry: CacheEntry = { price, name, fetchedAt: Date.now() };
  cache.set(symbol.toUpperCase(), entry);
  return entry;
}

// ─── Crypto price (CoinGecko free API) ───────────────────────────────────────

export async function getCryptoPrice(coinId: string): Promise<{ price: number; name: string }> {
  const cacheKey = `crypto:${coinId}`;
  const cached = fromCache(cacheKey);
  if (cached) return cached;

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=false`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`CoinGecko error: ${resp.status}`);
  const data = await resp.json() as Record<string, { usd?: number }>;
  const price = data[coinId]?.usd;
  if (!price) throw new Error(`No price for coin: ${coinId}`);

  // Get name from CoinGecko coins list (fallback to coin ID)
  const name = coinId.charAt(0).toUpperCase() + coinId.slice(1).replace(/-/g, ' ');
  const entry: CacheEntry = { price, name, fetchedAt: Date.now() };
  cache.set(cacheKey, entry);
  return entry;
}
