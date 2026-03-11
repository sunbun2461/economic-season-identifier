import { useEffect, useRef, useState } from 'react';
import { useSeason } from '../context/SeasonContext';
import { PALETTES, type PortfolioRec } from '../types';

const PHASES_QUICK = [
  { key: 'spring-early', label: '🌱 Early Spring', risk: 'Moderate-Aggressive', alloc: '55/25/10/10', note: 'Max uncertainty = max opportunity. Growth, small caps, extend bonds.' },
  { key: 'spring-late',  label: '🌱 Late Spring',  risk: 'Aggressive',             alloc: '65/20/5/10',  note: 'All clear rally. Best historical risk/reward. Cyclicals, international, REITs.' },
  { key: 'summer-early', label: '☀️ Early Summer', risk: 'Moderate-Aggressive', alloc: '60/20/10/10', note: 'Growth → Value rotation. Financials, energy, industrials. Add TIPS.' },
  { key: 'summer-late',  label: '☀️ Late Summer',  risk: 'Moderate',             alloc: '50/20/20/10', note: 'Build war chest. Quality, dividends, low-vol. T-bills paying real yield.' },
  { key: 'autumn-early', label: '🍂 Early Autumn', risk: 'Moderate-Defensive',   alloc: '45/20/25/10', note: 'Healthcare, staples, T-bills. Lock CD rates at peak.' },
  { key: 'autumn-late',  label: '🍂 Late Autumn',  risk: 'Defensive',             alloc: '35/25/30/10', note: 'Start buying TLT. Inverted curve = long bonds cheap. Lock 12-mo CDs.' },
  { key: 'winter-early', label: '❄️ Early Winter', risk: 'Defensive → Opportunistic', alloc: '35/30/25/10', note: 'TLT paying off. DCA into SPY in tranches. Trim gold.' },
  { key: 'winter-late',  label: '❄️ Late Winter',  risk: 'Aggressive',             alloc: '55/25/10/10', note: 'THE buying opportunity. Deploy cash. Rally starts before data confirms it.' },
];

function DonutChart({ allocation, season }: { allocation: PortfolioRec['allocation']; season: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const palette = PALETTES[season as keyof typeof PALETTES] ?? PALETTES.spring;
  const items = [
    { key: 'equities', label: 'Equities', pct: allocation.equities.pct, color: palette.primary,  detail: allocation.equities.detail },
    { key: 'bonds',    label: 'Bonds',    pct: allocation.bonds.pct,    color: '#3b82f6',         detail: allocation.bonds.detail },
    { key: 'cash',     label: 'Cash',     pct: allocation.cash.pct,     color: '#6b7280',         detail: allocation.cash.detail },
    { key: 'alts',     label: 'Alts',     pct: allocation.alts.pct,     color: '#f97316',         detail: allocation.alts.detail },
  ];

  function paint(sel: string | null) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { width: w, height: h } = canvas;
    const cx = w / 2, cy = h / 2;
    const outerR = Math.min(cx, cy) - 10;
    const innerR = outerR * 0.55;
    ctx.clearRect(0, 0, w, h);
    let startAngle = -Math.PI / 2;
    items.forEach(({ key, pct, color }) => {
      const angle = (pct / 100) * 2 * Math.PI;
      ctx.globalAlpha = (!sel || key === sel) ? 1 : 0.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      startAngle += angle;
    });
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  useEffect(() => { paint(selected); }, [selected, allocation]);

  function handleLegendClick(key: string) {
    setSelected(prev => prev === key ? null : key);
  }

  const activeData = selected ? items.find(i => i.key === selected) : null;

  return (
    <div>
      <canvas ref={canvasRef} id="donut-canvas" width={200} height={200} className="mx-auto block" />
      <div id="donut-legend" className="mt-4 space-y-1">
        {items.map(({ key, label, pct, color }) => (
          <div key={key} data-key={key} onClick={() => handleLegendClick(key)}
            className="donut-leg-row flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all"
            style={{ border: `1px solid ${selected === key ? color : 'transparent'}`, background: selected === key ? `${color}12` : '' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="text-gray-600 text-sm">{label}</span>
            </div>
            <span className="font-bold text-sm">{pct}%</span>
          </div>
        ))}
      </div>
      {activeData && (
        <div id="donut-detail-panel" style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: `${activeData.color}10`, border: `1px solid ${activeData.color}35` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: activeData.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>{activeData.label} — {activeData.pct}%</div>
          <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{activeData.detail}</div>
        </div>
      )}
    </div>
  );
}

function PhasesAccordion({ portfolio }: { portfolio: PortfolioRec }) {
  const [open, setOpen] = useState<string | null>(`${portfolio.season}-${portfolio.phase}`);
  const currentKey = `${portfolio.season}-${portfolio.phase}`;

  return (
    <div className="divide-y divide-gray-100">
      {PHASES_QUICK.map(p => (
        <div key={p.key}>
          <div onClick={() => setOpen(open === p.key ? null : p.key)}
            className={`accordion-header px-5 py-3 flex items-center justify-between ${p.key === currentKey ? 'bg-gray-50' : ''}`}
            style={p.key === currentKey ? { borderLeft: '3px solid var(--season-primary)' } : {}}>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800">{p.label}</span>
              {p.key === currentKey && <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ background: 'var(--season-primary)' }}>CURRENT</span>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 hidden sm:block">{p.risk}</span>
              <span className="text-xs font-mono text-gray-400 hidden md:block">{p.alloc}</span>
              <svg className={`accordion-icon w-4 h-4 text-gray-400 transition-transform ${open === p.key ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {open === p.key && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600">
              <div className="font-medium mb-1">Allocation: Equities/Bonds/Cash/Alts = {p.alloc}</div>
              <div>{p.note}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Playbook() {
  const { data, loading } = useSeason();

  if (loading || !data) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="season-card p-6 rounded-xl">
          <div className="loading-shimmer h-10 w-72 rounded mb-4" />
          <div className="loading-shimmer h-4 w-full rounded mb-2" />
          <div className="loading-shimmer h-4 w-3/4 rounded" />
        </div>
      </main>
    );
  }

  const { portfolio, season } = data;
  const alts = portfolio.allocation.alts;
  const altDetail = alts?.detail ?? '';
  const cryptoIdx = altDetail.indexOf('Crypto:');
  const traditionalPart = cryptoIdx !== -1 ? altDetail.slice(0, cryptoIdx).trim().replace(/\.$/, '') : altDetail;
  const cryptoPart = cryptoIdx !== -1 ? altDetail.slice(cryptoIdx + 'Crypto:'.length).trim() : null;
  const currentLabel = `${portfolio.phase.charAt(0).toUpperCase() + portfolio.phase.slice(1)} ${portfolio.season.charAt(0).toUpperCase() + portfolio.season.slice(1)}`;

  const overlays = portfolio.appliedOverlays?.length ? portfolio.appliedOverlays : (season.detectedOverlays ?? []);

  const sectorColors: Record<string, string> = { overweight: '#22c55e', neutral: '#6b7280', underweight: '#ef4444' };
  const sectorLabels: Record<string, string> = { overweight: '▲ OW', neutral: '= NW', underweight: '▼ UW' };
  const sectorWidths: Record<string, number> = { overweight: 85, neutral: 50, underweight: 20 };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div id="portfolio-header" className="season-card p-6 rounded-xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{PALETTES[portfolio.season]?.emoji}</span>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--season-dark)' }}>{currentLabel} Playbook</h1>
                <div className="text-sm font-medium" style={{ color: 'var(--season-primary)' }}>{portfolio.setup}</div>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">{portfolio.setupDescription}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--season-primary)' }}>
              {portfolio.riskLevel}
            </span>
            <span className="text-sm text-gray-500">Confidence: <strong>{portfolio.confidence}%</strong></span>
          </div>
        </div>
      </div>

      {/* Donut + Buy/Hold/Sell */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><span>🥧</span> Allocation</h2>
          <DonutChart allocation={portfolio.allocation} season={portfolio.season} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="action-buy rounded-md p-4">
            <h3 className="font-bold text-green-700 text-sm mb-3 flex items-center gap-1">✅ BUY / ADD</h3>
            <div id="actions-buy" className="space-y-3">
              {portfolio.buy.map((item, i) => (
                <div key={i} className="text-sm">
                  <div className="font-semibold text-gray-800">{item.ticker ? <><span className="font-mono">{item.ticker}</span> — </> : ''}{item.asset}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="action-hold rounded-md p-4">
            <h3 className="font-bold text-amber-700 text-sm mb-3 flex items-center gap-1">⏸ HOLD</h3>
            <div id="actions-hold" className="space-y-3">
              {portfolio.hold.map((item, i) => (
                <div key={i} className="text-sm">
                  <div className="font-semibold text-gray-800">{item.ticker ? <><span className="font-mono">{item.ticker}</span> — </> : ''}{item.asset}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="action-sell rounded-md p-4">
            <h3 className="font-bold text-red-700 text-sm mb-3 flex items-center gap-1">🚫 REDUCE / SELL</h3>
            <div id="actions-sell" className="space-y-3">
              {portfolio.sell.map((item, i) => (
                <div key={i} className="text-sm">
                  <div className="font-semibold text-gray-800">{item.ticker ? <><span className="font-mono">{item.ticker}</span> — </> : ''}{item.asset}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sectors + Bonds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><span>🏭</span> Sector Weights</h2>
          <div id="sector-breakdown" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {portfolio.sectors.map((s, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{s.name}</span>
                  <span className="text-xs font-bold" style={{ color: sectorColors[s.weight] }}>{sectorLabels[s.weight]}</span>
                </div>
                <div className="sector-bar-track">
                  <div className={`sector-bar-fill ${s.weight}`} style={{ width: `${sectorWidths[s.weight]}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-1">{s.reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><span>🏦</span> Fixed Income</h2>
          <div className="mb-3 text-sm" id="equity-style"><strong>Equity Style:</strong> {portfolio.equityStyle}</div>
          <div className="mb-3 p-3 rounded-lg bg-gray-50 text-sm">
            <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Bond Duration</div>
            <div id="duration-text" className="font-bold" style={{ color: 'var(--season-primary)' }}>{portfolio.bondDuration}</div>
          </div>
          <div id="bond-detail" className="grid grid-cols-2 gap-2">
            {portfolio.bondTypes.map((b, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="font-semibold text-sm text-gray-800">{b.name}</div>
                {b.ticker && <div className="font-mono text-xs text-gray-500">{b.ticker}</div>}
                <div className="text-lg font-bold mt-1" style={{ color: 'var(--season-primary)' }}>{b.weight}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alts & Crypto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-700 flex items-center gap-2"><span>⚡</span> Alts & Crypto</h2>
          <span id="alts-pct-badge" className="text-xs px-2.5 py-1 rounded-full font-semibold text-white" style={{ background: 'var(--season-primary)' }}>
            {alts?.pct ?? 10}% of portfolio
          </span>
        </div>
        <p id="alts-traditional" className="text-sm text-gray-600 leading-relaxed mb-4">{traditionalPart}</p>
        {cryptoPart && (
          <div id="alts-crypto-callout" className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">₿</span>
              <span className="font-bold text-amber-900 text-sm">Crypto View</span>
              <span id="alts-season-badge" className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-semibold">{currentLabel}</span>
            </div>
            <p id="alts-crypto-text" className="text-sm text-amber-800 leading-relaxed">{cryptoPart}</p>
          </div>
        )}
      </div>

      {/* Active Overlays */}
      {overlays.length > 0 && (
        <div id="overlays-section" className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2"><span>⚠️</span> Active Overlays</h2>
          <div id="overlays-list" className="space-y-1">
            {overlays.map((o, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watch List */}
      {portfolio.watchList?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><span>👁</span> Watch List</h2>
          <div id="watch-list" className="flex flex-wrap gap-2">
            {portfolio.watchList.map((w, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* Historical Analog + Risk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Historical Analog</div>
          <div id="historical-analog" className="text-sm text-gray-700">{portfolio.historicalAnalog}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Risk Profile</div>
          <div id="risk-level"><span className="text-lg font-bold" style={{ color: 'var(--season-primary)' }}>{portfolio.riskLevel}</span></div>
        </div>
      </div>

      {/* Phases Accordion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-700 flex items-center gap-2"><span>📋</span> All Phase Quick Reference</h2>
        </div>
        <div id="phases-accordion">
          <PhasesAccordion portfolio={portfolio} />
        </div>
      </div>
    </main>
  );
}
