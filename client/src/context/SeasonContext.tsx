import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Season, type Phase, type ApiDataResponse, PALETTES } from '../types';

interface SeasonContextValue {
  data: ApiDataResponse | null;
  loading: boolean;
  stale: boolean;
  season: Season;
  phase: Phase;
  overrideSeason: Season | null;
  overridePhase: Phase | null;
  setOverride: (season: Season | null, phase: Phase | null) => void;
  refresh: () => void;
}

const SeasonContext = createContext<SeasonContextValue | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ApiDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [overrideSeason, setOverrideSeason] = useState<Season | null>(null);
  const [overridePhase, setOverridePhase] = useState<Phase | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      const json: ApiDataResponse = await res.json();
      setData(json);
    } catch {
      // use last data if available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const season: Season = overrideSeason ?? data?.season.season ?? 'spring';
  const phase: Phase = overridePhase ?? data?.season.phase ?? 'early';
  const stale = data?.stale ?? false;

  // Apply CSS custom properties whenever season changes
  useEffect(() => {
    const p = PALETTES[season];
    const root = document.documentElement;
    root.style.setProperty('--season-primary', p.primary);
    root.style.setProperty('--season-accent', p.accent);
    root.style.setProperty('--season-dark', p.dark);
    root.style.setProperty('--season-bg', p.bg);
    root.style.setProperty('--season-bg-dark', p.bgDark);
  }, [season]);

  function setOverride(s: Season | null, ph: Phase | null) {
    setOverrideSeason(s);
    setOverridePhase(ph);
  }

  return (
    <SeasonContext.Provider value={{ data, loading, stale, season, phase, overrideSeason, overridePhase, setOverride, refresh: fetchData }}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error('useSeason must be used within SeasonProvider');
  return ctx;
}
