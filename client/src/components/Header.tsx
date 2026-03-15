import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSeason } from '../context/SeasonContext';
import { ALL_PHASES, type Season, type Phase } from '../types';

const NAV_PAGES = [
  { to: '/',          label: 'Dashboard', emoji: '📊' },
  { to: '/learn',     label: 'Learn',     emoji: '📚' },
  { to: '/playbook',  label: 'Playbook',  emoji: '💼' },
  { to: '/history',   label: 'History',   emoji: '📜' },
  { to: '/charts',    label: 'Charts',    emoji: '📈' },
  { to: '/about',     label: 'About',     emoji: 'ℹ️'  },
  { to: '/portfolio', label: 'Portfolio', emoji: '💰' },
];

export default function Header() {
  const { setOverride } = useSeason();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  function handleOverrideChange(val: string) {
    if (!val) { setOverride(null, null); return; }
    const [s, ph] = val.split('|');
    setOverride(s as Season, ph as Phase);
  }

  const overrideOptions = ALL_PHASES.map(p => (
    <option key={`${p.season}-${p.phase}`} value={`${p.season}|${p.phase}`}>
      {p.emoji} {p.label}
    </option>
  ));

  return (
    <>
      <header className="site-header text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-3" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, background: 'var(--season-primary)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, transition: 'background 0.35s ease' }}>📈</div>
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: 'white', letterSpacing: '0.01em' }}>Macro Cycle Tracker</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.3, fontWeight: 500 }}>Economic Season Identifier</div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="items-center gap-1 hidden sm:flex">
            {NAV_PAGES.map(p => (
              <NavLink key={p.to} to={p.to} end={p.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                {p.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Simulate + Hamburger */}
          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            <div className="hidden sm:flex items-center gap-2">
              <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>Simulate:</label>
              <select onChange={e => handleOverrideChange(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 500, background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.14)', outline: 'none' }}>
                <option value="">— Live Data —</option>
                {overrideOptions}
              </select>
            </div>
            <button className="hamburger-btn" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar-tray${sidebarOpen ? ' open' : ''}`} aria-label="Navigation sidebar">
        <div className="sidebar-head">
          <a href="/" onClick={e => { e.preventDefault(); navigate('/'); setSidebarOpen(false); }} className="sidebar-logo">
            <div className="sidebar-logo-icon" style={{ background: 'var(--season-primary)' }}>📈</div>
            <div>
              <div className="sidebar-logo-text">Macro Cycle Tracker</div>
              <div className="sidebar-logo-sub">Economic Season Identifier</div>
            </div>
          </a>
          <button className="sidebar-close-btn" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="sidebar-nav-section">
          <div className="sidebar-nav-eyebrow">Navigation</div>
          {NAV_PAGES.map(p => (
            <NavLink key={p.to} to={p.to} end={p.to === '/'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-link-emoji">{p.emoji}</span>
              {p.label}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-simulate">
          <label>Simulate Season</label>
          <select onChange={e => handleOverrideChange(e.target.value)}>
            <option value="">— Live Data —</option>
            {overrideOptions}
          </select>
        </div>
      </aside>
    </>
  );
}
