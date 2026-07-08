import { useEffect, useState } from 'react';
import { useSeason } from '../context/SeasonContext';
import { PALETTES } from '../types';
import type { ScreenerSignal, ApiScreenerResponse } from '../types';

type Tier = 'large' | 'mid' | 'small';

const TIER_LABELS: Record<Tier, { label: string; range: string }> = {
  large: { label: 'Large Cap', range: '$10B+' },
  mid:   { label: 'Mid Cap',   range: '$2B–$10B' },
  small: { label: 'Small Cap', range: '$300M–$2B' },
};

function fmt(n: number | null, isPercent = false): string {
  if (n == null) return '—';
  const val = isPercent ? n * 100 : n;
  return (val > 0 ? '+' : '') + val.toFixed(1) + (isPercent ? '%' : '');
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#eab308' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28, textAlign: 'right' }}>{score}</span>
    </div>
  );
}

function DownBadge({ pct }: { pct: number }) {
  const abs = Math.abs(pct * 100).toFixed(0);
  const color = pct <= -0.30 ? '#ef4444' : '#f97316';
  return (
    <span style={{ background: color + '18', color, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
      ▼ {abs}% off high
    </span>
  );
}

function StockTable({ signals }: { signals: ScreenerSignal[] }) {
  if (signals.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: 14 }}>
        No qualifying stocks found in this tier right now.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            {['#', 'Ticker', 'Company', 'Sector', 'Price', 'Off High', 'EPS YoY', 'Rev YoY', 'Margin', 'D/E', 'Score', 'Verdict'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {signals.map((s, i) => (
            <tr key={s.ticker} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td style={{ padding: '10px 10px', color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
              <td style={{ padding: '10px 10px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--season-primary)' }}>{s.ticker}</span>
              </td>
              <td style={{ padding: '10px 10px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span title={s.company}>{s.company}</span>
              </td>
              <td style={{ padding: '10px 10px', color: '#6b7280', fontSize: 12 }}>{s.sector}</td>
              <td style={{ padding: '10px 10px', fontWeight: 600 }}>${s.price.toFixed(2)}</td>
              <td style={{ padding: '10px 10px' }}><DownBadge pct={s.metrics.downsideFromHigh} /></td>
              <td style={{ padding: '10px 10px', color: s.metrics.epsGrowthYoY != null && s.metrics.epsGrowthYoY > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {fmt(s.metrics.epsGrowthYoY, true)}
              </td>
              <td style={{ padding: '10px 10px', color: s.metrics.revenueGrowthYoY != null && s.metrics.revenueGrowthYoY > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {fmt(s.metrics.revenueGrowthYoY, true)}
              </td>
              <td style={{ padding: '10px 10px', fontWeight: 600 }}>{fmt(s.metrics.netMargin, true)}</td>
              <td style={{ padding: '10px 10px', color: s.metrics.debtEquity != null && s.metrics.debtEquity < 1 ? '#10b981' : '#f97316', fontWeight: 600 }}>
                {s.metrics.debtEquity != null ? s.metrics.debtEquity.toFixed(2) : '—'}
              </td>
              <td style={{ padding: '10px 10px', minWidth: 100 }}><ScoreBar score={s.score} /></td>
              <td style={{ padding: '10px 10px', color: '#6b7280', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span title={s.verdict}>{s.verdict}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyzeCard({ signal }: { signal: ScreenerSignal }) {
  const score = signal.score;
  const scoreColor = score >= 70 ? '#10b981' : score >= 45 ? '#eab308' : '#ef4444';
  return (
    <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '20px 24px', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: 'var(--season-primary)' }}>{signal.ticker}</span>
            <DownBadge pct={signal.metrics.downsideFromHigh} />
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{signal.company}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor }}>{score}<span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>/100</span></div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>Fundamental Score</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Price', val: `$${signal.price.toFixed(2)}` },
          { label: 'Market Cap', val: `$${signal.marketCap.toFixed(1)}B` },
          { label: 'EPS Growth YoY', val: fmt(signal.metrics.epsGrowthYoY, true), good: signal.metrics.epsGrowthYoY != null && signal.metrics.epsGrowthYoY > 0 },
          { label: 'Revenue Growth', val: fmt(signal.metrics.revenueGrowthYoY, true), good: signal.metrics.revenueGrowthYoY != null && signal.metrics.revenueGrowthYoY > 0 },
          { label: 'Net Margin', val: fmt(signal.metrics.netMargin, true), good: signal.metrics.netMargin != null && signal.metrics.netMargin > 0.10 },
          { label: 'Debt / Equity', val: signal.metrics.debtEquity != null ? signal.metrics.debtEquity.toFixed(2) : '—', good: signal.metrics.debtEquity != null && signal.metrics.debtEquity < 1 },
        ].map(({ label, val, good }) => (
          <div key={label} style={{ background: '#f9fafb', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: good === undefined ? '#111827' : good ? '#10b981' : '#ef4444' }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', background: '#f9fafb', borderRadius: 6, padding: '10px 14px' }}>
        {signal.verdict}
      </div>
    </div>
  );
}

export default function Screener() {
  const { season } = useSeason();
  const palette = PALETTES[season as keyof typeof PALETTES] ?? PALETTES.spring;

  const [data, setData] = useState<ApiScreenerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<Tier>('large');

  // Manual lookup
  const [lookupTicker, setLookupTicker] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState<ScreenerSignal | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/screener')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load screener data.'); setLoading(false); });
  }, []);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!lookupTicker.trim()) return;
    setAnalyzing(true);
    setAnalyzed(null);
    setAnalyzeError(null);
    try {
      const res = await fetch(`/api/screener/analyze/${lookupTicker.trim().toUpperCase()}`);
      if (!res.ok) { setAnalyzeError('Symbol not found or data unavailable.'); }
      else { setAnalyzed(await res.json()); }
    } catch {
      setAnalyzeError('Request failed.');
    }
    setAnalyzing(false);
  }

  const tiers: Tier[] = ['large', 'mid', 'small'];

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Market Scanner</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Stocks down ≥20% from their 52-week high with strong fundamentals — ranked by composite score.
          {data && <span style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af' }}>Updated {new Date(data.timestamp).toLocaleTimeString()}</span>}
        </p>
      </div>

      {/* Scoring legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { color: '#10b981', label: 'Score ≥ 70 — Strong buy candidate' },
          { color: '#eab308', label: '45–69 — Decent signals' },
          { color: '#ef4444', label: '< 45 — Weak fundamentals' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Tier tabs + table */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {tiers.map(tier => (
            <button key={tier} onClick={() => setActiveTier(tier)}
              style={{
                flex: 1, padding: '12px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: activeTier === tier ? 'white' : '#f9fafb',
                borderBottom: activeTier === tier ? `2px solid ${palette.primary}` : '2px solid transparent',
                color: activeTier === tier ? palette.primary : '#6b7280',
                transition: 'all 0.15s',
              }}>
              {TIER_LABELS[tier].label}
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: '#9ca3af' }}>{TIER_LABELS[tier].range}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '8px 0' }}>
          {loading && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14 }}>Scanning the market — this can take 10–20 seconds on first load…</div>
            </div>
          )}
          {error && !loading && (
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#ef4444', background: '#fef2f2', padding: '12px 16px', borderRadius: 6, display: 'inline-block' }}>
                {error.includes('FMP_API_KEY')
                  ? 'FMP API key not set. Add FMP_API_KEY to your .env (free at financialmodelingprep.com).'
                  : error}
              </div>
            </div>
          )}
          {data && !loading && !error && (
            <StockTable signals={data[activeTier]} />
          )}
        </div>
      </div>

      {/* Manual lookup */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '20px 24px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>Single Stock Scorecard</h2>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 14px' }}>Enter any US ticker to see its fundamental score.</p>
        <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={lookupTicker}
            onChange={e => setLookupTicker(e.target.value.toUpperCase())}
            placeholder="e.g. AAPL"
            maxLength={8}
            style={{
              padding: '9px 14px', borderRadius: 6, border: '1.5px solid #d1d5db',
              fontSize: 14, fontFamily: 'monospace', fontWeight: 700, width: 140,
              outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target.style.borderColor = palette.primary)}
            onBlur={e => (e.target.style.borderColor = '#d1d5db')}
          />
          <button type="submit" disabled={analyzing || !lookupTicker.trim()}
            style={{
              padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: palette.primary, color: 'white', fontSize: 13, fontWeight: 600,
              opacity: analyzing || !lookupTicker.trim() ? 0.6 : 1, transition: 'opacity 0.15s',
            }}>
            {analyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        </form>
        {analyzeError && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#ef4444' }}>{analyzeError}</div>
        )}
        {analyzed && <AnalyzeCard signal={analyzed} />}
      </div>
    </main>
  );
}
