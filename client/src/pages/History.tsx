import { useState, useEffect } from 'react';
import { type ApiHistoryResponse, type RateDecision } from '../types';

const SEASON_EMOJIS: Record<string, string> = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };

function getDecade(date: string) {
  const y = parseInt(date.slice(0, 4));
  if (y < 2000) return '1990s';
  if (y < 2010) return '2000s';
  if (y < 2020) return '2010s';
  return '2020s';
}

function formatRate(rate: number | null) {
  if (rate === null || rate === undefined) return '—';
  return rate.toFixed(2) + '%';
}

function getRowClass(direction: string, isEmergency?: boolean) {
  const base = direction === 'cut' ? 'tr-cut' : direction === 'hike' ? 'tr-hike' : 'tr-hold';
  return isEmergency ? `${base} tr-emergency` : base;
}

export default function History() {
  const [allDecisions, setAllDecisions] = useState<RateDecision[]>([]);
  const [stats, setStats] = useState({ totalCuts: 0, totalHikes: 0, totalHolds: 0 });
  const [filters, setFilters] = useState({ decade: '', chair: '', direction: '', season: '' });
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then((d: ApiHistoryResponse) => {
        setAllDecisions(d.decisions);
        setStats(d.stats);
      })
      .catch(() => setError(true));
  }, []);

  function setFilter(key: string, val: string) {
    setFilters(prev => ({ ...prev, [key]: val }));
  }

  let filtered = [...allDecisions].reverse();
  if (filters.decade) filtered = filtered.filter(d => getDecade(d.date) === filters.decade);
  if (filters.chair) filtered = filtered.filter(d => d.chair === filters.chair);
  if (filters.direction) filtered = filtered.filter(d => d.direction === filters.direction);
  if (filters.season) filtered = filtered.filter(d => d.season === filters.season);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <p className="section-overline mb-1">Fed Rate Decisions</p>
        <h1 className="playfair text-2xl font-bold text-slate-800">35 Years of Fed History</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div id="stat-cuts" className="text-2xl font-bold text-green-700">{stats.totalCuts}</div>
          <div className="text-xs font-semibold text-green-600 mt-1 uppercase tracking-wide">Rate Cuts</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div id="stat-hikes" className="text-2xl font-bold text-red-700">{stats.totalHikes}</div>
          <div className="text-xs font-semibold text-red-600 mt-1 uppercase tracking-wide">Rate Hikes</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <div id="stat-holds" className="text-2xl font-bold text-slate-700">{stats.totalHolds}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Holds</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Decade</label>
            <select value={filters.decade} onChange={e => setFilter('decade', e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white">
              <option value="">All</option>
              {['1990s','2000s','2010s','2020s'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Chair</label>
            <select value={filters.chair} onChange={e => setFilter('chair', e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white">
              <option value="">All</option>
              {['Greenspan','Bernanke','Yellen','Powell'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Direction</label>
            <select value={filters.direction} onChange={e => setFilter('direction', e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white">
              <option value="">All</option>
              <option value="cut">Cut</option>
              <option value="hike">Hike</option>
              <option value="hold">Hold</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Season</label>
            <select value={filters.season} onChange={e => setFilter('season', e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white">
              <option value="">All</option>
              {['spring','summer','autumn','winter'].map(s => <option key={s} value={s}>{SEASON_EMOJIS[s]} {s}</option>)}
            </select>
          </div>
          <button onClick={() => setFilters({ decade: '', chair: '', direction: '', season: '' })} className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors">
            Clear Filters
          </button>
          <span id="filter-count" className="text-xs text-gray-400 ml-1">{filtered.length} decision{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Chair</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Before</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">After</th>
                <th className="py-3 px-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Decision</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Season</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
              </tr>
            </thead>
            <tbody id="history-tbody">
              {error && (
                <tr><td colSpan={7} className="py-8 text-center text-red-400">Failed to load data. Is the server running?</td></tr>
              )}
              {!error && filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No results match your filters.</td></tr>
              )}
              {filtered.map((d, i) => {
                const rowClass = getRowClass(d.direction, d.isEmergency);
                const badge = d.direction === 'cut'
                  ? <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-200 text-green-800">↓ CUT{d.bps ? ` ${d.bps}bp` : ''}</span>
                  : d.direction === 'hike'
                  ? <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-200 text-red-800">↑ HIKE{d.bps ? ` ${d.bps}bp` : ''}</span>
                  : <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700">→ HOLD</span>;

                return (
                  <tr key={i} className={`${rowClass} hover:opacity-90 border-b border-gray-100`}>
                    <td className="py-2 px-3 font-mono text-xs">
                      {d.date}
                      {d.isEmergency && <span className="text-xs font-bold text-amber-600 ml-1">⚡ EMERGENCY</span>}
                    </td>
                    <td className="py-2 px-3 text-gray-700">{d.chair}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatRate(d.rateBefore)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatRate(d.rateAfter)}</td>
                    <td className="py-2 px-3 text-center">{badge}</td>
                    <td className="py-2 px-3">
                      {d.season ? <span className="text-xs">{SEASON_EMOJIS[d.season] ?? ''} {d.season} {d.phase ?? ''}</span> : '—'}
                    </td>
                    <td className="py-2 px-3 text-gray-600 text-xs max-w-xs">{d.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
