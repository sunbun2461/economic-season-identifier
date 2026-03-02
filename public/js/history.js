;(function() {
const { applyTheme, buildHeader, buildKeyBar } = window.MacroTheme;

let allDecisions = [];
let activeFilters = { decade: '', chair: '', direction: '', season: '' };

const SEASON_EMOJIS = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };

function getDecade(date) {
  const year = parseInt(date.slice(0, 4));
  if (year < 2000) return '1990s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function getRowClass(direction, isEmergency) {
  const base = direction === 'cut' ? 'tr-cut' : direction === 'hike' ? 'tr-hike' : 'tr-hold';
  return isEmergency ? base + ' tr-emergency' : base;
}

function formatRate(rate) {
  if (rate === null || rate === undefined) return '—';
  return rate.toFixed(2) + '%';
}

function renderTable(decisions) {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  if (decisions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-400">No results match your filters.</td></tr>';
    return;
  }

  tbody.innerHTML = decisions.map(d => {
    const rowClass = getRowClass(d.direction, d.isEmergency);
    const directionBadge = d.direction === 'cut'
      ? `<span class="px-2 py-0.5 rounded text-xs font-bold bg-green-200 text-green-800">↓ CUT${d.bps ? ` ${d.bps}bp` : ''}</span>`
      : d.direction === 'hike'
      ? `<span class="px-2 py-0.5 rounded text-xs font-bold bg-red-200 text-red-800">↑ HIKE${d.bps ? ` ${d.bps}bp` : ''}</span>`
      : `<span class="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700">→ HOLD</span>`;

    const seasonLabel = d.season
      ? `<span class="text-xs">${SEASON_EMOJIS[d.season] ?? ''} ${d.season} ${d.phase ?? ''}</span>`
      : '—';

    const emergency = d.isEmergency ? ' <span class="text-xs font-bold text-amber-600">⚡ EMERGENCY</span>' : '';

    return `<tr class="${rowClass} hover:opacity-90 border-b border-gray-100">
      <td class="py-2 px-3 font-mono text-xs">${d.date}${emergency}</td>
      <td class="py-2 px-3 text-gray-700">${d.chair}</td>
      <td class="py-2 px-3 text-right font-mono">${formatRate(d.rateBefore)}</td>
      <td class="py-2 px-3 text-right font-mono font-semibold">${formatRate(d.rateAfter)}</td>
      <td class="py-2 px-3 text-center">${directionBadge}</td>
      <td class="py-2 px-3">${seasonLabel}</td>
      <td class="py-2 px-3 text-gray-600 text-xs max-w-xs">${d.note}</td>
    </tr>`;
  }).join('');
}

function applyFilters() {
  let filtered = allDecisions.slice().reverse(); // newest first

  if (activeFilters.decade) {
    filtered = filtered.filter(d => getDecade(d.date) === activeFilters.decade);
  }
  if (activeFilters.chair) {
    filtered = filtered.filter(d => d.chair === activeFilters.chair);
  }
  if (activeFilters.direction) {
    filtered = filtered.filter(d => d.direction === activeFilters.direction);
  }
  if (activeFilters.season) {
    filtered = filtered.filter(d => d.season === activeFilters.season);
  }

  renderTable(filtered);

  const count = document.getElementById('filter-count');
  if (count) count.textContent = `${filtered.length} decision${filtered.length !== 1 ? 's' : ''}`;
}

async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    allDecisions = data.decisions;

    // Update stats
    document.getElementById('stat-cuts').textContent = data.stats.totalCuts;
    document.getElementById('stat-hikes').textContent = data.stats.totalHikes;
    document.getElementById('stat-holds').textContent = data.stats.totalHolds;

    applyFilters();
  } catch (err) {
    console.error('Failed to load history:', err);
    const tbody = document.getElementById('history-tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-red-400">Failed to load data. Is the server running?</td></tr>';
    }
  }
}

// Also load season data for theming
async function loadTheme() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    applyTheme(data.season.season, data.season.phase);
  } catch {
    // Default spring theme
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildHeader('history');
  buildKeyBar(document.getElementById('phase-pills'));

  // Set up filters
  ['decade', 'chair', 'direction', 'season'].forEach(key => {
    document.getElementById(`filter-${key}`)?.addEventListener('change', (e) => {
      activeFilters[key] = e.target.value;
      applyFilters();
    });
  });

  document.getElementById('filter-clear')?.addEventListener('click', () => {
    activeFilters = { decade: '', chair: '', direction: '', season: '' };
    ['decade', 'chair', 'direction', 'season'].forEach(key => {
      const el = document.getElementById(`filter-${key}`);
      if (el) el.value = '';
    });
    applyFilters();
  });

  loadTheme();
  loadHistory();
});

})();
