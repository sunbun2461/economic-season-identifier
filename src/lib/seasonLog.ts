import { supabase } from './supabaseClient.js';
import type { SeasonResult, MacroSnapshot } from '../types.js';

/**
 * Fire-and-forget: log a season classification result to Supabase.
 * Silently no-ops if Supabase is not configured.
 * Never throws — always catch at call site.
 */
export async function logSeasonToSupabase(
  season: SeasonResult,
  snapshot: MacroSnapshot,
): Promise<void> {
  if (!supabase) return;

  await supabase.from('season_log').insert({
    season: season.season,
    phase: season.phase,
    confidence: season.confidence,
    scores: {
      spring: season.scores.spring,
      summer: season.scores.summer,
      autumn: season.scores.autumn,
      winter: season.scores.winter,
    },
    fed_rate: snapshot.fedFunds?.current ?? null,
    yield_curve: snapshot.t10y2y?.current ?? null,
  });
}
