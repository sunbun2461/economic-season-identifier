import { useState, useEffect, useRef } from 'react';
import { CS_RENDERERS } from '../lib/learnCheatSheets';
import { useSeason } from '../context/SeasonContext';
import type { PortfolioRec, GlossaryTerm, Season } from '../types';

// ─── Static Data ──────────────────────────────────────────────────────────────

const CHEAT_SHEETS = [
  { key: 'cycleWheel',   emoji: '🔄', bg: '#ecfdf5', title: 'Economic Cycle Wheel',           subtitle: 'Interactive season map: click each phase to see indicators and assets' },
  { key: 'yieldCurve',   emoji: '📐', bg: '#eff6ff', title: 'Yield Curve Shapes',              subtitle: 'Normal, flat, and inverted curves — what each shape signals' },
  { key: 'rateFlow',     emoji: '🏛️', bg: '#f5f3ff', title: 'Rate Transmission Diagram',       subtitle: 'How the Fed rate flows through mortgages, bonds, and savings' },
  { key: 'dualMandate',  emoji: '⚖️', bg: '#fff7ed', title: "Fed's Dual Mandate Balance",       subtitle: 'Employment vs. Inflation: the Fed\'s two competing goals on an animated scale' },
  { key: 'rateTimeline', emoji: '📈', bg: '#fefce8', title: 'Rate Cycle Timeline',              subtitle: 'The four phases of a complete rate cycle — click each dot to explore' },
  { key: 'creditSpread', emoji: '💳', bg: '#f0fdf4', title: 'Credit Spread Calculator',         subtitle: 'Treasury + Risk Premium = Corporate Bond yield — animated scenarios' },
];

const INDS = [
  { name:'Yield Curve (T10Y2Y)', icon:'📐', color:'#3b82f6', bg:'#eff6ff',
    what:'The difference between 10-year and 2-year Treasury yields. Measures market expectations for growth vs. short-term policy.',
    how:[{r:'> +0.5%', m:'Normal — healthy expansion, banks profit from lending'},
         {r:'0% to +0.5%', m:'Flat — uncertainty, potential inflection point'},
         {r:'< 0%', m:'Inverted — recession warning, historically very reliable signal'}],
    signals:'Spring/Summer', redFlag:'< -0.5% for 3+ months' },
  { name:'Fed Funds Rate', icon:'🏛️', color:'#8b5cf6', bg:'#f5f3ff',
    what:'The overnight interbank lending rate set by the FOMC at 8 meetings per year. Anchors the entire rate structure.',
    how:[{r:'Cutting cycle', m:'Spring — policy loosening, economy needs stimulus'},
         {r:'At cycle low', m:'Late Spring/Summer — max accommodation, recovery underway'},
         {r:'Hiking cycle', m:'Autumn — tightening, fighting inflation, strong economy'},
         {r:'At cycle high', m:'Late Autumn/Winter — restrictive, cooling demand'}],
    signals:'All seasons', redFlag:'3+ hikes of 50+ bps (aggressive tightening)' },
  { name:'CPI / PCE Inflation', icon:'📈', color:'#f97316', bg:'#fff7ed',
    what:'Consumer Price Index (CPI) and Personal Consumption Expenditures (PCE) measure how fast prices are rising across the economy.',
    how:[{r:'< 2%', m:'Below target — deflationary pressure, accommodative Fed likely'},
         {r:'2% ± 0.5%', m:'On target — Goldilocks zone, stable policy possible'},
         {r:'2.5–4%', m:'Elevated — Fed attention, potential hikes ahead'},
         {r:'> 4%', m:'Hot — aggressive Fed response, Summer/Autumn environment'}],
    signals:'Summer → Autumn transition', redFlag:'Core PCE > 4% with rising expectations' },
  { name:'NFP / Unemployment', icon:'👷', color:'#10b981', bg:'#f0fdf4',
    what:'Nonfarm Payrolls (NFP) shows monthly job additions. Unemployment rate shows % of labor force actively seeking work.',
    how:[{r:'NFP > +200K/mo', m:'Strong — Summer indicator, economy running hot'},
         {r:'NFP +100–200K', m:'Healthy — sustainable growth pace'},
         {r:'NFP < 0', m:'Job losses — Winter/Spring signal, recession warning'},
         {r:'UNRATE > 5%', m:'Rising unemployment — Spring or Winter signal'}],
    signals:'Winter → Spring transition', redFlag:'NFP negative for 2+ consecutive months' },
  { name:'High-Yield Spread (BAMLH)', icon:'⚡', color:'#eab308', bg:'#fefce8',
    what:'The extra yield HY bonds pay vs. Treasuries. Measures market confidence and credit risk appetite in real time.',
    how:[{r:'< 300 bps', m:'Risk-ON — Summer, tight spreads, credit confidence high'},
         {r:'300–450 bps', m:'Normal range — moderate credit conditions'},
         {r:'450–600 bps', m:'Widening — Autumn warning, stress emerging'},
         {r:'> 600 bps', m:'Wide — Winter crisis mode, default fears rising'}],
    signals:'Autumn → Winter stress', redFlag:'Rapid +200 bps widening in < 2 months' },
  { name:'Fed Balance Sheet (WALCL)', icon:'📋', color:'#64748b', bg:'#f8fafc',
    what:'Total assets held by the Federal Reserve — primarily Treasury bonds and MBS. Reflects the QE/QT cycle of money supply management.',
    how:[{r:'Expanding (QE)', m:'Spring/Winter — stimulus mode, money supply growing'},
         {r:'Stable', m:'Neutral — maintenance mode, no major policy shift'},
         {r:'Shrinking (QT)', m:'Autumn — tightening, draining liquidity from system'}],
    signals:'Policy direction confirmation', redFlag:'Rapid contraction > $100B/month' },
];

const EXAMPLES = [
  { title:'1994–1996: Insurance Cuts', icon:'🛡️', headerCls:'bg-green-500', lessonCls:'bg-green-50 border-green-200', lessonTxtCls:'text-green-700',
    timeline:[{y:'1994',s:'autumn'},{y:'1995',s:'winter'},{y:'1995–96',s:'spring'}],
    stats:[{k:'Rate cuts',v:'75 bps (3 cuts)'},{k:'GDP',v:'+2.5% (no recession)'},{k:'S&P 500',v:'+34% (2 yrs)'},{k:'UNRATE',v:'6.1% → 5.4%'}],
    lesson:'The Fed can cut rates as "insurance" against slowdown without a recession. When it works, equities soar. The 1995 soft landing remains the gold standard of monetary policy.' },
  { title:'2000–2003: Dot-com Bust', icon:'💻', headerCls:'bg-orange-500', lessonCls:'bg-orange-50 border-orange-200', lessonTxtCls:'text-orange-700',
    timeline:[{y:'1999–00',s:'autumn'},{y:'2001',s:'winter'},{y:'2001–02',s:'spring'}],
    stats:[{k:'Nasdaq peak-to-trough',v:'-78%'},{k:'Rate cuts',v:'-550 bps (3 yrs)'},{k:'Unemployment',v:'3.8% → 6.3%'},{k:'Recession',v:'8 months (2001)'}],
    lesson:'Valuations matter more than rates in a true bubble bust. Aggressive cuts helped eventually, but the damage to equity multiples took years to heal. Quality and defensives dramatically outperformed growth.' },
  { title:'2008–2009: Global Financial Crisis', icon:'🏦', headerCls:'bg-blue-500', lessonCls:'bg-blue-50 border-blue-200', lessonTxtCls:'text-blue-700',
    timeline:[{y:'2007–08',s:'autumn'},{y:'2008–09',s:'winter'},{y:'2009+',s:'spring'}],
    stats:[{k:'S&P 500 decline',v:'-57% peak to trough'},{k:'Rate cuts',v:'0.25% (near zero)'},{k:'Unemployment peak',v:'10%'},{k:'QE launched',v:'$1.75T (QE1)'}],
    lesson:'Credit crises are different from recessions — the financial system itself breaks. Zero interest rate policy plus QE was needed. Those who bought equities in March 2009 saw 400%+ gains over the next decade.' },
  { title:'2020–2022: COVID Shock & Inflation', icon:'🦠', headerCls:'bg-violet-500', lessonCls:'bg-violet-50 border-violet-200', lessonTxtCls:'text-violet-700',
    timeline:[{y:'2020 Q1',s:'winter'},{y:'2020 Q2',s:'spring'},{y:'2021',s:'summer'},{y:'2022',s:'autumn'}],
    stats:[{k:'Rate range',v:'0.25% → 5.5% in 2 yrs'},{k:'CPI peak',v:'9.1% (Jun 2022)'},{k:'QE peak',v:'$9T balance sheet'},{k:'S&P 2020–21',v:'+116% from trough'}],
    lesson:'The fastest rate hiking cycle since the 1980s followed the most extreme stimulus ever deployed. V-shape recoveries reward aggressive risk-taking early. The inflation lag from fiscal + monetary policy was badly underestimated.' },
];

const SEASON_BG: Record<string, string> = {
  spring:'bg-emerald-500', summer:'bg-yellow-400', autumn:'bg-orange-500', winter:'bg-blue-500',
};

const VIDEO_LIBRARY = [
  { cat:'macro', label:'📊 Macro & Cycles', videos:[
    { title:'How the Economic Machine Works', channel:'Ray Dalio / Bridgewater', duration:'31 min', id:'PHe0bXAIuk0', note:'The single best intro to macro. Watch this first.' },
    { title:'Principles: Changing World Order', channel:'Principles by Ray Dalio', duration:'44 min', id:'xguam0TKMw8', note:'Rise and fall of empires, debt supercycles, US dollar reserve status, and what comes next.' },
    { title:'Open Market Operations & Quantitative Easing', channel:'Khan Academy', duration:'~10 min', id:'TpLlJ8-AnQM', note:'How the Fed buys/sells bonds to control money supply. QE vs QT explained.' },
    { title:'Business Cycle Explained', channel:'Various Educators', duration:'~10 min', search:'business+cycle+explained+macroeconomics+expansion+recession', note:'Expansion, peak, contraction, trough — the four phases in plain English.' },
  ]},
  { cat:'valuation', label:'📐 Valuation', videos:[
    { title:'Introduction to Valuation', channel:'Aswath Damodaran / NYU Stern', duration:'~60 min', id:'znmQ7oMiQrM', note:'Session 1 of Damodaran\'s free valuation course. Intrinsic vs relative value, the foundations of DCF.' },
    { title:'What is the P/E Ratio?', channel:'The Plain Bagel', duration:'~12 min', search:'plain+bagel+PE+ratio+explained+price+to+earnings', note:'Price-to-earnings, cyclically adjusted PE (CAPE/Shiller PE), and why it matters for timing.' },
    { title:'EV/EBITDA and Enterprise Value', channel:'Various', duration:'~10 min', search:'EV+EBITDA+enterprise+value+explained+valuation+multiples', note:'The enterprise value multiples used by professional investors and M&A analysts.' },
    { title:'Dividend Yield and Income Investing', channel:'Various', duration:'~15 min', search:'dividend+yield+payout+ratio+income+stock+valuation', note:'Dividend yield, payout ratio, dividend growth rate — valuing income-generating stocks.' },
  ]},
  { cat:'books', label:'📚 Book Cliff Notes', videos:[
    { title:'The Intelligent Investor — Full Summary', channel:'The Swedish Investor', duration:'~16 min', id:'npoyc_X5zO8', note:'Graham\'s value investing framework, Mr. Market, margin of safety — in 16 minutes.' },
    { title:'Principles for Success — Episode 1', channel:'Principles by Ray Dalio', duration:'5 min', id:'dKz095P7LdU', note:'Ray Dalio\'s animated mini-series. The "5-step process", radical open-mindedness, and pain + reflection = progress.' },
    { title:'A Random Walk Down Wall Street', channel:'Various', duration:'~15 min', search:'random+walk+down+wall+street+malkiel+summary+index+funds', note:'Burton Malkiel\'s case for index funds, the EMH, and why active stock picking is so hard.' },
    { title:'The Little Book of Common Sense Investing', channel:'Various', duration:'~10 min', search:'little+book+common+sense+investing+bogle+index+fund+summary', note:'John Bogle\'s case for low-cost index funds. The math of compounding costs over decades.' },
  ]},
  { cat:'rates', label:'🏛️ Fixed Income & Rates', videos:[
    { title:'Introduction to Bonds', channel:'Khan Academy', duration:'~10 min', id:'Qh-M3_L4xYk', note:'Face value, coupon, yield, duration — bonds from scratch. Why bond prices move opposite to yields.' },
    { title:'The Yield Curve Explained', channel:'Various', duration:'~10 min', search:'yield+curve+explained+normal+inverted+recession+treasury', note:'Normal, flat, inverted — and why yield curve inversion has predicted every recent recession.' },
    { title:'Why the Fed Raises Interest Rates', channel:'CNBC / Federal Reserve', duration:'~5 min', search:'why+fed+raises+interest+rates+inflation+monetary+policy+explained', note:'The inflation → rate hike → credit crunch transmission mechanism, explained simply.' },
    { title:'High Yield Bonds and Credit Spreads', channel:'Various', duration:'~10 min', search:'high+yield+junk+bonds+credit+spreads+explained+risk+premium', note:'Junk bond premiums, what widening credit spreads signal about recession risk.' },
  ]},
  { cat:'crypto', label:'₿ Crypto in Macro', videos:[
    { title:'But how does Bitcoin actually work?', channel:'3Blue1Brown', duration:'26 min', id:'bBC-nXj3Ng4', note:'The best technical explainer of Bitcoin\'s cryptographic foundations. Zero jargon.' },
    { title:'Bitcoin as a Macro Asset — Lyn Alden', channel:'Coin Stories', duration:'~60 min', id:'IebP5M4JLyA', note:'Lyn Alden explains Bitcoin\'s role in macro: liquidity cycles, digital gold thesis, institutional adoption.' },
    { title:'Why Institutions Buy Bitcoin', channel:'Various', duration:'~15 min', search:'why+institutions+buy+bitcoin+ETF+BlackRock+treasury+reserve', note:'BlackRock ETF, MicroStrategy, treasury reserves — the case for a 1–5% portfolio allocation.' },
    { title:'Bitcoin Halving and the 4-Year Cycle', channel:'Various', duration:'~15 min', search:'bitcoin+halving+4+year+cycle+explained+bull+bear+market', note:'How BTC halvings interact with Fed liquidity cycles and global risk-on/risk-off environments.' },
  ]},
];

const BAR_CLS: Record<string, string> = {
  Equities: 'bg-blue-500', Bonds: 'bg-emerald-500', Cash: 'bg-yellow-400', Alts: 'bg-violet-500',
};
const PILL_CLS: Record<Season, string> = {
  spring: 'bg-emerald-50 text-emerald-600', summer: 'bg-yellow-50 text-yellow-600',
  autumn: 'bg-orange-50 text-orange-600', winter: 'bg-blue-50 text-blue-600',
};
const RING_CLS: Record<Season, string> = {
  spring: 'ring-2 ring-emerald-500', summer: 'ring-2 ring-yellow-400',
  autumn: 'ring-2 ring-orange-500', winter: 'ring-2 ring-blue-500',
};

// ─── Cheat Sheet Accordion Item ───────────────────────────────────────────────

function CheatSheetItem({ csKey, emoji, bg, title, subtitle }: {
  csKey: string; emoji: string; bg: string; title: string; subtitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (isOpen && !rendered.current && containerRef.current) {
      const renderer = CS_RENDERERS[csKey];
      if (renderer) {
        containerRef.current.innerHTML = '<div class="cs-placeholder">Loading…</div>';
        try {
          renderer(containerRef.current);
          rendered.current = true;
        } catch (err) {
          containerRef.current.innerHTML = `<div class="p-8 text-center text-red-400 text-sm">Render error — check console.</div>`;
          console.error('[CheatSheet] Error rendering', csKey, err);
        }
      }
    }
  }, [isOpen, csKey]);

  return (
    <div className={`cs-item${isOpen ? ' open' : ''}`}>
      <button className="cs-header" onClick={() => setIsOpen(o => !o)}>
        <div className="cs-icon-wrap" style={{ background: bg }}>
          <span>{emoji}</span>
        </div>
        <div className="cs-title-group">
          <div className="cs-title">{title}</div>
          <div className="cs-subtitle">{subtitle}</div>
        </div>
        <svg className="cs-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div className="cs-body">
        <div ref={containerRef} className="cs-render-target" />
      </div>
    </div>
  );
}

// ─── Indicators Grid ──────────────────────────────────────────────────────────

function IndicatorsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {INDS.map(ind => (
        <div key={ind.name} className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2" style={{ background: ind.bg }}>
            <span className="text-xl">{ind.icon}</span>
            <h3 className="text-sm font-bold text-slate-900">{ind.name}</h3>
          </div>
          <div className="px-5 py-4">
            <p className="text-[0.77rem] text-slate-500 mb-3 leading-relaxed">{ind.what}</p>
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-slate-400 mb-2">How to Read It</p>
            <div className="flex flex-col gap-1.5 mb-3">
              {ind.how.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[0.64rem] font-semibold whitespace-nowrap flex-shrink-0 px-1.5 py-0.5 rounded font-mono" style={{ color: ind.color, background: ind.bg }}>{h.r}</span>
                  <span className="text-[0.73rem] text-slate-600 leading-snug">{h.m}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400">Signals:</span>
                <span className="text-[0.68rem] font-semibold" style={{ color: ind.color }}>{ind.signals}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400">🚨</span>
                <span className="text-[0.68rem] text-red-500">{ind.redFlag}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Phases Grid ──────────────────────────────────────────────────────────────

function PhasesGrid({ currentKey }: { currentKey: string | null }) {
  const [phases, setPhases] = useState<PortfolioRec[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/phases')
      .then(r => r.json())
      .then(d => setPhases(d.phases))
      .catch(() => setError(true));
  }, []);

  const ICON: Record<string, string> = { spring:'🌱', summer:'☀️', autumn:'🍂', winter:'❄️' };

  if (error) return <div className="text-slate-400 py-8 text-center text-sm">Could not load phase data.</div>;
  if (!phases.length) return <div className="text-slate-400 py-8 text-center text-sm">Loading phases…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {phases.map(p => {
        const icon = ICON[p.season] || '📊';
        const isCurrent = currentKey === `${p.season}-${p.phase}`;
        const phaseName = `${p.phase.charAt(0).toUpperCase()+p.phase.slice(1)} ${p.season.charAt(0).toUpperCase()+p.season.slice(1)}`;
        const topSectors = (p.sectors || []).filter(s => s.weight === 'overweight').slice(0, 3);
        return (
          <div key={`${p.season}-${p.phase}`} className={`bg-white rounded overflow-hidden shadow-sm ${isCurrent ? (RING_CLS[p.season] || 'ring-2 ring-slate-400') : 'border border-gray-200'}`}>
            <div className={`px-5 py-3 flex items-center justify-between ${SEASON_BG[p.season] || 'bg-slate-500'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="text-sm font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{phaseName}</div>
                  <div className="text-[0.62rem] text-white/80 font-medium">{p.setup}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {isCurrent && <span className={`bg-white text-[0.58rem] font-bold px-2 py-0.5 rounded-full ${PILL_CLS[p.season] || ''}`}>CURRENT</span>}
                <span className="bg-black/20 text-white text-[0.58rem] font-semibold px-2 py-0.5 rounded-full">{p.riskLevel}</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[0.77rem] text-slate-600 leading-relaxed mb-3">{p.setupDescription}</p>
              <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Top Sectors</p>
              <div className="flex flex-wrap gap-1 mb-2.5">
                {topSectors.length ? topSectors.map(s => (
                  <span key={s.name} className={`px-2 py-0.5 rounded-full text-[0.67rem] font-medium ${PILL_CLS[p.season] || 'bg-slate-100 text-slate-600'}`}>{s.name}</span>
                )) : <span className="text-[0.7rem] text-slate-400">—</span>}
              </div>
              <div className="flex gap-1.5 items-center flex-wrap">
                <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400">Analog:</span>
                <span className="text-[0.67rem] text-slate-500">{p.historicalAnalog || '—'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Allocations Grid ─────────────────────────────────────────────────────────

function AllocationsGrid() {
  const [phases, setPhases] = useState<PortfolioRec[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/phases')
      .then(r => r.json())
      .then(d => setPhases(d.phases))
      .catch(() => setError(true));
  }, []);

  if (error) return <div className="text-slate-400 py-8 text-center text-sm">Could not load allocation data.</div>;
  if (!phases.length) return <div className="text-slate-400 py-8 text-center text-sm">Loading allocations…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {phases.map(p => {
        const alloc = p.allocation || {} as typeof p.allocation;
        const bars = [
          { label: 'Equities', pct: alloc.equities?.pct || 0, detail: alloc.equities?.detail || '' },
          { label: 'Bonds',    pct: alloc.bonds?.pct    || 0, detail: alloc.bonds?.detail    || '' },
          { label: 'Cash',     pct: alloc.cash?.pct     || 0, detail: alloc.cash?.detail     || '' },
          { label: 'Alts',     pct: alloc.alts?.pct     || 0, detail: alloc.alts?.detail     || '' },
        ].filter(b => b.pct > 0);
        const phaseName = `${p.phase.charAt(0).toUpperCase()+p.phase.slice(1)} ${p.season.charAt(0).toUpperCase()+p.season.slice(1)}`;
        return (
          <div key={`${p.season}-${p.phase}`} className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900">{phaseName}</div>
              <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${PILL_CLS[p.season] || 'bg-slate-100 text-slate-600'}`}>{p.riskLevel}</span>
            </div>
            <div className="px-5 py-3">
              <div className="flex h-6 rounded overflow-hidden mb-2">
                {bars.map(b => (
                  <div key={b.label} className={`${BAR_CLS[b.label] || 'bg-slate-400'} flex items-center justify-center`} style={{ width: `${b.pct}%` }} title={`${b.label}: ${b.pct}%`}>
                    {b.pct >= 12 && <span className="text-[0.58rem] font-bold text-white">{b.pct}%</span>}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {bars.map(b => (
                  <div key={b.label} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-sm inline-block ${BAR_CLS[b.label] || 'bg-slate-400'}`} />
                    <span className="text-[0.67rem] text-slate-500 font-medium">{b.label} <strong className="text-slate-800">{b.pct}%</strong></span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {bars.filter(b => b.detail).map(b => (
                  <div key={b.label} className="text-[0.67rem] text-slate-500 leading-snug">
                    <strong className="text-slate-700">{b.label}:</strong> {b.detail}
                  </div>
                ))}
              </div>
              {p.equityStyle && <div className="mt-2 px-2.5 py-1.5 bg-slate-50 rounded text-[0.67rem] text-slate-600"><strong>Style:</strong> {p.equityStyle}</div>}
              {p.bondDuration && <div className="mt-1 px-2.5 py-1.5 bg-slate-50 rounded text-[0.67rem] text-slate-600"><strong>Duration:</strong> {p.bondDuration}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── History Examples ─────────────────────────────────────────────────────────

function HistoryExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {EXAMPLES.map(ex => (
        <div key={ex.title} className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className={`${ex.headerCls} px-5 py-3 flex items-center gap-2`}>
            <span className="text-xl">{ex.icon}</span>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{ex.title}</h3>
          </div>
          <div className="px-5 py-4">
            <div className="flex gap-1 mb-3.5 items-center flex-wrap">
              {ex.timeline.map((t, i) => (
                <>
                  {i > 0 && <span key={`arrow-${i}`} className="text-gray-300 text-xs">→</span>}
                  <div key={t.y} className={`flex-1 min-w-[52px] ${SEASON_BG[t.s] || 'bg-slate-400'} rounded py-0.5 px-1 text-center`}>
                    <div className="text-[0.55rem] text-white/85 font-semibold whitespace-nowrap">{t.y}</div>
                    <div className="text-[0.52rem] text-white font-bold whitespace-nowrap capitalize">{t.s}</div>
                  </div>
                </>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {ex.stats.map(s => (
                <div key={s.k} className="bg-slate-50 border border-gray-200 rounded px-2.5 py-1.5">
                  <div className="text-[0.57rem] font-semibold uppercase tracking-wider text-slate-400">{s.k}</div>
                  <div className="text-[0.76rem] font-bold text-slate-900 font-mono">{s.v}</div>
                </div>
              ))}
            </div>
            <div className={`${ex.lessonCls} rounded-lg px-3 py-2.5 border`}>
              <p className={`text-[0.6rem] font-semibold uppercase tracking-wider ${ex.lessonTxtCls} mb-1`}>💡 Key Lesson</p>
              <p className="text-[0.75rem] text-slate-600 leading-relaxed">{ex.lesson}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Video Library ────────────────────────────────────────────────────────────

function VideoLibrary() {
  const [activeCat, setActiveCat] = useState('macro');
  const [openVideo, setOpenVideo] = useState<string | null>(null);

  const cat = VIDEO_LIBRARY.find(c => c.cat === activeCat);

  function handleVideoClick(v: { id?: string; search?: string }, cardKey: string) {
    if (!v.id) {
      window.open(`https://www.youtube.com/results?search_query=${v.search}`, '_blank', 'noopener');
      return;
    }
    setOpenVideo(openVideo === cardKey ? null : cardKey);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {VIDEO_LIBRARY.map(c => (
          <button
            key={c.cat}
            onClick={() => { setActiveCat(c.cat); setOpenVideo(null); }}
            className={`vid-cat-btn text-sm px-4 py-2 rounded-full border font-medium transition-colors ${
              activeCat === c.cat ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
            style={activeCat === c.cat ? { backgroundColor: 'var(--season-primary)', borderColor: 'var(--season-primary)' } : {}}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cat?.videos.map((v, i) => {
          const cardKey = `${activeCat}-${i}`;
          const isOpen = openVideo === cardKey;
          return (
            <div key={i} className="vid-card bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="vid-thumb-wrap relative cursor-pointer" onClick={() => handleVideoClick(v, cardKey)}>
                {v.id ? (
                  <img
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: '16/9' }}
                    src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`}
                    alt={v.title}
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full bg-slate-800 flex items-center justify-center text-4xl" style={{ aspectRatio: '16/9' }}>▶</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-11 h-11 bg-black/65 rounded-full flex items-center justify-center">
                    <span className="text-lg ml-0.5 text-white">▶</span>
                  </div>
                </div>
                <span className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {v.id ? '▶ Play' : '↗ YouTube'}
                </span>
              </div>
              {isOpen && v.id && (
                <div className="vid-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="w-full"
                    style={{ aspectRatio: '16/9', border: 'none' }}
                  />
                </div>
              )}
              <div className="px-3.5 pt-3 pb-3.5 cursor-pointer" onClick={() => handleVideoClick(v, cardKey)}>
                <div className="text-[13px] font-semibold text-slate-900 leading-snug mb-0.5">{v.title}</div>
                <div className="text-[11px] text-slate-500 mb-1">{v.channel} · {v.duration}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{v.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Glossary Section ─────────────────────────────────────────────────────────

function GlossarySection() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/glossary')
      .then(r => r.json())
      .then(d => setTerms(d.terms))
      .catch(() => setError(true));
  }, []);

  if (error) return <div className="text-red-400 text-sm p-4">Failed to load glossary — server may not be running.</div>;
  if (!terms.length) return <div className="text-slate-400 text-sm p-4">Loading glossary…</div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {terms.map(term => (
        <div key={term.term} className="glossary-item">
          <button
            className={`glossary-header w-full${open === term.term ? ' open' : ''}`}
            onClick={() => setOpen(open === term.term ? null : term.term)}
          >
            <span className="font-semibold text-gray-800 text-sm">{term.term}</span>
            <svg className="glossary-icon w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {open === term.term && (
            <div className="glossary-content open px-6 pb-4">
              <p className="text-gray-700 leading-relaxed text-sm mb-2">{term.definition}</p>
              <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <span className="text-amber-500 flex-shrink-0 text-base">💡</span>
                <p className="text-amber-900 text-sm leading-relaxed"><em>{term.analogy}</em></p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Learn Page ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'section-cheatsheets', label: '📊 Cheat Sheets' },
  { id: 'section-indicators',  label: '📐 Indicators' },
  { id: 'section-phases',      label: '🔄 8 Phases' },
  { id: 'section-allocations', label: '📦 Allocations' },
  { id: 'section-history',     label: '📜 Case Studies' },
  { id: 'section-videos',      label: '🎬 Videos' },
  { id: 'section-glossary',    label: '📖 Glossary' },
];

export default function Learn() {
  const { season, phase } = useSeason();
  const currentKey = `${season}-${phase}`;
  const [activeSection, setActiveSection] = useState('section-cheatsheets');

  useEffect(() => {
    const sections = NAV_ITEMS.map(n => n.id);
    function updateActive() {
      const scrollY = window.scrollY + 200;
      let current = sections[0];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      setActiveSection(current);
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener('scroll', updateActive);
  }, []);

  return (
    <div>
      {/* In-page nav */}
      <nav id="learn-nav" className="sticky z-30 bg-white border-b border-gray-200 shadow-sm overflow-x-auto" style={{ top: '56px' }}>
        <div className="flex min-w-max px-4">
          {NAV_ITEMS.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`learn-nav-link${activeSection === item.id ? ' active' : ''}`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-20">

        {/* Cheat Sheets */}
        <section id="section-cheatsheets">
          <p className="section-overline mb-2">Interactive Visualizations</p>
          <h2 className="playfair text-2xl font-bold text-slate-900 mb-2">6 Cheat Sheets</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl leading-relaxed">Each cheat sheet loads on demand. Click to expand and interact with the visualization.</p>
          <div className="space-y-3">
            {CHEAT_SHEETS.map(cs => (
              <CheatSheetItem key={cs.key} csKey={cs.key} emoji={cs.emoji} bg={cs.bg} title={cs.title} subtitle={cs.subtitle} />
            ))}
          </div>
        </section>

        {/* Indicators */}
        <section id="section-indicators">
          <p className="section-overline mb-2">How to Read the Data</p>
          <h2 className="playfair text-2xl font-bold text-slate-900 mb-2">Indicator Explainers</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl leading-relaxed">Six macro indicators — what they measure, how to interpret each reading, and what signal they send for economic season classification.</p>
          <IndicatorsGrid />
        </section>

        {/* 8 Phases */}
        <section id="section-phases">
          <p className="section-overline mb-2">The Complete Playbook</p>
          <h2 className="playfair text-2xl font-bold text-slate-900 mb-2">All 8 Phases</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl leading-relaxed">Early and late sub-phases for each season — each with a distinct risk profile, sector allocation, and historical analog.</p>
          <PhasesGrid currentKey={currentKey} />
        </section>

        {/* Allocations */}
        <section id="section-allocations">
          <p className="section-overline mb-2">Portfolio Construction</p>
          <h2 className="playfair text-2xl font-bold text-slate-900 mb-2">Asset Allocations by Phase</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl leading-relaxed">Target allocations across Equities, Bonds, Cash, and Alts for each of the 8 phases — with style and duration guidance.</p>
          <AllocationsGrid />
        </section>

        {/* Historical Examples */}
        <section id="section-history">
          <p className="section-overline mb-2">Learn From History</p>
          <h2 className="playfair text-2xl font-bold text-slate-900 mb-2">Case Studies</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl leading-relaxed">Four cycles that defined modern portfolio management — each with timeline, key stats, and the primary lesson.</p>
          <HistoryExamples />
        </section>

        {/* Video Library */}
        <section id="section-videos">
          <p className="section-overline mb-2">Video Library</p>
          <h2 className="playfair text-2xl font-bold text-slate-900 mb-2">Recommended Viewing</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl leading-relaxed">20 curated videos across macro cycles, valuation, fixed income, and crypto. Videos with a YouTube ID play inline; others open a YouTube search.</p>
          <VideoLibrary />
        </section>

        {/* Glossary */}
        <section id="section-glossary">
          <p className="section-overline mb-2">35 Key Terms</p>
          <h2 className="playfair text-2xl font-bold text-slate-900 mb-2">Glossary</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl leading-relaxed">Plain-English definitions with memorable analogies for the most important macro and finance terms used throughout this app.</p>
          <GlossarySection />
        </section>

        <div className="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This tool is for educational purposes only and does not constitute financial advice. Economic season classifications are based on algorithmic analysis of public data. Always consult a registered financial advisor before making investment decisions.
        </div>

      </main>
    </div>
  );
}
