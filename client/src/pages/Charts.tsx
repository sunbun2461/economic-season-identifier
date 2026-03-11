import { useState, useEffect } from 'react';
import { type ChartCategory } from '../types';

export default function Charts() {
  const [categories, setCategories] = useState<ChartCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/charts')
      .then(r => r.json())
      .then(d => setCategories(d.categories))
      .catch(() => setError(true));
  }, []);

  const filtered = activeFilter ? categories.filter(c => c.id === activeFilter) : categories;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <p className="section-overline mb-1">Live Charts</p>
        <h1 className="playfair text-2xl font-bold text-slate-800 mb-4">TradingView Chart Library</h1>

        {/* Filters */}
        <div id="category-filters" className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('')}
            className={`filter-btn text-xs px-3 py-1.5 rounded-full border font-medium ${
              activeFilter === '' ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
            style={activeFilter === '' ? { backgroundColor: 'var(--season-primary)', borderColor: 'var(--season-primary)' } : {}}
          >
            All Charts
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`filter-btn text-xs px-3 py-1.5 rounded-full border font-medium ${
                activeFilter === cat.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={activeFilter === cat.id ? { backgroundColor: 'var(--season-primary)', borderColor: 'var(--season-primary)' } : {}}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-red-500 p-4">Failed to load chart data.</div>}

      <div id="charts-container" className="space-y-6">
        {filtered.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>{cat.emoji}</span> {cat.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cat.charts.map(chart => (
                <a key={chart.symbol} href={chart.url} target="_blank" rel="noopener noreferrer" className="chart-card">
                  <div className="font-semibold text-gray-800 text-sm mb-1">{chart.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{chart.description}</div>
                  <div className="text-xs font-mono text-gray-400">{chart.symbol}</div>
                  <div className="mt-2 text-xs font-medium" style={{ color: 'var(--season-primary)' }}>Open in TradingView →</div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
