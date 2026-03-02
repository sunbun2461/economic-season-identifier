import type { MacroSnapshot, SeasonResult, Season, Phase, SeasonScores } from '../types.js';
import { calcWeightedScores } from './indicators.js';

function normalizeScores(raw: SeasonScores): SeasonScores {
  const total = raw.spring + raw.summer + raw.autumn + raw.winter;
  if (total === 0) return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };
  return {
    spring: Math.round((raw.spring / total) * 100),
    summer: Math.round((raw.summer / total) * 100),
    autumn: Math.round((raw.autumn / total) * 100),
    winter: Math.round((raw.winter / total) * 100),
  };
}

function pickWinner(scores: SeasonScores): Season {
  const entries = Object.entries(scores) as Array<[Season, number]>;
  return entries.reduce((best, curr) => (curr[1] > best[1] ? curr : best))[0];
}

function calcConfidence(scores: SeasonScores, winner: Season): number {
  const sorted = Object.values(scores).sort((a, b) => b - a);
  const first = sorted[0];
  const second = sorted[1];
  // Confidence is how much winner leads the runner-up
  const margin = first - second;
  // Normalize to 0-100: margin of 25+ = very confident (near 100), margin of 0 = 50%
  return Math.min(99, Math.round(50 + margin * 2));
}

function determinePhase(
  season: Season,
  snapshot: MacroSnapshot,
  breakdown: Record<string, SeasonScores>,
): Phase {
  const { rates, inflation, labor, credit } = snapshot;

  // Leading indicators pointing to next season = late
  const nextSeason = getNextSeason(season);
  const nextBreakdownScores = Object.values(breakdown).map(s => s[nextSeason]);
  const avgNextSignal = nextBreakdownScores.reduce((a, b) => a + b, 0) / nextBreakdownScores.length;

  // If leading indicators averaging > 0.35 toward next season = late
  if (avgNextSignal > 0.38) return 'late';

  switch (season) {
    case 'spring': {
      // Late spring: cuts slowing/stopped, economy stabilizing
      const fedSlope = rates.fedFunds.trend;
      const curvePositive = (rates.t10y2y.latest ?? 0) > 0.3;
      const curveImproving = rates.t10y2y.trend === 'up';
      if (fedSlope !== 'down' && curvePositive && curveImproving) return 'late';
      return 'early';
    }
    case 'summer': {
      // Late summer: Fed signaling hikes, HY spreads starting to widen
      const fedFlat = rates.fedFunds.trend === 'flat';
      const hyWidening = credit.hySpread.trend === 'up';
      const curveFlattening = rates.t10y2y.trend === 'down';
      const inflHigh = (inflation.pce.latest ?? 0) > 2.5;
      if (fedFlat && (hyWidening || curveFlattening) && inflHigh) return 'late';
      return 'early';
    }
    case 'autumn': {
      // Late autumn: multiple hikes done, curve inverted
      const curveInverted = (rates.t10y2y.latest ?? 0) < -0.1;
      const unrateRising = labor.unrate.trend === 'up';
      if (curveInverted || unrateRising) return 'late';
      return 'early';
    }
    case 'winter': {
      // Late winter: Fed cutting, max pessimism but pivot confirmed
      const fedCutting = rates.fedFunds.trend === 'down';
      const curveResteepening = rates.t10y2y.trend === 'up';
      if (fedCutting && curveResteepening) return 'late';
      return 'early';
    }
  }
}

function getNextSeason(season: Season): Season {
  const order: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  const i = order.indexOf(season);
  return order[(i + 1) % 4];
}

function detectOverlays(season: Season, phase: Phase, snapshot: MacroSnapshot): string[] {
  const overlays: string[] = [];
  const { rates, inflation, labor } = snapshot;

  const pceVal = inflation.pce.latest ?? 2.0;
  const unrateVal = labor.unrate.latest ?? 4.0;
  const t10y2yVal = rates.t10y2y.latest ?? 0;
  const fedVal = rates.fedFunds.latest ?? 3.5;

  // Inflation elevated in Spring
  if (season === 'spring' && pceVal > 2.5) {
    overlays.push('Inflation elevated during recovery — favor value, add TIPS');
  }

  // Curve still inverted in Late Spring
  if (season === 'spring' && phase === 'late' && t10y2yVal < 0) {
    overlays.push('Curve still inverted — do not go fully aggressive yet');
  }

  // Stagflation: rising CPI + rising UNRATE
  if (inflation.pce.trend === 'up' && labor.unrate.trend === 'up' && pceVal > 3) {
    overlays.push('Stagflation risk — commodities, energy, TIPS, cash priority');
  }

  // Insurance cuts in a strong economy
  if (season === 'spring' && rates.fedFunds.trend === 'down' && unrateVal < 4.5 && snapshot.growth.gdp.trend !== 'down') {
    overlays.push('Insurance cuts — no recession → full risk-on (1995/1998/2019 analog)');
  }

  // Inverted curve + low unemployment = deceptive
  if (t10y2yVal < 0 && unrateVal < 4.5) {
    overlays.push('Most deceptive environment: inverted curve + low unemployment. Remain defensive.');
  }

  // Current specific: Spring 2026 context
  if (season === 'spring' && phase === 'early' && Math.abs(fedVal - 3.625) < 0.5) {
    overlays.push('Fed paused after 3 cuts — watching inflation data before next move');
  }

  return overlays;
}

function buildSummary(season: Season, phase: Phase, snapshot: MacroSnapshot): string {
  const { rates } = snapshot;
  const fedVal = rates.fedFunds.latest;
  const curveVal = rates.t10y2y.latest;

  const seasonDescriptions: Record<Season, Record<Phase, string>> = {
    spring: {
      early: 'Fed cutting rates, economy recovering. Maximum uncertainty = maximum opportunity for risk-takers.',
      late: 'Cuts slowing, economy stabilizing. "All clear" rally building — best historical risk/reward window.',
    },
    summer: {
      early: 'Growth strong, Fed on hold. Party still going, but rotate toward value and quality.',
      late: 'Fed signaling. Overheating hints. Smart money getting cautious. Build cash war chest.',
    },
    autumn: {
      early: 'First rate hikes. Markets still resilient. "This time is different" narrative in full swing.',
      late: 'Multiple hikes complete. Curve inverted. Cracks visible. Time to get defensive.',
    },
    winter: {
      early: 'Downturn confirmed. Fear high. Fed not yet pivoted. Defensive, but start shopping for quality.',
      late: 'Max pessimism — but Fed cutting. Seeds of spring planted in the worst of times.',
    },
  };

  return seasonDescriptions[season][phase];
}

export function classifySeason(snapshot: MacroSnapshot): SeasonResult {
  const { rates, inflation, labor, credit } = snapshot;

  const { scores: rawScores, breakdown } = calcWeightedScores(
    rates.fedFunds,
    rates.t10y2y,
    labor.unrate,
    inflation.pce,
    inflation.cpi,
    credit.hySpread,
    labor.payems,
    credit.walcl,
  );

  const normalizedScores = normalizeScores(rawScores);
  const season = pickWinner(normalizedScores);
  const confidence = calcConfidence(normalizedScores, season);
  const phase = determinePhase(season, snapshot, breakdown);

  // Find conflicting indicators
  const conflictingIndicators: string[] = [];
  const entries = Object.entries(breakdown) as Array<[string, SeasonScores]>;
  for (const [indicator, scores] of entries) {
    const indicatorWinner = pickWinner(scores);
    if (indicatorWinner !== season) {
      conflictingIndicators.push(
        `${indicator}: signals ${indicatorWinner} (${Math.round(scores[indicatorWinner] * 100)}%)`
      );
    }
  }

  const overlays = detectOverlays(season, phase, snapshot);
  const summary = buildSummary(season, phase, snapshot);

  const setupLabels: Record<Season, Record<Phase, string>> = {
    spring: { early: 'Recovery Beginning', late: '"All Clear" Rally' },
    summer: { early: 'Peak Expansion', late: 'Overheating Watch' },
    autumn: { early: 'Tightening Begins', late: 'Late Cycle Stress' },
    winter: { early: 'Contraction', late: 'Pivot Approaching' },
  };

  return {
    season,
    phase,
    confidence,
    scores: normalizedScores,
    conflictingIndicators,
    setup: setupLabels[season][phase],
    setupDescription: summary,
    detectedOverlays: overlays,
    summary,
  };
}
