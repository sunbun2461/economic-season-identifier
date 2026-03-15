import { useEffect, useRef, useState, useCallback } from 'react';
import { PALETTES } from '../types';
import { useSeason } from '../context/SeasonContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Position {
  id: string;
  symbol: string | null;
  name: string;
  asset_type: string;
  mode: 'auto' | 'static';
  quantity: number | null;
  static_value: number | null;
  notes: string | null;
  price?: number | null;
  value?: number | null;
}

interface Snapshot {
  id: string;
  snapshot_date: string;
  total_value: number;
  week_change_pct: number | null;
  created_at: string;
}

const ASSET_TYPES = ['stock', 'etf', 'crypto', 'bond', 'reit', 'commodity', 'cash', 'savings', 'other'];

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const DONUT_COLORS = ['#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#eab308', '#ef4444', '#06b6d4', '#ec4899'];

function PortfolioDonut({ positions }: { positions: Position[] }) {
  const { season } = useSeason();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const palette = PALETTES[season as keyof typeof PALETTES] ?? PALETTES.spring;

  // Build segments from positions
  const segments = positions
    .filter(p => (p.value ?? 0) > 0)
    .map((p, i) => ({
      id: p.id,
      label: p.symbol ?? p.name,
      value: p.value ?? 0,
      color: i === 0 ? palette.primary : DONUT_COLORS[i % DONUT_COLORS.length],
    }));

  const total = segments.reduce((s, x) => s + x.value, 0);

  function paint(sel: string | null) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { width: w, height: h } = canvas;
    const cx = w / 2, cy = h / 2;
    const outerR = Math.min(cx, cy) - 8;
    const innerR = outerR * 0.55;
    ctx.clearRect(0, 0, w, h);

    if (segments.length === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
      ctx.fillStyle = '#e5e7eb';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.font = '13px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No positions', cx, cy);
      return;
    }

    let startAngle = -Math.PI / 2;
    segments.forEach(({ id, value, color }) => {
      const angle = (value / total) * 2 * Math.PI;
      ctx.globalAlpha = (!sel || id === sel) ? 1 : 0.25;
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
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Center label
    const centerSeg = sel ? segments.find(s => s.id === sel) : null;
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 15px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (centerSeg) {
      ctx.fillText(centerSeg.label, cx, cy - 10);
      ctx.font = '13px system-ui';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`$${centerSeg.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, cx, cy + 10);
    } else {
      ctx.fillText(`$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, cx, cy - 8);
      ctx.font = '12px system-ui';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('total', cx, cy + 10);
    }
  }

  useEffect(() => { paint(selected); }, [selected, positions, season]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const dx = mx - cx, dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const outerR = Math.min(cx, cy) - 8;
    const innerR = outerR * 0.55;
    if (dist < innerR || dist > outerR) { setSelected(null); return; }
    let angle = Math.atan2(dy, dx) - (-Math.PI / 2);
    if (angle < 0) angle += 2 * Math.PI;
    let cumAngle = 0;
    for (const seg of segments) {
      const segAngle = (seg.value / total) * 2 * Math.PI;
      if (angle <= cumAngle + segAngle) { setSelected(prev => prev === seg.id ? null : seg.id); return; }
      cumAngle += segAngle;
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        onClick={handleClick}
        className="cursor-pointer"
        title="Click a slice to highlight"
      />
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm w-full max-w-xs">
        {segments.map(seg => (
          <button
            key={seg.id}
            onClick={() => setSelected(prev => prev === seg.id ? null : seg.id)}
            className="flex items-center gap-2 text-left hover:opacity-75 transition-opacity"
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="truncate text-gray-700">{seg.label}</span>
            <span className="ml-auto text-gray-500 text-xs">{total ? ((seg.value / total) * 100).toFixed(1) : 0}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Add Position Form ────────────────────────────────────────────────────────

interface AddFormProps {
  onAdd: (pos: Omit<Position, 'id'>) => Promise<void>;
}

function AddPositionForm({ onAdd }: AddFormProps) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('stock');
  const [mode, setMode] = useState<'auto' | 'static'>('auto');
  const [quantity, setQuantity] = useState('');
  const [staticValue, setStaticValue] = useState('');
  const [notes, setNotes] = useState('');
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState<{ price: number; name: string } | null>(null);
  const [validateErr, setValidateErr] = useState('');
  const [saving, setSaving] = useState(false);

  const isCash = assetType === 'cash' || assetType === 'savings' || assetType === 'other';
  const isCrypto = assetType === 'crypto';

  async function handleValidate() {
    if (!symbol.trim()) return;
    setValidating(true);
    setValidated(null);
    setValidateErr('');
    try {
      const sym = symbol.trim().toUpperCase();
      const url = isCrypto
        ? `/api/price/crypto/${sym.toLowerCase()}`
        : `/api/price/${sym}`;
      const r = await fetch(url);
      const data = await r.json();
      if (!r.ok) throw new Error(data.message ?? data.error ?? 'Not found');
      setValidated(data);
      if (!name) setName(data.name);
    } catch (e) {
      setValidateErr(e instanceof Error ? e.message : 'Symbol not found');
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        symbol: isCash ? null : (symbol.trim().toUpperCase() || null),
        name: name.trim(),
        asset_type: assetType,
        mode: isCash ? 'static' : mode,
        quantity: mode === 'auto' && quantity ? parseFloat(quantity) : null,
        static_value: mode === 'static' && staticValue ? parseFloat(staticValue) : null,
        notes: notes.trim() || null,
        price: null,
        value: null,
      });
      setSymbol(''); setName(''); setQuantity(''); setStaticValue('');
      setNotes(''); setValidated(null); setValidateErr('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-semibold text-gray-800">Add Position</h3>

      {/* Asset Type */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Asset Type</label>
        <select
          value={assetType}
          onChange={e => { setAssetType(e.target.value); setValidated(null); setValidateErr(''); }}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
        >
          {ASSET_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Symbol + Validate */}
      {!isCash && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {isCrypto ? 'Ticker (BTC, ETH, SOL…)' : 'Symbol (AAPL, SPY…)'}
          </label>
          <div className="flex gap-2">
            <input
              value={symbol}
              onChange={e => { setSymbol(e.target.value); setValidated(null); setValidateErr(''); }}
              placeholder={isCrypto ? 'BTC' : 'AAPL'}
              className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={handleValidate}
              disabled={!symbol.trim() || validating}
              className="px-3 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              {validating ? '…' : 'Validate'}
            </button>
          </div>
          {validated && (
            <p className="text-xs text-green-600 mt-1">
              ✓ {validated.name} — ${validated.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          )}
          {validateErr && <p className="text-xs text-red-500 mt-1">✗ {validateErr}</p>}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Name / Label</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={isCash ? 'Savings Account' : 'Apple Inc.'}
          required
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
        />
      </div>

      {/* Mode + Quantity/Value */}
      {!isCash && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mode</label>
          <div className="flex gap-3 text-sm mb-2">
            {(['auto', 'static'] as const).map(m => (
              <label key={m} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={mode === m} onChange={() => setMode(m)} />
                <span className="capitalize">{m === 'auto' ? 'Auto (qty × price)' : 'Static (manual $)'}</span>
              </label>
            ))}
          </div>
          {mode === 'auto' ? (
            <input
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              type="number" step="any" min="0" placeholder="Quantity (shares/coins)"
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
            />
          ) : (
            <input
              value={staticValue}
              onChange={e => setStaticValue(e.target.value)}
              type="number" step="any" min="0" placeholder="Total value in USD"
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
            />
          )}
        </div>
      )}

      {isCash && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Value (USD)</label>
          <input
            value={staticValue}
            onChange={e => setStaticValue(e.target.value)}
            type="number" step="any" min="0" placeholder="5000"
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Roth IRA, 401k"
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full py-2 rounded text-sm font-medium text-white disabled:opacity-50"
        style={{ background: 'var(--season-primary)' }}
      >
        {saving ? 'Adding…' : '+ Add to Portfolio'}
      </button>
    </form>
  );
}

// ─── Positions Table ──────────────────────────────────────────────────────────

function PositionsTable({ positions, onDelete }: { positions: Position[]; onDelete: (id: string) => void }) {
  const total = positions.reduce((s, p) => s + (p.value ?? 0), 0);

  if (positions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No positions yet — add one above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-xs">
            <th className="text-left py-2 pr-3 font-medium">Symbol</th>
            <th className="text-left py-2 pr-3 font-medium">Name</th>
            <th className="text-left py-2 pr-3 font-medium">Type</th>
            <th className="text-right py-2 pr-3 font-medium">Qty</th>
            <th className="text-right py-2 pr-3 font-medium">Price</th>
            <th className="text-right py-2 pr-3 font-medium">Value</th>
            <th className="text-right py-2 font-medium">%</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {positions.map(p => {
            const pct = total > 0 && p.value ? ((p.value / total) * 100).toFixed(1) : '—';
            return (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-2 pr-3 font-mono font-semibold text-gray-700">{p.symbol ?? '—'}</td>
                <td className="py-2 pr-3 text-gray-700 max-w-[140px] truncate">{p.name}</td>
                <td className="py-2 pr-3">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 capitalize">{p.asset_type}</span>
                </td>
                <td className="py-2 pr-3 text-right text-gray-600">{p.quantity ?? '—'}</td>
                <td className="py-2 pr-3 text-right text-gray-600">
                  {p.price != null ? `$${p.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
                </td>
                <td className="py-2 pr-3 text-right font-medium text-gray-800">
                  {p.value != null ? `$${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
                </td>
                <td className="py-2 pr-3 text-right text-gray-500 text-xs">{pct}%</td>
                <td className="py-2">
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    title="Delete position"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200">
            <td colSpan={5} className="py-2 text-xs text-gray-500 font-medium">Total</td>
            <td className="py-2 text-right font-bold text-gray-900">
              ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Weekly Reports ───────────────────────────────────────────────────────────

function WeeklyReports({ snapshots }: { snapshots: Snapshot[] }) {
  if (snapshots.length === 0) return null;
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-3">Weekly Reports</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs">
              <th className="text-left py-2 pr-4 font-medium">Week of</th>
              <th className="text-right py-2 pr-4 font-medium">Total Value</th>
              <th className="text-right py-2 font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map(s => {
              const chg = s.week_change_pct;
              return (
                <tr key={s.id} className="border-b border-gray-50">
                  <td className="py-2 pr-4 text-gray-700">{new Date(s.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="py-2 pr-4 text-right font-medium">${s.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className={`py-2 text-right font-medium ${chg == null ? 'text-gray-400' : chg >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {chg == null ? '—' : `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Portfolio Page ──────────────────────────────────────────────────────

export default function Portfolio() {
  const { season, data } = useSeason();
  const confidence = data?.season.confidence ?? null;
  const palette = PALETTES[season as keyof typeof PALETTES] ?? PALETTES.spring;

  const [positions, setPositions] = useState<Position[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapshotting, setSnapshotting] = useState(false);
  const [trackingDate, setTrackingDate] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const total = positions.reduce((s, p) => s + (p.value ?? 0), 0);
  const weekChange = snapshots.length >= 2
    ? ((total - snapshots[1].total_value) / snapshots[1].total_value) * 100
    : null;

  const loadPositions = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/portfolio/positions');
      if (!r.ok) throw new Error('Failed to load positions');
      const data = await r.json();
      setPositions(data.positions ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error loading positions');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSnapshots = useCallback(async () => {
    try {
      const r = await fetch('/api/portfolio/snapshots');
      if (!r.ok) return;
      const data = await r.json();
      const snaps: Snapshot[] = data.snapshots ?? [];
      setSnapshots(snaps);
      if (snaps.length > 0) setTrackingDate(snaps[snaps.length - 1].snapshot_date);
    } catch {
      // Supabase may not be configured — silently ignore
    }
  }, []);

  useEffect(() => {
    loadPositions();
    loadSnapshots();
  }, [loadPositions, loadSnapshots]);

  async function handleAdd(newPos: Omit<Position, 'id'>) {
    const r = await fetch('/api/portfolio/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPos),
    });
    if (!r.ok) {
      const d = await r.json();
      throw new Error(d.error ?? 'Failed to add position');
    }
    await loadPositions();
  }

  async function handleDelete(id: string) {
    const r = await fetch(`/api/portfolio/positions/${id}`, { method: 'DELETE' });
    if (!r.ok) return;
    setPositions(prev => prev.filter(p => p.id !== id));
  }

  async function handleStartTracking() {
    setSnapshotting(true);
    try {
      const positionsJson = positions.map(p => ({
        id: p.id, symbol: p.symbol, name: p.name, value: p.value, price: p.price,
      }));
      const prev = snapshots[0];
      const wkChg = prev ? ((total - prev.total_value) / prev.total_value) * 100 : null;
      const r = await fetch('/api/portfolio/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_value: total, positions_json: positionsJson, week_change_pct: wkChg }),
      });
      if (!r.ok) throw new Error('Snapshot failed');
      await loadSnapshots();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Snapshot failed');
    } finally {
      setSnapshotting(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track your holdings alongside the <span style={{ color: palette.primary }} className="font-medium capitalize">{season}</span> season strategy
            <span className="ml-2 text-gray-400">({confidence}% confidence)</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          {total > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              {weekChange != null && (
                <div className={`text-sm font-medium ${weekChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {weekChange >= 0 ? '+' : ''}{weekChange.toFixed(2)}% this week
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleStartTracking}
            disabled={snapshotting || positions.length === 0}
            className="px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50"
            style={{ background: palette.primary }}
          >
            {snapshotting ? 'Saving…' : trackingDate ? `Tracked since ${new Date(trackingDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Start Tracking Now'}
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 px-4 py-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
          {err}
          <button onClick={() => setErr('')} className="ml-3 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Main grid: Donut + Add Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 p-5 flex flex-col items-center">
          {loading ? (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
          ) : (
            <PortfolioDonut positions={positions} />
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <AddPositionForm onAdd={handleAdd} />
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Holdings</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading positions…</div>
        ) : (
          <PositionsTable positions={positions} onDelete={handleDelete} />
        )}
      </div>

      {/* Weekly Reports */}
      {snapshots.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <WeeklyReports snapshots={snapshots} />
        </div>
      )}

      {/* Supabase setup hint */}
      {!loading && positions.length === 0 && (
        <div className="mt-4 p-4 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
          <strong>Note:</strong> Positions are stored in Supabase. Make sure <code className="bg-amber-100 px-1 rounded">SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> are set in your <code className="bg-amber-100 px-1 rounded">.env</code> file,
          and that the <code className="bg-amber-100 px-1 rounded">positions</code> and <code className="bg-amber-100 px-1 rounded">portfolio_snapshots</code> tables exist.
        </div>
      )}
    </main>
  );
}
