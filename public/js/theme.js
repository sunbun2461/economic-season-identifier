// Shared season theming — included on every page

const PALETTES = {
  spring: { primary: '#10b981', accent: '#34d399', dark: '#059669', bg: '#ecfdf5', bgDark: '#d1fae5', emoji: '🌱', label: 'Spring' },
  summer: { primary: '#eab308', accent: '#fde047', dark: '#ca8a04', bg: '#fefce8', bgDark: '#fef9c3', emoji: '☀️', label: 'Summer' },
  autumn: { primary: '#f97316', accent: '#fb923c', dark: '#ea580c', bg: '#fff7ed', bgDark: '#ffedd5', emoji: '🍂', label: 'Autumn' },
  winter: { primary: '#3b82f6', accent: '#60a5fa', dark: '#2563eb', bg: '#eff6ff', bgDark: '#dbeafe', emoji: '❄️', label: 'Winter' },
};

const ALL_PHASES = [
  { season: 'spring', phase: 'early', label: 'Early Spring', emoji: '🌱' },
  { season: 'spring', phase: 'late', label: 'Late Spring', emoji: '🌱' },
  { season: 'summer', phase: 'early', label: 'Early Summer', emoji: '☀️' },
  { season: 'summer', phase: 'late', label: 'Late Summer', emoji: '☀️' },
  { season: 'autumn', phase: 'early', label: 'Early Autumn', emoji: '🍂' },
  { season: 'autumn', phase: 'late', label: 'Late Autumn', emoji: '🍂' },
  { season: 'winter', phase: 'early', label: 'Early Winter', emoji: '❄️' },
  { season: 'winter', phase: 'late', label: 'Late Winter', emoji: '❄️' },
];

let currentSeason = 'spring';
let currentPhase = 'early';

function applyTheme(season, phase) {
  const p = PALETTES[season] || PALETTES.spring;
  const root = document.documentElement;
  root.style.setProperty('--season-primary', p.primary);
  root.style.setProperty('--season-accent', p.accent);
  root.style.setProperty('--season-dark', p.dark);
  root.style.setProperty('--season-bg', p.bg);
  root.style.setProperty('--season-bg-dark', p.bgDark);
  currentSeason = season;
  currentPhase = phase || 'early';
  highlightKeyBar(season, phase);
  // Update header logo icon background
  const logoIcon = document.querySelector('#site-header .flex a > div');
  if (logoIcon) logoIcon.style.background = p.primary;
  // Update sidebar logo icon background
  const sidebarLogoIcon = document.querySelector('.sidebar-logo-icon');
  if (sidebarLogoIcon) sidebarLogoIcon.style.background = p.primary;
  // Refresh sidebar active link colors (CSS vars updated above, re-paint bg)
  document.querySelectorAll('.sidebar-nav-link.active').forEach(a => {
    a.style.color = p.primary;
    a.style.borderLeftColor = p.primary;
  });
}

function highlightKeyBar(season, phase) {
  const pills = document.querySelectorAll('.phase-pill');
  pills.forEach(pill => {
    pill.classList.remove('active');
    if (pill.dataset.season === season && pill.dataset.phase === phase) {
      pill.classList.add('active');
    }
  });
}

function buildKeyBar(container, onPillClick) {
  container.innerHTML = '';
  ALL_PHASES.forEach(({ season, phase, label, emoji }) => {
    const pill = document.createElement('div');
    pill.className = 'phase-pill';
    pill.dataset.season = season;
    pill.dataset.phase = phase;
    pill.innerHTML = `<span>${emoji} ${label}</span>`;
    pill.addEventListener('click', () => {
      if (onPillClick) onPillClick(season, phase);
    });
    container.appendChild(pill);
  });
}

const NAV_PAGES = [
  { href: '/',             label: 'Dashboard', id: 'dashboard', emoji: '📊' },
  { href: '/learn.html',   label: 'Learn',     id: 'learn',     emoji: '📚' },
  { href: '/playbook.html',label: 'Playbook',  id: 'playbook',  emoji: '💼' },
  { href: '/history.html', label: 'History',   id: 'history',   emoji: '📜' },
  { href: '/charts.html',  label: 'Charts',    id: 'charts',    emoji: '📈' },
  { href: '/about.html',   label: 'About',     id: 'about',     emoji: 'ℹ️' },
];

function buildNav(activePage) {
  return NAV_PAGES.map(p => {
    const isActive = p.id === activePage ? ' active' : '';
    return `<a href="${p.href}" class="nav-link${isActive}">${p.label}</a>`;
  }).join('');
}

function buildHeader(activePage, onOverride) {
  const header = document.querySelector('#site-header');
  if (!header) return;

  header.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <a href="/" class="flex items-center gap-3" style="text-decoration:none;flex-shrink:0">
        <div style="width:34px;height:34px;background:var(--season-primary);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;transition:background 0.35s ease;">📈</div>
        <div>
          <div style="font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;line-height:1.2;color:white;letter-spacing:0.01em">Macro Cycle Tracker</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.3;font-weight:500">Economic Season Identifier</div>
        </div>
      </a>
      <nav class="items-center gap-1 hidden sm:flex">
        ${buildNav(activePage)}
      </nav>
      <div class="flex items-center gap-2" style="flex-shrink:0">
        <div class="hidden sm:flex items-center gap-2">
          <label style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.45);white-space:nowrap">Simulate:</label>
          <select id="phase-override" style="font-size:12px;padding:5px 8px;border-radius:4px;cursor:pointer;font-weight:500;background:rgba(255,255,255,0.08);color:white;border:1px solid rgba(255,255,255,0.14);outline:none;">
            <option value="" style="background:#1e293b;color:white">— Live Data —</option>
            ${ALL_PHASES.map(p => `<option value="${p.season}|${p.phase}" style="background:#1e293b;color:white">${p.emoji} ${p.label}</option>`).join('')}
          </select>
        </div>
        <button id="hamburger-btn" class="hamburger-btn" aria-label="Open navigation menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Build sidebar overlay + tray and inject into body
  // Remove any existing sidebar elements first (in case buildHeader is called multiple times)
  document.getElementById('sidebar-overlay')?.remove();
  document.getElementById('sidebar-tray')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  const tray = document.createElement('aside');
  tray.id = 'sidebar-tray';
  tray.className = 'sidebar-tray';
  tray.setAttribute('aria-label', 'Navigation sidebar');
  tray.innerHTML = `
    <div class="sidebar-head">
      <a href="/" class="sidebar-logo" style="text-decoration:none">
        <div class="sidebar-logo-icon">📈</div>
        <div>
          <div class="sidebar-logo-text">Macro Cycle Tracker</div>
          <div class="sidebar-logo-sub">Economic Season Identifier</div>
        </div>
      </a>
      <button id="sidebar-close-btn" class="sidebar-close-btn" aria-label="Close menu">✕</button>
    </div>
    <div class="sidebar-nav-section">
      <div class="sidebar-nav-eyebrow">Navigation</div>
      ${NAV_PAGES.map(p => {
        const isActive = p.id === activePage ? ' active' : '';
        return `<a href="${p.href}" class="sidebar-nav-link${isActive}">
          <span class="sidebar-link-emoji">${p.emoji}</span>
          ${p.label}
        </a>`;
      }).join('')}
    </div>
    <div class="sidebar-simulate">
      <label>Simulate Season</label>
      <select id="sidebar-phase-override">
        <option value="">— Live Data —</option>
        ${ALL_PHASES.map(p => `<option value="${p.season}|${p.phase}">${p.emoji} ${p.label}</option>`).join('')}
      </select>
    </div>
  `;
  document.body.appendChild(tray);

  // Wire hamburger open/close
  function openSidebar() {
    overlay.classList.add('open');
    tray.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    overlay.classList.remove('open');
    tray.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('hamburger-btn')?.addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.getElementById('sidebar-close-btn')?.addEventListener('click', closeSidebar);

  // Close sidebar when a nav link is clicked (so navigation proceeds)
  tray.querySelectorAll('.sidebar-nav-link').forEach(a => {
    a.addEventListener('click', closeSidebar);
  });

  // Keyboard: Escape closes sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Wire the desktop phase-override select
  const overrideSelect = document.getElementById('phase-override');
  overrideSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    const sidebarSelect = document.getElementById('sidebar-phase-override');
    if (sidebarSelect) sidebarSelect.value = val;
    if (!val) {
      if (onOverride) onOverride(null, null);
      return;
    }
    const [season, phase] = val.split('|');
    applyTheme(season, phase);
    if (onOverride) onOverride(season, phase);
  });

  // Wire the sidebar phase-override select (synced with desktop)
  const sidebarOverrideSelect = document.getElementById('sidebar-phase-override');
  sidebarOverrideSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    const desktopSelect = document.getElementById('phase-override');
    if (desktopSelect) desktopSelect.value = val;
    if (!val) {
      if (onOverride) onOverride(null, null);
      return;
    }
    const [season, phase] = val.split('|');
    applyTheme(season, phase);
    if (onOverride) onOverride(season, phase);
  });

  // Expose open/close for external use
  window._sidebarOpen = openSidebar;
  window._sidebarClose = closeSidebar;
}

function getPalette(season) {
  return PALETTES[season] || PALETTES.spring;
}

function trendArrow(trend) {
  if (trend === 'up') return '<span class="trend-up">↑</span>';
  if (trend === 'down') return '<span class="trend-down">↓</span>';
  return '<span class="trend-flat">→</span>';
}

function fmt(val, suffix = '%', decimals = 2) {
  if (val === null || val === undefined) return '<span class="text-gray-400">N/A</span>';
  return val.toFixed(decimals) + suffix;
}

function fmtT(val) {
  if (val === null || val === undefined) return 'N/A';
  return '$' + (val / 1_000_000).toFixed(2) + 'T';
}

function setupAccordion(container) {
  const headers = container.querySelectorAll('.accordion-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('.accordion-icon');
      const isOpen = content.classList.contains('open');
      content.classList.toggle('open', !isOpen);
      header.classList.toggle('open', !isOpen);
    });
  });
}

// Export for use in page scripts
window.MacroTheme = {
  applyTheme,
  highlightKeyBar,
  buildKeyBar,
  buildHeader,
  getPalette,
  trendArrow,
  fmt,
  fmtT,
  setupAccordion,
  PALETTES,
  ALL_PHASES,
  NAV_PAGES,
  openSidebar: () => window._sidebarOpen?.(),
  closeSidebar: () => window._sidebarClose?.(),
};
