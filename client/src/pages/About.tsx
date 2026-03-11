import { Link } from 'react-router-dom';

const SEASONS = [
  { emoji: '🌱', name: 'Spring', label: 'Recovery Phase', labelColor: '#6ee7b7', bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderColor: '#6ee7b7', nameColor: '#059669', textColor: '#065f46', desc: 'The Fed is cutting rates (or has just cut) to stimulate a slowing economy. Unemployment is falling, GDP is recovering, and credit is loosening. <strong>Best for: equities, high-yield bonds, cyclical sectors.</strong>' },
  { emoji: '☀️', name: 'Summer', label: 'Peak Expansion', labelColor: '#fbbf24', bg: 'linear-gradient(135deg,#fefce8,#fef9c3)', borderColor: '#fde047', nameColor: '#ca8a04', textColor: '#713f12', desc: 'Rates are at cycle lows, growth is strong, and confidence is high. Asset prices rise broadly. Inflation is beginning to stir. <strong>Best for: commodities, real estate, inflation-protected securities.</strong>' },
  { emoji: '🍂', name: 'Autumn', label: 'Tightening Phase', labelColor: '#fb923c', bg: 'linear-gradient(135deg,#fff7ed,#ffedd5)', borderColor: '#fdba74', nameColor: '#ea580c', textColor: '#7c2d12', desc: 'The Fed is hiking rates to fight inflation. Growth is slowing, yield curve is flattening, and volatility is rising. <strong>Best for: defensive stocks, cash, short-duration bonds.</strong>' },
  { emoji: '❄️', name: 'Winter', label: 'Contraction Phase', labelColor: '#60a5fa', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderColor: '#93c5fd', nameColor: '#2563eb', textColor: '#1e3a8a', desc: 'Rates are at cycle highs. GDP is declining or weak, unemployment rising, corporate profits under pressure. Flight to safety underway. <strong>Best for: government bonds, gold, defensive equities.</strong>' },
];

const STEPS = [
  { n: 1, title: 'Fetch Live Data from FRED', body: 'Every 4 hours, the server fetches 16 time series from the St. Louis Fed (FRED) API: Fed Funds rate, treasury yields, CPI, PCE, unemployment, nonfarm payrolls, HY spreads, balance sheet, GDP, and more.' },
  { n: 2, title: 'Score Each Indicator', body: 'Each indicator scores 0–1 for each of the 4 seasons. For example: a rising Fed Funds rate scores high for Autumn, low for Spring. An inverted yield curve scores high for Winter.' },
  { n: 3, title: 'Apply Weighted Scoring', body: 'Scores are multiplied by weights: Fed Direction (25%) → Yield Curve (20%) → Unemployment (15%) → Inflation (15%) → HY Spread (10%) → NFP (10%) → Balance Sheet (5%). The highest total wins.' },
  { n: 4, title: 'Determine Early vs. Late', body: 'If leading indicators (yield curve, HY spread, claims) are already pointing toward the next season, the current season is classified as "late." Otherwise it\'s "early." This changes the portfolio strategy significantly.' },
  { n: 5, title: 'Detect Special Overlays', body: 'The engine checks for unusual conditions: insurance cuts (Fed cutting while employment is strong), stagflation (rising inflation + rising unemployment), aggressive hiking (50+ bp consecutive hikes), and more. Each overlay modifies the base portfolio model.' },
];

const PAGES = [
  { icon: '📊', bg: '#ecfdf5', name: 'Dashboard', to: '/', colorClass: 'text-emerald-600', desc: 'Live season classification, confidence score, key rates (Fed Funds, Treasuries, HY Spread, Mortgage), macro indicators, FOMC calendar, season scoring breakdown, and next-season prediction. Auto-refreshes every 30 minutes.' },
  { icon: '🎓', bg: '#eff6ff', name: 'Learn',     to: '/learn',    colorClass: 'text-blue-600',   desc: 'Six interactive visualizations (yield curve shapes, rate cycle timeline, Fed dual mandate, credit spread, etc.), indicator explainer cards, all 8 phase deep-dives, allocation bars, historical case studies, and a 35-term glossary.' },
  { icon: '🎯', bg: '#fff7ed', name: 'Playbook',  to: '/playbook', colorClass: 'text-orange-600', desc: 'The full portfolio recommendation for the current phase: allocation donut chart, Buy / Hold / Sell lists, sector overweight/underweight bars, bond duration guidance, active overlays, and a reference accordion for all 8 phases.' },
  { icon: '📜', bg: '#fefce8', name: 'History',   to: '/history',  colorClass: 'text-yellow-600', desc: '35 years and 113 Fed rate decisions (1990–2026) in a filterable table. Color-coded by direction (green = cut, red = hike). Filter by decade, chair, direction, or season.' },
  { icon: '📈', bg: '#f5f3ff', name: 'Charts',    to: '/charts',   colorClass: 'text-violet-600', desc: 'A curated library of 41 TradingView chart links, organized by category: Rates, Yields, Inflation, Employment, Credit, Growth, and Markets.' },
  { icon: 'ℹ️', bg: '#f8fafc', name: 'About',     to: null,        colorClass: '', desc: 'This page. Background on the 4 economic seasons, how the classification engine works, what each page does, and the data sources used.' },
];

const FRED_SERIES = ['FEDFUNDS','DFF','DGS2','DGS10','DGS30','T10Y2Y','T10Y3M','UNRATE','PAYEMS','CPIAUCSL','PCEPI','MORTGAGE30US','GDP','WALCL','BAMLH0A0HYM2','SP500','T5YIE','ICSA','DFEDTARU','DFEDTARL'];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f1e3a 100%)', color: 'white', padding: '5rem 1rem 4rem', textAlign: 'center' }}>
        <div className="max-w-2xl mx-auto">
          <p className="section-overline mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>About This Tool</p>
          <h1 className="playfair mb-5" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 700, lineHeight: 1.15 }}>Macro Cycle Tracker</h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75 }}>
            A real-time economic season classifier that reads live FRED data, identifies where we are in the interest rate cycle, and translates that into actionable portfolio guidance — updated every 4 hours.
          </p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.75rem 2rem', background: 'var(--season-primary)', color: 'white', borderRadius: 4, fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
            Open Dashboard →
          </Link>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* 4 Seasons */}
        <section>
          <p className="section-overline mb-3">Core Framework</p>
          <h2 className="playfair text-3xl font-bold text-slate-900 mb-2">The 4 Economic Seasons</h2>
          <p className="text-slate-500 mb-8 max-w-2xl leading-relaxed">Every economy moves through a repeating cycle of four phases. The current season determines which assets historically perform best and how aggressively the Fed is likely to act.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SEASONS.map(s => (
              <div key={s.name} style={{ background: s.bg, borderRadius: 5, padding: '1.8rem', border: `1px solid ${s.borderColor}`, transition: 'transform 0.25s, box-shadow 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.14)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
                  <div>
                    <h3 className="playfair text-xl font-bold" style={{ color: s.nameColor }}>{s.name}</h3>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: s.labelColor }}>{s.label}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.84rem', color: s.textColor, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: s.desc }} />
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <p className="section-overline mb-3">Under the Hood</p>
          <h2 className="playfair text-3xl font-bold text-slate-900 mb-2">How Classification Works</h2>
          <p className="text-slate-500 mb-8 max-w-2xl leading-relaxed">Seven macro indicators are scored against four season profiles. A weighted engine picks the best match and determines whether we're in the early or late phase.</p>
          <div className="space-y-4">
            {STEPS.map(s => (
              <div key={s.n} className="flex items-start gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--season-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>{s.n}</div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">{s.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Site Guide */}
        <section>
          <p className="section-overline mb-3">Navigation Guide</p>
          <h2 className="playfair text-3xl font-bold text-slate-900 mb-2">What Each Page Does</h2>
          <p className="text-slate-500 mb-8 max-w-2xl leading-relaxed">Six pages, each with a different purpose. Start with the Dashboard, then go deeper with the tools you find most useful.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PAGES.map(p => (
              <div key={p.name} className="bg-white rounded-xl border border-slate-200 p-6 flex gap-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div style={{ width: 48, height: 48, borderRadius: 4, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">
                    {p.name}
                    {p.to && <Link to={p.to} className={`text-xs ${p.colorClass} font-medium ml-1 hover:underline`}>→ Open</Link>}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Sources */}
        <section>
          <p className="section-overline mb-3">Data & Methodology</p>
          <h2 className="playfair text-3xl font-bold text-slate-900 mb-2">Data Sources</h2>
          <p className="text-slate-500 mb-6 max-w-2xl leading-relaxed">All macroeconomic data is sourced from public APIs and databases. No financial data is sold or stored beyond a 4-hour local cache.</p>
          <div className="flex flex-wrap gap-3">
            {['🏛️ FRED (St. Louis Fed) — Live macro series','📅 FOMC Calendar — 2026 meeting dates','📜 Fed Rate History — 113 decisions, 1990–2026','📊 TradingView — Chart links only (no data API)','🔄 Cache TTL — 4 hours per series','🔑 API Key — Your FRED key in .env'].map(chip => (
              <div key={chip} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: '0.78rem', fontWeight: 500, color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{chip}</div>
            ))}
          </div>
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">FRED Series Used</p>
            <div className="font-mono text-xs text-slate-500 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5">
              {FRED_SERIES.map(s => <span key={s}>{s}</span>)}
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section>
          <p className="section-overline mb-3">Setup</p>
          <h2 className="playfair text-3xl font-bold text-slate-900 mb-2">Getting Started</h2>
          <p className="text-slate-500 mb-6 max-w-2xl leading-relaxed">The server must be running locally for the dashboard and data to work.</p>
          <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm leading-loose">
            <div className="text-slate-500 text-xs mb-3"># In your terminal, from the project folder:</div>
            <div><span className="text-slate-400">$</span> <span className="text-green-400">npm install</span></div>
            <div><span className="text-slate-400">$</span> <span className="text-green-400">cp .env.example .env</span> <span className="text-slate-600 text-xs ml-2"># then add your FRED API key</span></div>
            <div><span className="text-slate-400">$</span> <span className="text-green-400">npm run dev</span></div>
            <div className="mt-3 text-slate-500 text-xs">Server starts at http://localhost:3000</div>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Get a free FRED API key at{' '}
            <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">fred.stlouisfed.org</a>
            {' '}— takes 30 seconds to register.
          </p>
        </section>

        <div className="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This tool is for educational purposes only and does not constitute financial advice. Economic season classifications are based on algorithmic analysis of public data and historical patterns. Past performance does not guarantee future results. Market conditions can change rapidly and without warning. The classifications, portfolio recommendations, and predictions shown are illustrative models, not personalized investment advice. Always consult a registered financial advisor before making investment decisions.
        </div>
      </main>
    </>
  );
}
