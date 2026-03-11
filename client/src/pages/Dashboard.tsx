import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeason } from '../context/SeasonContext';
import { type MacroSnapshot, type SeasonResult, type SeasonPrediction, type FomcMeeting, type AssetAllocation } from '../types';

const SEASON_EMOJIS: Record<string, string> = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };

function trendArrow(trend: string) {
  if (trend === 'up')   return <span className="trend-up">↑</span>;
  if (trend === 'down') return <span className="trend-down">↓</span>;
  return <span className="trend-flat">→</span>;
}


function fmtT(val: number | null) {
  if (val === null) return 'N/A';
  return '$' + (val / 1_000_000).toFixed(2) + 'T';
}

function SeasonCard({ seasonData }: { seasonData: SeasonResult }) {
  const { season: s, phase, confidence, summary, setup, detectedOverlays } = seasonData;
  return (
    <div id="season-card" className="season-card p-6 rounded-xl fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="text-6xl">{SEASON_EMOJIS[s]}</div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Current Phase</div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--season-dark)' }}>
              {phase.charAt(0).toUpperCase() + phase.slice(1)} {s.charAt(0).toUpperCase() + s.slice(1)}
            </h1>
            <div className="text-sm font-medium mt-1" style={{ color: 'var(--season-primary)' }}>{setup}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Confidence</div>
          <div className="text-3xl font-bold" style={{ color: 'var(--season-dark)' }}>{confidence}%</div>
          <div className="confidence-bar w-24 mt-1 ml-auto">
            <div className="confidence-fill" style={{ width: `${confidence}%` }} />
          </div>
        </div>
      </div>
      <p className="mt-4 text-gray-700 leading-relaxed">{summary}</p>
      {detectedOverlays.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {detectedOverlays.map((o, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
              ⚠️ {o.substring(0, 60)}{o.length > 60 ? '...' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FomcTimeline({ meetings }: { meetings: FomcMeeting[] }) {
  const meetings2026 = meetings.filter(m => m.startDate.startsWith('2026'));
  const next = meetings.find(m => m.isNext);
  const daysUntil = next ? Math.ceil((new Date(next.startDate).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><span>🏦</span> FOMC Calendar 2026</h2>
      <div id="fomc-timeline" className="flex gap-2 overflow-x-auto pb-2">
        {meetings2026.map((m, i) => {
          const monthDay = new Date(m.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const cls = m.isPast ? 'past' : m.isNext ? 'next' : 'future';
          return (
            <div key={i} className={`fomc-item ${cls} flex-shrink-0`}>
              <div className="font-medium text-xs">{monthDay}{m.hasSEP ? ' ★' : ''}</div>
              {m.result && <div className="text-xs opacity-80">{m.result}</div>}
            </div>
          );
        })}
      </div>
      {next && (
        <div id="fomc-next-detail" className="mt-3 text-sm text-gray-600">
          <strong>Next:</strong> {next.startDate} — {next.endDate}
          {daysUntil !== null && ` (${daysUntil} days away)`}
          {next.hasSEP && ' — ★ Includes SEP + Dot Plot'}
        </div>
      )}
    </div>
  );
}

function MiniDonut({ allocation }: { allocation: AssetAllocation }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slices = [
    { label: 'Equities', pct: allocation.equities.pct, color: '#22c55e' },
    { label: 'Bonds',    pct: allocation.bonds.pct,    color: '#3b82f6' },
    { label: 'Cash',     pct: allocation.cash.pct,     color: '#6b7280' },
    { label: 'Alts',     pct: allocation.alts.pct,     color: '#f97316' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const radius = 60, innerRadius = 35;
    let startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    slices.forEach(({ pct, color }) => {
      const angle = (pct / 100) * 2 * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      startAngle += angle;
    });
    ctx.beginPath(); ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white'; ctx.fill();
  }, [allocation]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>💼</span> Portfolio</h2>
      <canvas ref={canvasRef} id="mini-donut" width={160} height={160} className="mx-auto block" />
      <div id="portfolio-legend" className="mt-3 space-y-1 text-sm">
        {slices.map(({ label, pct, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="text-gray-600">{label}</span>
            </div>
            <span className="font-bold">{pct}%</span>
          </div>
        ))}
      </div>
      <Link to="/playbook" className="mt-4 block text-center text-sm font-medium py-2 px-4 rounded-lg text-white" style={{ background: 'var(--season-primary)' }}>
        View Full Playbook →
      </Link>
    </div>
  );
}

function RatesGrid({ snapshot }: { snapshot: MacroSnapshot }) {
  const { rates, credit } = snapshot;
  const cards = [
    { label: 'Fed Funds',      note: 'FOMC target rate',                  series: rates.fedFunds,    suffix: '%' },
    { label: '2Y Treasury',    note: 'Near-term rate expectations',        series: rates.dgs2,        suffix: '%' },
    { label: '10Y Treasury',   note: 'Long-term growth outlook',           series: rates.dgs10,       suffix: '%' },
    { label: '30Y Treasury',   note: 'Mortgage & pension benchmark',       series: rates.dgs30,       suffix: '%' },
    { label: '10Y-2Y Spread',  note: 'Negative = inverted = recession risk', series: rates.t10y2y,   suffix: '%', highlight: true },
    { label: 'Mortgage 30Y',   note: 'Average 30-year home loan rate',     series: rates.mortgage30,  suffix: '%' },
    { label: 'HY Spread',      note: 'Junk bond premium — >5% = stress',  series: credit.hySpread,   suffix: '%' },
    { label: 'Fed Balance Sheet', note: 'QE = rising (stimulus) / QT = falling', series: credit.walcl, largeNum: true },
  ];

  return (
    <div>
      <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>📈</span> Key Rates</h2>
      <div id="rates-grid" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(({ label, note, series, suffix, largeNum, highlight }) => {
          const val = series.latest;
          const displayVal = largeNum ? fmtT(val) : val !== null ? val.toFixed(2) + (suffix ?? '') : 'N/A';
          const isNeg = val !== null && val < 0 && !largeNum;
          return (
            <div key={label} className={`rate-card ${highlight ? 'border-2' : 'border'}`} style={highlight ? { borderColor: 'var(--season-primary)' } : {}}>
              <div className="text-xs font-semibold text-gray-600">{label}</div>
              {note && <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, lineHeight: 1.3 }}>{note}</div>}
              <div className="text-xl font-bold" style={{ color: isNeg ? '#dc2626' : 'var(--season-dark)' }}>{displayVal}</div>
              <div className="text-sm mt-1">{trendArrow(series.trend)} <span className="text-gray-400 text-xs">3-mo trend</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IndicatorsGrid({ snapshot }: { snapshot: MacroSnapshot }) {
  const { inflation, labor, growth, market } = snapshot;

  let yoyCpi: number | null = null;
  const cpiData = inflation.cpi.data;
  if (cpiData.length >= 13) {
    yoyCpi = ((cpiData[cpiData.length - 1].value - cpiData[cpiData.length - 13].value) / cpiData[cpiData.length - 13].value) * 100;
  }

  let yoyPce: number | null = null;
  const pceData = inflation.pce.data;
  if (pceData.length >= 13) {
    yoyPce = ((pceData[pceData.length - 1].value - pceData[pceData.length - 13].value) / pceData[pceData.length - 13].value) * 100;
  }

  const cards = [
    { label: 'Unemployment',    note: 'Healthy range: 3.5–5%',               value: labor.unrate.latest,    suffix: '%', trend: labor.unrate.trend, decimals: 1 },
    { label: 'CPI (YoY)',       note: 'Inflation — Fed target: 2%',           value: yoyCpi,                  suffix: '%', trend: inflation.cpi.trend, decimals: 2 },
    { label: 'PCE (YoY)',       note: "Fed's preferred inflation gauge",       value: yoyPce,                  suffix: '%', trend: inflation.pce.trend, decimals: 2 },
    { label: '5Y Breakeven',    note: 'Market-implied inflation expectation',  value: inflation.t5yie.latest,  suffix: '%', trend: inflation.t5yie.trend, decimals: 2 },
    { label: 'Jobless Claims',  note: '<250K/wk = strong labor market',        value: labor.icsa.latest ? labor.icsa.latest / 1000 : null, suffix: 'K', trend: labor.icsa.trend, decimals: 0 },
    { label: 'Real GDP',        note: 'Chained 2017 dollars (quarterly)',      value: growth.gdp.latest,      suffix: 'B', trend: growth.gdp.trend, decimals: 0 },
    { label: 'S&P 500',         note: 'US large-cap equity benchmark',         value: market.sp500.latest,    suffix: '', trend: market.sp500.trend, decimals: 0 },
    { label: 'Non-Farm Payrolls', note: '>150K/mo = healthy job growth',       value: (labor as any).payems?.latest ?? null, suffix: 'K', trend: (labor as any).payems?.trend ?? 'flat', decimals: 0 },
  ];

  return (
    <div>
      <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>📊</span> Key Indicators</h2>
      <div id="indicators-grid" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(({ label, note, value, suffix, trend, decimals }) => (
          <div key={label} className="rate-card">
            <div className="text-xs font-semibold text-gray-600">{label}</div>
            {note && <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, lineHeight: 1.3 }}>{note}</div>}
            <div className="text-xl font-bold" style={{ color: 'var(--season-dark)' }}>
              {value !== null && value !== undefined ? `${value.toFixed(decimals ?? 2)}${suffix}` : 'N/A'}
            </div>
            <div className="text-sm mt-1">{trendArrow(trend)} <span className="text-gray-400 text-xs">trend</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonScores({ seasonData }: { seasonData: SeasonResult }) {
  const seasons = [
    { key: 'spring', label: 'Spring', emoji: '🌱' },
    { key: 'summer', label: 'Summer', emoji: '☀️' },
    { key: 'autumn', label: 'Autumn', emoji: '🍂' },
    { key: 'winter', label: 'Winter', emoji: '❄️' },
  ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><span>🎯</span> Season Scoring</h2>
      <div id="season-scores" className="space-y-3">
        {seasons.map(({ key, label, emoji }) => {
          const score = (seasonData.scores as any)[key] ?? 0;
          const isCurrent = key === seasonData.season;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-28 text-sm font-medium ${isCurrent ? 'font-bold' : 'text-gray-600'}`}>
                {emoji} {label}{isCurrent ? ' ◄' : ''}
              </div>
              <div className="flex-1 score-bar">
                <div className={`score-fill ${key}`} style={{ width: `${score}%` }} />
              </div>
              <div className={`w-10 text-right text-sm font-bold ${isCurrent ? '' : 'text-gray-500'}`}>{score}%</div>
            </div>
          );
        })}
      </div>
      {seasonData.conflictingIndicators?.length > 0 && (
        <div id="conflicting-indicators" className="mt-4 text-xs text-gray-500">
          <strong>Mixed signals:</strong> {seasonData.conflictingIndicators.slice(0, 3).join('; ')}
        </div>
      )}
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: SeasonPrediction }) {
  const emoji = SEASON_EMOJIS[prediction.nextSeason];
  const label = `${prediction.nextPhase.charAt(0).toUpperCase() + prediction.nextPhase.slice(1)} ${prediction.nextSeason.charAt(0).toUpperCase() + prediction.nextSeason.slice(1)}`;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><span>🔮</span> What to Watch Next</h2>
      <div id="prediction-card" className="space-y-3">
        <div className="p-3 rounded-lg season-bg-dark">
          <div className="text-xs text-gray-500 mb-1">Next Phase</div>
          <div className="font-bold" style={{ color: 'var(--season-dark)' }}>{emoji} {label}</div>
          <div className="text-sm text-gray-600 mt-1">{prediction.timing}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2">Watch For:</div>
          <ul className="space-y-1">
            {prediction.watchFor.slice(0, 4).map((w, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2">Catalysts:</div>
          <div className="flex flex-wrap gap-2">
            {prediction.catalysts.slice(0, 3).map((c, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, stale, refresh } = useSeason();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch('/api/refresh');
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  if (loading || !data) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="season-card p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="loading-shimmer h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="loading-shimmer h-7 w-48 rounded" />
              <div className="loading-shimmer h-4 w-full rounded" />
              <div className="loading-shimmer h-4 w-3/4 rounded" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Connecting to server…</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <SeasonCard seasonData={data.season} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FomcTimeline meetings={data.fomc} />
        <MiniDonut allocation={data.portfolio.allocation} />
      </div>

      <RatesGrid snapshot={data.snapshot} />
      <IndicatorsGrid snapshot={data.snapshot} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeasonScores seasonData={data.season} />
        <PredictionCard prediction={data.prediction} />
      </div>

      {data.season.detectedOverlays?.length > 0 && (
        <div id="overlays-section">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>⚠️</span> Active Overlays</h2>
          <div id="overlays-list" className="space-y-2">
            {data.season.detectedOverlays.map((o, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stale && (
        <div id="stale-warning" className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>Showing cached data — FRED API unavailable. <a href="/api/refresh" className="underline font-medium">Try refreshing</a>.</span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span id="last-updated">Last updated: {new Date(data.timestamp).toLocaleTimeString()}</span>
        <button id="refresh-btn" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <span>{refreshing ? '⏳' : '🔄'}</span> {refreshing ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>
    </main>
  );
}
