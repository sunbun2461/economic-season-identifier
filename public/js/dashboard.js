;(function() {
// Dashboard page logic

const { applyTheme, buildHeader, buildKeyBar, trendArrow, fmt, fmtT, getPalette } = window.MacroTheme;

let apiData = null;
let overridePhase = null;

const SEASON_EMOJIS = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };

function renderSeasonCard(season) {
  const card = document.getElementById('season-card');
  if (!card) return;

  const { season: s, phase, confidence, summary, setup, detectedOverlays, scores } = season;
  const emoji = SEASON_EMOJIS[s];
  const palette = getPalette(s);
  const phaseColor = phase === 'early' ? palette.accent : palette.dark;

  card.innerHTML = `
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-4">
        <div class="text-6xl">${emoji}</div>
        <div>
          <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Current Phase</div>
          <h1 class="text-2xl font-bold" style="color: var(--season-dark)">
            ${phase.charAt(0).toUpperCase() + phase.slice(1)} ${s.charAt(0).toUpperCase() + s.slice(1)}
          </h1>
          <div class="text-sm font-medium mt-1" style="color: var(--season-primary)">${setup}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-gray-500 mb-1">Confidence</div>
        <div class="text-3xl font-bold" style="color: var(--season-dark)">${confidence}%</div>
        <div class="confidence-bar w-24 mt-1 ml-auto">
          <div class="confidence-fill" style="width: ${confidence}%"></div>
        </div>
      </div>
    </div>
    <p class="mt-4 text-gray-700 leading-relaxed">${summary}</p>
    ${detectedOverlays.length > 0 ? `
      <div class="mt-3 flex flex-wrap gap-2">
        ${detectedOverlays.map(o => `<span class="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">⚠️ ${o.substring(0, 60)}${o.length > 60 ? '...' : ''}</span>`).join('')}
      </div>
    ` : ''}
  `;
}

function renderFomcTimeline(meetings) {
  const container = document.getElementById('fomc-timeline');
  const detail = document.getElementById('fomc-next-detail');
  if (!container) return;

  // Show 2026 meetings
  const meetings2026 = meetings.filter(m => m.startDate.startsWith('2026'));

  container.innerHTML = meetings2026.map(m => {
    const monthDay = new Date(m.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const cls = m.isPast ? 'past' : m.isNext ? 'next' : 'future';
    const sep = m.hasSEP ? ' ★' : '';
    const result = m.result ? `<div class="text-xs opacity-80">${m.result}</div>` : '';
    return `<div class="fomc-item ${cls} flex-shrink-0">
      <div class="font-medium text-xs">${monthDay}${sep}</div>
      ${result}
    </div>`;
  }).join('');

  const next = meetings.find(m => m.isNext);
  if (next && detail) {
    const daysUntil = Math.ceil((new Date(next.startDate) - new Date()) / (1000 * 60 * 60 * 24));
    detail.innerHTML = `<strong>Next:</strong> ${next.startDate} — ${next.endDate} (${daysUntil} days away)${next.hasSEP ? ' — ★ Includes SEP + Dot Plot' : ''}`;
  }
}

function renderRatesGrid(snapshot) {
  const grid = document.getElementById('rates-grid');
  if (!grid) return;

  const { rates } = snapshot;
  const cards = [
    { label: 'Fed Funds', note: 'FOMC target rate', series: rates.fedFunds, suffix: '%' },
    { label: '2Y Treasury', note: 'Near-term rate expectations', series: rates.dgs2, suffix: '%' },
    { label: '10Y Treasury', note: 'Long-term growth outlook', series: rates.dgs10, suffix: '%' },
    { label: '30Y Treasury', note: 'Mortgage & pension benchmark', series: rates.dgs30, suffix: '%' },
    { label: '10Y-2Y Spread', note: 'Negative = inverted = recession risk', series: rates.t10y2y, suffix: '%', highlight: true },
    { label: 'Mortgage 30Y', note: 'Average 30-year home loan rate', series: rates.mortgage30, suffix: '%' },
    { label: 'HY Spread', note: 'Junk bond premium — >5% = stress', series: snapshot.credit.hySpread, suffix: '%' },
    { label: 'Fed Balance Sheet', note: 'QE = rising (stimulus) / QT = falling', series: snapshot.credit.walcl, largeNum: true },
  ];

  grid.innerHTML = cards.map(({ label, note, series, suffix, largeNum, highlight }) => {
    const val = series.latest;
    const displayVal = largeNum ? fmtT(val) : (val !== null ? val.toFixed(2) + (suffix || '') : 'N/A');
    const arrow = trendArrow(series.trend);
    const borderClass = highlight ? 'border-2' : 'border';
    const borderStyle = highlight ? `border-color: var(--season-primary)` : '';
    const isNegative = val !== null && val < 0 && !largeNum;
    const valueColor = isNegative ? 'color: #dc2626' : 'color: var(--season-dark)';
    return `<div class="rate-card ${borderClass}" style="${borderStyle}">
      <div class="text-xs font-semibold text-gray-600">${label}</div>
      ${note ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;line-height:1.3">${note}</div>` : ''}
      <div class="text-xl font-bold" style="${valueColor}">${displayVal}</div>
      <div class="text-sm mt-1">${arrow} <span class="text-gray-400 text-xs">3-mo trend</span></div>
    </div>`;
  }).join('');
}

function renderIndicatorsGrid(snapshot) {
  const grid = document.getElementById('indicators-grid');
  if (!grid) return;

  const { inflation, labor, growth } = snapshot;

  // Calculate YoY CPI
  let yoyCpi = null;
  const cpiData = inflation.cpi.data;
  if (cpiData.length >= 13) {
    const curr = cpiData[cpiData.length - 1].value;
    const yearAgo = cpiData[cpiData.length - 13].value;
    yoyCpi = ((curr - yearAgo) / yearAgo) * 100;
  }

  // YoY PCE
  let yoyPce = null;
  const pceData = inflation.pce.data;
  if (pceData.length >= 13) {
    const curr = pceData[pceData.length - 1].value;
    const yearAgo = pceData[pceData.length - 13].value;
    yoyPce = ((curr - yearAgo) / yearAgo) * 100;
  }

  const nfpVal = labor.nfp?.latest ?? null;

  const cards = [
    { label: 'Unemployment', note: 'Healthy range: 3.5–5%', value: labor.unrate.latest, suffix: '%', trend: labor.unrate.trend, decimals: 1 },
    { label: 'CPI (YoY)', note: "Inflation — Fed target: 2%", value: yoyCpi, suffix: '%', trend: inflation.cpi.trend, decimals: 2 },
    { label: 'PCE (YoY)', note: "Fed's preferred inflation gauge", value: yoyPce, suffix: '%', trend: inflation.pce.trend, decimals: 2 },
    { label: '5Y Breakeven', note: 'Market-implied inflation expectation', value: inflation.t5yie.latest, suffix: '%', trend: inflation.t5yie.trend, decimals: 2 },
    { label: 'Jobless Claims', note: '<250K/wk = strong labor market', value: labor.icsa.latest ? labor.icsa.latest / 1000 : null, suffix: 'K', trend: labor.icsa.trend, decimals: 0 },
    { label: 'Real GDP', note: 'Chained 2017 dollars (quarterly)', value: growth.gdp.latest, suffix: 'B', trend: growth.gdp.trend, decimals: 0 },
    { label: 'S&P 500', note: 'US large-cap equity benchmark', value: snapshot.market.sp500.latest, suffix: '', trend: snapshot.market.sp500.trend, decimals: 0 },
    { label: 'Non-Farm Payrolls', note: '>150K/mo = healthy job growth', value: nfpVal, suffix: 'K', trend: labor.nfp?.trend ?? 'flat', decimals: 0 },
  ];

  grid.innerHTML = cards.map(({ label, note, value, suffix, trend, decimals }) => {
    const displayVal = value !== null && value !== undefined
      ? value.toFixed(decimals ?? 2) + suffix
      : 'N/A';
    const arrow = trendArrow(trend);
    return `<div class="rate-card">
      <div class="text-xs font-semibold text-gray-600">${label}</div>
      ${note ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;line-height:1.3">${note}</div>` : ''}
      <div class="text-xl font-bold" style="color: var(--season-dark)">${displayVal}</div>
      <div class="text-sm mt-1">${arrow} <span class="text-gray-400 text-xs">trend</span></div>
    </div>`;
  }).join('');
}

function renderSeasonScores(seasonData) {
  const container = document.getElementById('season-scores');
  if (!container) return;

  const seasons = [
    { key: 'spring', label: 'Spring', emoji: '🌱' },
    { key: 'summer', label: 'Summer', emoji: '☀️' },
    { key: 'autumn', label: 'Autumn', emoji: '🍂' },
    { key: 'winter', label: 'Winter', emoji: '❄️' },
  ];

  container.innerHTML = seasons.map(({ key, label, emoji }) => {
    const score = seasonData.scores[key] ?? 0;
    const isCurrent = key === seasonData.season;
    return `
      <div class="flex items-center gap-3">
        <div class="w-28 text-sm font-medium ${isCurrent ? 'font-bold' : 'text-gray-600'}">
          ${emoji} ${label}${isCurrent ? ' ◄' : ''}
        </div>
        <div class="flex-1 score-bar">
          <div class="score-fill ${key}" style="width: ${score}%"></div>
        </div>
        <div class="w-10 text-right text-sm font-bold ${isCurrent ? '' : 'text-gray-500'}">${score}%</div>
      </div>
    `;
  }).join('');

  const conflicting = document.getElementById('conflicting-indicators');
  if (conflicting && seasonData.conflictingIndicators?.length > 0) {
    conflicting.innerHTML = `<strong>Mixed signals:</strong> ${seasonData.conflictingIndicators.slice(0, 3).join('; ')}`;
  }
}

function renderPrediction(prediction) {
  const container = document.getElementById('prediction-card');
  if (!container || !prediction) return;

  const emoji = SEASON_EMOJIS[prediction.nextSeason];

  container.innerHTML = `
    <div class="p-3 rounded-lg season-bg-dark">
      <div class="text-xs text-gray-500 mb-1">Next Phase</div>
      <div class="font-bold" style="color: var(--season-dark)">
        ${emoji} ${prediction.nextPhase.charAt(0).toUpperCase() + prediction.nextPhase.slice(1)} ${prediction.nextSeason.charAt(0).toUpperCase() + prediction.nextSeason.slice(1)}
      </div>
      <div class="text-sm text-gray-600 mt-1">${prediction.timing}</div>
    </div>
    <div>
      <div class="text-xs font-semibold text-gray-500 mb-2">Watch For:</div>
      <ul class="space-y-1">
        ${prediction.watchFor.slice(0, 4).map(w => `
          <li class="text-sm text-gray-700 flex gap-2">
            <span class="text-gray-400 mt-0.5">•</span>
            <span>${w}</span>
          </li>
        `).join('')}
      </ul>
    </div>
    <div>
      <div class="text-xs font-semibold text-gray-500 mb-2">Catalysts:</div>
      <div class="flex flex-wrap gap-2">
        ${prediction.catalysts.slice(0, 3).map(c => `
          <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">${c}</span>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMiniDonut(allocation) {
  const canvas = document.getElementById('mini-donut');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 60;
  const innerRadius = 35;

  const slices = [
    { label: 'Equities', pct: allocation.equities.pct, color: '#22c55e' },
    { label: 'Bonds', pct: allocation.bonds.pct, color: '#3b82f6' },
    { label: 'Cash', pct: allocation.cash.pct, color: '#6b7280' },
    { label: 'Alts', pct: allocation.alts.pct, color: '#f97316' },
  ];

  let startAngle = -Math.PI / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  slices.forEach(({ pct, color }) => {
    const angle = (pct / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    startAngle += angle;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Legend
  const legend = document.getElementById('portfolio-legend');
  if (legend) {
    legend.innerHTML = slices.map(({ label, pct, color }) => `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm flex-shrink-0" style="background: ${color}"></div>
          <span class="text-gray-600">${label}</span>
        </div>
        <span class="font-bold">${pct}%</span>
      </div>
    `).join('');
  }
}

function setLoadingStatus(msg) {
  const el = document.getElementById('loading-status');
  if (el) el.textContent = msg;
}

async function loadData(force = false, retryCount = 0) {
  try {
    const url = force ? '/api/refresh' : '/api/data';
    setLoadingStatus(force ? 'Refreshing live data from FRED API…' : 'Connecting to server…');

    console.log(`[Dashboard] Fetching ${url}…`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let res;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    setLoadingStatus('Parsing data…');
    apiData = await res.json();
    console.log('[Dashboard] API response received:', apiData);

    if (apiData.stale) {
      document.getElementById('stale-warning')?.classList.remove('hidden');
    }

    const season = overridePhase
      ? { ...apiData.season, season: overridePhase.season, phase: overridePhase.phase }
      : apiData.season;

    console.log('[Dashboard] Season:', apiData.season?.season, apiData.season?.phase, apiData.season?.confidence + '%');
    console.log('[Dashboard] Snapshot rates:', apiData.snapshot?.rates);
    console.log('[Dashboard] Portfolio:', apiData.portfolio?.allocation);
    console.log('[Dashboard] Prediction:', apiData.prediction);

    applyTheme(season.season, season.phase);
    renderSeasonCard(season);
    renderFomcTimeline(apiData.fomc);
    renderRatesGrid(apiData.snapshot);
    renderIndicatorsGrid(apiData.snapshot);
    renderSeasonScores(apiData.season);
    renderPrediction(apiData.prediction);
    renderMiniDonut(apiData.portfolio.allocation);

    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
      lastUpdated.textContent = `Last updated: ${new Date(apiData.timestamp).toLocaleTimeString()}`;
    }
  } catch (err) {
    console.error('Failed to load data:', err);

    // Auto-retry once after 3s if not a manual force-refresh
    if (!force && retryCount < 1) {
      setLoadingStatus('Connection failed — retrying in 3s…');
      setTimeout(() => loadData(false, retryCount + 1), 3000);
      return;
    }

    const card = document.getElementById('season-card');
    if (card) {
      const isTimeout = err.name === 'AbortError';
      const isNetwork = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');
      console.error('[Dashboard] All retries failed. Error:', err.name, err.message);
      let msg, hint;
      if (isTimeout) {
        msg = '⏱️ Request timed out';
        hint = 'FRED API is slow. The server may be fetching fresh data from FRED — wait 30s and retry.';
      } else if (isNetwork) {
        msg = '🔌 Server not running';
        hint = 'Start the server first, then refresh this page.';
      } else {
        msg = '❌ Failed to load data';
        hint = err.message || 'Check the browser console (F12) for details.';
      }
      card.innerHTML = `
        <div class="p-6 space-y-4">
          <div class="text-2xl font-bold text-slate-800">${msg}</div>
          <div class="text-slate-600 leading-relaxed">${hint}</div>
          ${isNetwork ? `
          <div class="bg-slate-900 text-green-400 rounded-xl px-4 py-3 font-mono text-sm">
            <div class="text-slate-500 text-xs mb-1"># In your terminal:</div>
            npm run dev
          </div>` : ''}
          <div class="flex items-center gap-3 pt-1">
            <button onclick="loadData()" class="px-5 py-2 text-white text-sm font-semibold rounded-xl" style="background:var(--season-primary)">
              Try Again
            </button>
            <a href="/api/data" target="_blank" class="text-sm text-blue-600 hover:underline">
              Test API endpoint →
            </a>
          </div>
        </div>`;
    }
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  buildHeader('dashboard', (season, phase) => {
    if (season) {
      overridePhase = { season, phase };
      applyTheme(season, phase);
      if (apiData) {
        renderSeasonCard({ ...apiData.season, season, phase });
      }
    } else {
      overridePhase = null;
      if (apiData) {
        applyTheme(apiData.season.season, apiData.season.phase);
        renderSeasonCard(apiData.season);
      }
    }
  });

  buildKeyBar(document.getElementById('phase-pills'), (season, phase) => {
    overridePhase = { season, phase };
    applyTheme(season, phase);
    if (apiData) renderSeasonCard({ ...apiData.season, season, phase });
  });

  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    loadData(true);
  });

  loadData();

  // Auto-refresh every 30 minutes
  setInterval(() => loadData(), 30 * 60 * 1000);
});

// Expose loadData for inline onclick buttons
window.loadData = loadData;

})();
