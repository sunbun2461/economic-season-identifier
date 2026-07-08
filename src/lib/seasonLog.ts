import db from './db.js';
import type { SeasonResult, MacroSnapshot } from '../types.js';

export function logSeasonToDb(season: SeasonResult, snapshot: MacroSnapshot): void {
  try {
    db.prepare(`
      INSERT INTO season_log (season, phase, confidence, scores, fed_rate, yield_curve)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      season.season,
      season.phase,
      season.confidence,
      JSON.stringify(season.scores),
      snapshot.rates?.fedFunds?.latest ?? null,
      snapshot.rates?.t10y2y?.latest ?? null,
    );
  } catch {
    // never crash the main request
  }
}
