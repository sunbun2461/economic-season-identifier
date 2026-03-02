import type { SeasonResult, SeasonPrediction, Season, Phase } from '../types.js';

const NEXT_SEASON: Record<Season, Season> = {
  spring: 'summer',
  summer: 'autumn',
  autumn: 'winter',
  winter: 'spring',
};

const PREV_SEASON: Record<Season, Season> = {
  spring: 'winter',
  summer: 'spring',
  autumn: 'summer',
  winter: 'autumn',
};

const SEASON_DURATION_MONTHS: Record<Season, { min: number; max: number; avg: number }> = {
  spring: { min: 12, max: 36, avg: 24 },
  summer: { min: 12, max: 48, avg: 24 },
  autumn: { min: 9, max: 24, avg: 15 },
  winter: { min: 6, max: 24, avg: 12 },
};

const WATCH_FOR: Record<Season, Record<Phase, string[]>> = {
  spring: {
    early: [
      'Fed pause signal — first indication cuts are done',
      'NFP recovering above 150K/month consistently',
      'Yield curve turning positive (10Y > 2Y)',
      'HY spreads narrowing below 4%',
      'ISM Manufacturing breaking above 50',
    ],
    late: [
      'Fed signaling summer hold — language becomes neutral',
      'CPI/PCE creeping above 2.5%',
      'Unemployment reaching cyclical lows (< 4%)',
      'Curve steepness peaking and beginning to flatten',
      'Leading indicators turning down',
    ],
  },
  summer: {
    early: [
      'First Fed hike signal — "meeting-by-meeting" language',
      'CPI print above 3% for 2+ consecutive months',
      'Unemployment below 3.8% with wage growth accelerating',
      'HY spreads beginning to widen',
      'Yield curve flattening rapidly',
    ],
    late: [
      'First rate hike confirmed',
      'Curve inverting (2Y > 10Y)',
      'Leading indicators rolling over',
      'Consumer credit stress beginning',
      'Housing market slowing',
    ],
  },
  autumn: {
    early: [
      'Unemployment rising above 4.5%',
      'NFP consistently below 100K or turning negative',
      'GDP slowing to near zero',
      'HY spread blowout above 600bps',
      'Fed pivoting language: "sufficiently restrictive" → "data dependent"',
    ],
    late: [
      'Fed pivot confirmed — first cut',
      'Recession officially declared',
      'NFP turning strongly negative',
      'Unemployment rising sharply',
      'Credit markets seizing',
    ],
  },
  winter: {
    early: [
      'Fed cutting confirmed',
      'Leading indicators bottoming and turning up',
      'Yield curve re-steepening',
      'HY spreads peaking and narrowing',
      'Market rallying despite bad headlines (forward-looking)',
    ],
    late: [
      'Consumer confidence floor and turning up',
      'ISM Services breaking above 50',
      'NFP turning positive',
      'Credit spreads normalizing',
      'Market rally confirming recovery (3-6 months before GDP data shows it)',
    ],
  },
};

const CATALYSTS: Record<Season, Record<Phase, string[]>> = {
  spring: {
    early: ['Additional Fed cuts', 'Strong NFP surprise', 'Geopolitical resolution', 'Fiscal stimulus'],
    late: ['Fed signaling end of cuts', 'Strong earnings season', 'Business confidence recovery'],
  },
  summer: {
    early: ['Inflation surprise to upside', 'Fed accelerating hike timeline', 'Wage growth acceleration'],
    late: ['First hike announcement', 'Yield curve inversion', 'Credit event (corporate default)'],
  },
  autumn: {
    early: ['Credit shock (bankruptcy, bank failure)', 'GDP turning negative', 'Unemployment spike'],
    late: ['Fed pivot announcement', 'Emergency cut', 'Major bank/institution failure', 'Policy response announcement'],
  },
  winter: {
    early: ['Fed cutting', 'Fiscal stimulus', 'Credit thaw', 'Leading indicators turning'],
    late: ['Earnings recovery', 'Labor market stabilizing', 'Consumer confidence trough', 'Credit normalization'],
  },
};

export function buildPrediction(seasonResult: SeasonResult): SeasonPrediction {
  const { season, phase } = seasonResult;

  let nextSeason: Season;
  let nextPhase: Phase;
  let timing: string;

  if (phase === 'early') {
    // Staying in same season but moving to late
    nextSeason = season;
    nextPhase = 'late';
    const dur = SEASON_DURATION_MONTHS[season];
    timing = `Likely ${Math.round(dur.avg / 2)}-${dur.avg} months`;
  } else {
    // Late → next season early
    nextSeason = NEXT_SEASON[season];
    nextPhase = 'early';
    const dur = SEASON_DURATION_MONTHS[nextSeason];
    timing = `Could begin in ${Math.round(dur.min / 2)}-${dur.avg} months`;
  }

  return {
    nextSeason,
    nextPhase,
    timing,
    watchFor: WATCH_FOR[season][phase],
    catalysts: CATALYSTS[season][phase],
  };
}
