import type { SeasonResult, MacroSnapshot, PortfolioRec, SectorWeight, TradeIdea } from '../types.js';
import { getPhaseModel } from '../data/portfolio-models.js';

export function buildPortfolioRec(seasonResult: SeasonResult, snapshot: MacroSnapshot): PortfolioRec {
  const { season, phase, confidence, detectedOverlays } = seasonResult;
  const model = getPhaseModel(season, phase);

  // Deep clone mutable fields so overlays don't mutate the shared phaseModel singleton
  let rec: PortfolioRec = {
    ...model,
    confidence,
    appliedOverlays: [],
    allocation: {
      equities: { ...model.allocation.equities },
      bonds:    { ...model.allocation.bonds },
      cash:     { ...model.allocation.cash },
      alts:     { ...model.allocation.alts },
    },
    bondTypes: model.bondTypes.map(b => ({ ...b })),
    buy:       model.buy.map(b => ({ ...b })),
    hold:      model.hold.map(b => ({ ...b })),
    sell:      model.sell.map(b => ({ ...b })),
  };

  // Apply setup overlays based on detected conditions
  const { rates, inflation, labor } = snapshot;
  const pceVal = inflation.pce.latest ?? 2.0;
  const unrateVal = labor.unrate.latest ?? 4.0;
  const t10y2yVal = rates.t10y2y.latest ?? 0;

  // Overlay 1: Inflation elevated during Spring recovery
  if (season === 'spring' && pceVal > 2.5) {
    rec.appliedOverlays.push('Inflation Elevated in Recovery');
    rec.allocation.equities.pct -= 5;
    rec.allocation.alts.pct += 5;
    rec.equityStyle += ' — Favor value over growth due to sticky inflation.';
    // Add TIPS to bond section
    const tipsExists = rec.bondTypes.find(b => b.ticker === 'SCHP' || b.name.includes('TIPS'));
    if (!tipsExists) {
      rec.bondTypes.unshift({ name: 'TIPS (inflation protection)', weight: '20%', ticker: 'SCHP' });
      rec.buy.unshift({ asset: 'TIPS ETF', ticker: 'SCHP', reason: 'Inflation above target even during recovery' });
    }
  }

  // Overlay 2: Curve inverted in Late Spring
  if (season === 'spring' && phase === 'late' && t10y2yVal < 0) {
    rec.appliedOverlays.push('Curve Still Inverted');
    rec.allocation.equities.pct -= 5;
    rec.allocation.cash.pct += 5;
    rec.equityStyle += ' — Do not go fully aggressive; curve inversion signals caution.';
    rec.riskLevel = 'Moderate (not fully aggressive — curve still inverted)';
  }

  // Overlay 3: Stagflation
  if (inflation.pce.trend === 'up' && labor.unrate.trend === 'up' && pceVal > 3) {
    rec.appliedOverlays.push('Stagflation Risk');
    rec.riskLevel = 'Defensive (Stagflation override)';
    rec.equityStyle = 'Commodities, energy, TIPS, cash only. No growth.';
    rec.buy = [
      { asset: 'Energy SPDR', ticker: 'XLE', reason: 'Stagflation: energy outperforms' },
      { asset: 'TIPS ETF', ticker: 'SCHP', reason: 'Inflation protection' },
      { asset: 'Commodity ETF', ticker: 'DJP', reason: 'Real assets in stagflation' },
      { asset: 'T-bills', ticker: 'BIL', reason: 'Risk-free real yield' },
    ];
    rec.allocation.cash.pct = Math.max(rec.allocation.cash.pct, 25);
  }

  // Overlay 4: Insurance cuts (strong economy + rate cuts)
  if (
    season === 'spring' &&
    rates.fedFunds.trend === 'down' &&
    unrateVal < 4.5 &&
    snapshot.growth.gdp.trend !== 'down'
  ) {
    rec.appliedOverlays.push('Insurance Cuts (1995/1998/2019 Analog)');
    rec.riskLevel = 'Aggressive (insurance cuts = full risk-on)';
    rec.historicalAnalog = '1995, 1998, 2019 — insurance cuts with no recession';
    rec.setupDescription += ' This is the 1995/1998/2019 pattern: cuts with no recession = exceptional equity returns.';
  }

  // Overlay 5: Most deceptive — inverted + low unemployment
  if (t10y2yVal < 0 && unrateVal < 4.5) {
    if (!rec.appliedOverlays.includes('Stagflation Risk')) {
      rec.appliedOverlays.push('Deceptive Environment (Inverted + Low Unemployment)');
      rec.riskLevel += ' — Caution: most deceptive combo historically';
    }
  }

  // Normalize allocations to 100%
  const total = rec.allocation.equities.pct + rec.allocation.bonds.pct +
    rec.allocation.cash.pct + rec.allocation.alts.pct;
  if (total !== 100) {
    const diff = 100 - total;
    rec.allocation.cash.pct += diff; // adjust cash
  }

  return rec;
}
