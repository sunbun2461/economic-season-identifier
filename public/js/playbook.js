;(function() {
const { applyTheme, buildHeader, buildKeyBar, getPalette, setupAccordion } = window.MacroTheme;

const SEASON_EMOJIS = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };

const ALL_PHASES_INFO = [
  { season: 'spring', phase: 'early', label: 'Early Spring', emoji: '🌱', risk: 'Moderate-Aggressive' },
  { season: 'spring', phase: 'late', label: 'Late Spring', emoji: '🌱', risk: 'Aggressive' },
  { season: 'summer', phase: 'early', label: 'Early Summer', emoji: '☀️', risk: 'Moderate-Aggressive' },
  { season: 'summer', phase: 'late', label: 'Late Summer', emoji: '☀️', risk: 'Moderate' },
  { season: 'autumn', phase: 'early', label: 'Early Autumn', emoji: '🍂', risk: 'Moderate-Defensive' },
  { season: 'autumn', phase: 'late', label: 'Late Autumn', emoji: '🍂', risk: 'Defensive' },
  { season: 'winter', phase: 'early', label: 'Early Winter', emoji: '❄️', risk: 'Defensive → Opportunistic' },
  { season: 'winter', phase: 'late', label: 'Late Winter', emoji: '❄️', risk: 'Aggressive' },
];

function drawDonut(canvasId, allocation, palette) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const outerR = Math.min(cx, cy) - 10;
  const innerR = outerR * 0.55;

  const items = [
    { key: 'equities', label: 'Equities', pct: allocation.equities.pct, color: palette.primary,  detail: allocation.equities.detail },
    { key: 'bonds',    label: 'Bonds',    pct: allocation.bonds.pct,    color: '#3b82f6',         detail: allocation.bonds.detail },
    { key: 'cash',     label: 'Cash',     pct: allocation.cash.pct,     color: '#6b7280',         detail: allocation.cash.detail },
    { key: 'alts',     label: 'Alts',     pct: allocation.alts.pct,     color: '#f97316',         detail: allocation.alts.detail },
  ];

  function paint(selectedKey) {
    ctx.clearRect(0, 0, w, h);
    let startAngle = -Math.PI / 2;
    items.forEach(({ key, pct, color }) => {
      const angle = (pct / 100) * 2 * Math.PI;
      const isSelected = !selectedKey || key === selectedKey;
      ctx.globalAlpha = isSelected ? 1 : 0.3;
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
    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  paint(null);

  // Interactive legend
  const legend = document.getElementById('donut-legend');
  const detailPanel = document.getElementById('donut-detail-panel');
  if (!legend) return;

  let selected = null;

  legend.innerHTML = items.map(({ key, label, pct, color }) => `
    <div class="donut-leg-row flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all" data-key="${key}" style="border:1px solid transparent">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-sm flex-shrink-0" style="background:${color}"></div>
        <span class="text-gray-600 text-sm">${label}</span>
      </div>
      <span class="font-bold text-sm">${pct}%</span>
    </div>
  `).join('');

  legend.querySelectorAll('.donut-leg-row').forEach(row => {
    row.addEventListener('click', () => {
      const key = row.dataset.key;
      const data = items.find(i => i.key === key);
      if (!data) return;

      if (selected === key) {
        // Deselect
        selected = null;
        legend.querySelectorAll('.donut-leg-row').forEach(r => {
          r.style.background = '';
          r.style.borderColor = 'transparent';
          r.style.fontWeight = '';
        });
        if (detailPanel) detailPanel.innerHTML = '';
        paint(null);
      } else {
        selected = key;
        legend.querySelectorAll('.donut-leg-row').forEach(r => {
          const isThis = r.dataset.key === key;
          r.style.background = isThis ? `${data.color}12` : '';
          r.style.borderColor = isThis ? data.color : 'transparent';
        });
        if (detailPanel) {
          detailPanel.innerHTML = `
            <div style="margin-top:8px;padding:10px 12px;border-radius:8px;background:${data.color}10;border:1px solid ${data.color}35">
              <div style="font-size:11px;font-weight:700;color:${data.color};margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em">${data.label} — ${data.pct}%</div>
              <div style="font-size:11px;color:#475569;line-height:1.5">${data.detail}</div>
            </div>`;
        }
        paint(key);
      }
    });
  });
}

function renderPortfolioHeader(portfolio, season) {
  const el = document.getElementById('portfolio-header');
  if (!el) return;

  const emoji = SEASON_EMOJIS[portfolio.season];
  const palette = getPalette(portfolio.season);

  el.innerHTML = `
    <div class="flex items-start justify-between flex-wrap gap-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span class="text-4xl">${emoji}</span>
          <div>
            <h1 class="text-xl font-bold" style="color: var(--season-dark)">
              ${portfolio.phase.charAt(0).toUpperCase() + portfolio.phase.slice(1)} ${portfolio.season.charAt(0).toUpperCase() + portfolio.season.slice(1)} Playbook
            </h1>
            <div class="text-sm font-medium" style="color: var(--season-primary)">${portfolio.setup}</div>
          </div>
        </div>
        <p class="text-gray-700 text-sm leading-relaxed max-w-2xl">${portfolio.setupDescription}</p>
      </div>
      <div class="flex flex-col items-end gap-2">
        <span class="px-3 py-1 rounded-full text-sm font-semibold text-white" style="background: var(--season-primary)">
          ${portfolio.riskLevel}
        </span>
        <span class="text-sm text-gray-500">Confidence: <strong>${portfolio.confidence}%</strong></span>
      </div>
    </div>
  `;
}

function renderActions(buy, hold, sell) {
  const renderItem = (item) => `
    <div class="text-sm">
      <div class="font-semibold text-gray-800">${item.ticker ? `<span class="font-mono">${item.ticker}</span> — ` : ''}${item.asset}</div>
      <div class="text-xs text-gray-600 mt-0.5">${item.reason}</div>
    </div>
  `;
  document.getElementById('actions-buy').innerHTML = buy.map(renderItem).join('');
  document.getElementById('actions-hold').innerHTML = hold.map(renderItem).join('');
  document.getElementById('actions-sell').innerHTML = sell.map(renderItem).join('');
}

function renderSectors(sectors) {
  const el = document.getElementById('sector-breakdown');
  if (!el) return;

  const widths = { overweight: 85, neutral: 50, underweight: 20 };
  const colors = { overweight: '#22c55e', neutral: '#6b7280', underweight: '#ef4444' };
  const labels = { overweight: '▲ OW', neutral: '= NW', underweight: '▼ UW' };

  el.innerHTML = sectors.map(s => `
    <div class="p-3 rounded-lg bg-gray-50">
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm font-medium text-gray-700">${s.name}</span>
        <span class="text-xs font-bold" style="color: ${colors[s.weight]}">${labels[s.weight]}</span>
      </div>
      <div class="sector-bar-track">
        <div class="sector-bar-fill ${s.weight}" style="width: ${widths[s.weight]}%"></div>
      </div>
      <div class="text-xs text-gray-500 mt-1">${s.reason}</div>
    </div>
  `).join('');
}

function renderBondDetail(portfolio) {
  const el = document.getElementById('bond-detail');
  if (!el) return;

  el.innerHTML = portfolio.bondTypes.map(b => `
    <div class="p-3 rounded-lg bg-gray-50 border border-gray-100">
      <div class="font-semibold text-sm text-gray-800">${b.name}</div>
      ${b.ticker ? `<div class="font-mono text-xs text-gray-500">${b.ticker}</div>` : ''}
      <div class="text-lg font-bold mt-1" style="color: var(--season-primary)">${b.weight}</div>
    </div>
  `).join('');

  const style = document.getElementById('equity-style');
  if (style) style.innerHTML = `<strong>Equity Style:</strong> ${portfolio.equityStyle}`;

  const duration = document.getElementById('duration-text');
  if (duration) duration.textContent = portfolio.bondDuration;
}

function renderAltsDetail(portfolio) {
  const alts = portfolio.allocation.alts;
  if (!alts) return;

  const badge = document.getElementById('alts-pct-badge');
  if (badge) badge.textContent = `${alts.pct}% of portfolio`;

  const detail = alts.detail || '';
  const cryptoIndex = detail.indexOf('Crypto:');

  const traditionalEl = document.getElementById('alts-traditional');
  const calloutEl = document.getElementById('alts-crypto-callout');
  const cryptoTextEl = document.getElementById('alts-crypto-text');
  const seasonBadge = document.getElementById('alts-season-badge');

  if (cryptoIndex !== -1) {
    const traditionalPart = detail.slice(0, cryptoIndex).trim().replace(/\.$/, '');
    const cryptoPart = detail.slice(cryptoIndex + 'Crypto:'.length).trim();

    if (traditionalEl) traditionalEl.textContent = traditionalPart;
    if (cryptoTextEl) cryptoTextEl.textContent = cryptoPart;
    if (calloutEl) calloutEl.classList.remove('hidden');
    if (seasonBadge) {
      const label = `${portfolio.phase.charAt(0).toUpperCase() + portfolio.phase.slice(1)} ${portfolio.season.charAt(0).toUpperCase() + portfolio.season.slice(1)}`;
      seasonBadge.textContent = label;
    }
  } else {
    if (traditionalEl) traditionalEl.textContent = detail;
  }
}

function renderOverlays(overlays) {
  const section = document.getElementById('overlays-section');
  const list = document.getElementById('overlays-list');
  if (!section || !list) return;

  if (overlays.length === 0) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');
  list.innerHTML = overlays.map(o => `
    <div class="flex items-start gap-2 text-sm text-amber-800">
      <span class="text-amber-500 mt-0.5 flex-shrink-0">•</span>
      <span>${o}</span>
    </div>
  `).join('');
}

function renderWatchList(watchList) {
  const el = document.getElementById('watch-list');
  if (!el) return;
  el.innerHTML = watchList.map(w => `
    <span class="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">${w}</span>
  `).join('');
}

function renderPhasesAccordion(portfolio) {
  const container = document.getElementById('phases-accordion');
  if (!container) return;

  const phases = [
    { key: 'spring-early', label: '🌱 Early Spring', risk: 'Moderate-Aggressive', alloc: '55/25/10/10', note: 'Max uncertainty = max opportunity. Growth, small caps, extend bonds.' },
    { key: 'spring-late', label: '🌱 Late Spring', risk: 'Aggressive', alloc: '65/20/5/10', note: 'All clear rally. Best historical risk/reward. Cyclicals, international, REITs.' },
    { key: 'summer-early', label: '☀️ Early Summer', risk: 'Moderate-Aggressive', alloc: '60/20/10/10', note: 'Growth → Value rotation. Financials, energy, industrials. Add TIPS.' },
    { key: 'summer-late', label: '☀️ Late Summer', risk: 'Moderate', alloc: '50/20/20/10', note: 'Build war chest. Quality, dividends, low-vol. T-bills paying real yield.' },
    { key: 'autumn-early', label: '🍂 Early Autumn', risk: 'Moderate-Defensive', alloc: '45/20/25/10', note: 'Healthcare, staples, T-bills. Lock CD rates at peak.' },
    { key: 'autumn-late', label: '🍂 Late Autumn', risk: 'Defensive', alloc: '35/25/30/10', note: 'Start buying TLT. Inverted curve = long bonds cheap. Lock 12-mo CDs.' },
    { key: 'winter-early', label: '❄️ Early Winter', risk: 'Defensive → Opportunistic', alloc: '35/30/25/10', note: 'TLT paying off. DCA into SPY in tranches. Trim gold.' },
    { key: 'winter-late', label: '❄️ Late Winter', risk: 'Aggressive', alloc: '55/25/10/10', note: 'THE buying opportunity. Deploy cash. Rally starts before data confirms it.' },
  ];

  const currentKey = `${portfolio.season}-${portfolio.phase}`;

  container.innerHTML = phases.map(p => {
    const isCurrent = p.key === currentKey;
    return `
      <div class="accordion-item">
        <div class="accordion-header px-5 py-3 flex items-center justify-between hover:bg-gray-50 ${isCurrent ? 'bg-gray-50' : ''}" ${isCurrent ? 'style="border-left: 3px solid var(--season-primary)"' : ''}>
          <div class="flex items-center gap-3">
            <span class="font-semibold text-gray-800">${p.label}</span>
            ${isCurrent ? '<span class="text-xs px-2 py-0.5 rounded-full text-white font-bold" style="background: var(--season-primary)">CURRENT</span>' : ''}
          </div>
          <div class="flex items-center gap-4">
            <span class="text-xs text-gray-500 hidden sm:block">${p.risk}</span>
            <span class="text-xs font-mono text-gray-400 hidden md:block">${p.alloc}</span>
            <svg class="accordion-icon w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
        <div class="accordion-content ${isCurrent ? 'open' : ''} px-5 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600">
          <div class="font-medium mb-1">Allocation: Equities/Bonds/Cash/Alts = ${p.alloc}</div>
          <div>${p.note}</div>
        </div>
      </div>
    `;
  }).join('');

  setupAccordion(container);
}

async function loadData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    const { portfolio, season } = data;
    const palette = getPalette(portfolio.season);

    applyTheme(portfolio.season, portfolio.phase);
    renderPortfolioHeader(portfolio, season);
    drawDonut('donut-canvas', portfolio.allocation, palette);
    renderActions(portfolio.buy, portfolio.hold, portfolio.sell);
    renderSectors(portfolio.sectors);
    renderBondDetail(portfolio);
    renderAltsDetail(portfolio);
    renderOverlays(portfolio.appliedOverlays || season.detectedOverlays);
    renderWatchList(portfolio.watchList);
    renderPhasesAccordion(portfolio);

    const historicalAnalog = document.getElementById('historical-analog');
    if (historicalAnalog) historicalAnalog.textContent = portfolio.historicalAnalog;

    const riskLevel = document.getElementById('risk-level');
    if (riskLevel) {
      riskLevel.innerHTML = `<span class="text-lg font-bold" style="color: var(--season-primary)">${portfolio.riskLevel}</span>`;
    }
  } catch (err) {
    console.error('Failed to load playbook:', err);
    document.getElementById('portfolio-header').innerHTML =
      '<div class="text-red-500 p-4">Failed to load data. Is the server running?</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildHeader('playbook', (season, phase) => {
    if (season) applyTheme(season, phase);
  });
  buildKeyBar(document.getElementById('phase-pills'));
  loadData();
});

})();
