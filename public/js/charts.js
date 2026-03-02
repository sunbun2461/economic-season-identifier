;(function() {
const { applyTheme, buildHeader, buildKeyBar } = window.MacroTheme;

let allCategories = [];
let activeFilter = '';

function renderCharts(categories) {
  const container = document.getElementById('charts-container');
  if (!container) return;

  const filtered = activeFilter
    ? categories.filter(c => c.id === activeFilter)
    : categories;

  container.innerHTML = filtered.map(cat => `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>${cat.emoji}</span> ${cat.label}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        ${cat.charts.map(chart => `
          <a href="${chart.url}" target="_blank" rel="noopener" class="chart-card">
            <div class="font-semibold text-gray-800 text-sm mb-1">${chart.name}</div>
            <div class="text-xs text-gray-500 mb-2">${chart.description}</div>
            <div class="text-xs font-mono text-gray-400">${chart.symbol}</div>
            <div class="mt-2 text-xs font-medium" style="color: var(--season-primary)">Open in TradingView →</div>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function buildCategoryFilters(categories) {
  const container = document.getElementById('category-filters');
  if (!container) return;

  // Add category buttons
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn text-xs px-3 py-1.5 rounded-full border font-medium transition-all bg-white text-gray-600';
    btn.dataset.cat = cat.id;
    btn.textContent = `${cat.emoji} ${cat.label}`;
    btn.addEventListener('click', () => {
      activeFilter = cat.id;
      updateFilterBtns();
      renderCharts(allCategories);
    });
    container.appendChild(btn);
  });

  // Update all button click
  const allBtn = container.querySelector('[data-cat=""]');
  allBtn?.addEventListener('click', () => {
    activeFilter = '';
    updateFilterBtns();
    renderCharts(allCategories);
  });
}

function updateFilterBtns() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isActive = btn.dataset.cat === activeFilter;
    btn.className = `filter-btn text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
      isActive
        ? 'text-white border-transparent'
        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
    }`;
    if (isActive) {
      btn.style.backgroundColor = 'var(--season-primary)';
      btn.style.borderColor = 'var(--season-primary)';
    } else {
      btn.style.backgroundColor = '';
      btn.style.borderColor = '';
    }
  });
}

async function loadCharts() {
  try {
    const res = await fetch('/api/charts');
    const data = await res.json();
    allCategories = data.categories;
    buildCategoryFilters(allCategories);
    renderCharts(allCategories);
  } catch (err) {
    console.error('Failed to load charts:', err);
    document.getElementById('charts-container').innerHTML =
      '<div class="text-red-500 p-4">Failed to load chart data.</div>';
  }
}

async function loadTheme() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    applyTheme(data.season.season, data.season.phase);
  } catch {
    // default theme
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildHeader('charts');
  buildKeyBar(document.getElementById('phase-pills'));
  loadTheme();
  loadCharts();
});

})();
