import type { FredSeries, SeasonScores, DataPoint } from '../types.js';

// Each indicator function returns scores 0-1 for each season.
// Higher = more consistent with that season.

function last(series: FredSeries, n = 1): number | null {
  const d = series.data;
  if (d.length < n) return null;
  return d[d.length - n].value;
}

function lastN(series: FredSeries, n: number): DataPoint[] {
  return series.data.slice(-n);
}

function calcSlope(points: DataPoint[]): number {
  if (points.length < 2) return 0;
  const first = points[0].value;
  const lastVal = points[points.length - 1].value;
  return lastVal - first;
}

// --- Fed Direction ---
// Spring: falling rates | Summer: stable/low | Autumn: rising | Winter: high→pivot
export function scoreFedDirection(fedfunds: FredSeries): SeasonScores {
  const recent = lastN(fedfunds, 6);
  if (recent.length < 3) {
    return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };
  }
  const slope = calcSlope(recent);
  const current = last(fedfunds) ?? 3.5;

  // Rising = autumn signal
  // Falling = spring/winter signal
  // High = autumn/winter
  // Low = spring/summer

  let spring = 0, summer = 0, autumn = 0, winter = 0;

  if (slope < -0.15) {
    // Actively cutting
    spring = 0.8;
    winter = 0.6;
    autumn = 0.1;
    summer = 0.1;
  } else if (slope < -0.05) {
    // Slightly cutting
    spring = 0.6;
    winter = 0.4;
    autumn = 0.2;
    summer = 0.2;
  } else if (slope > 0.15) {
    // Actively hiking
    autumn = 0.85;
    summer = 0.3;
    spring = 0.1;
    winter = 0.1;
  } else if (slope > 0.05) {
    // Slightly hiking
    autumn = 0.7;
    summer = 0.4;
    spring = 0.1;
    winter = 0.1;
  } else {
    // On hold — level determines season
    if (current > 4.5) {
      // High hold → likely late autumn / early winter
      autumn = 0.6;
      winter = 0.5;
      summer = 0.2;
      spring = 0.1;
    } else if (current > 2.5) {
      // Medium hold
      summer = 0.5;
      autumn = 0.4;
      spring = 0.3;
      winter = 0.2;
    } else {
      // Low hold → spring/summer
      spring = 0.6;
      summer = 0.5;
      winter = 0.3;
      autumn = 0.1;
    }
  }

  return { spring, summer, autumn, winter };
}

// --- Yield Curve (10Y-2Y) ---
// Spring: steepening positive | Summer: flattening | Autumn: flat/inverting | Winter: inverted/re-steepening
export function scoreYieldCurve(t10y2y: FredSeries): SeasonScores {
  const current = last(t10y2y) ?? 0;
  const prev3 = last(t10y2y, 4) ?? current;
  const slope = current - prev3; // steepening if positive

  let spring = 0, summer = 0, autumn = 0, winter = 0;

  if (current > 1.0 && slope > 0) {
    // Steep and steepening = spring
    spring = 0.9;
    summer = 0.4;
    autumn = 0.1;
    winter = 0.2;
  } else if (current > 0.5) {
    // Moderately positive
    spring = 0.7;
    summer = 0.6;
    autumn = 0.2;
    winter = 0.2;
  } else if (current > 0 && slope < 0) {
    // Positive but flattening = late spring / early summer
    spring = 0.5;
    summer = 0.7;
    autumn = 0.4;
    winter = 0.1;
  } else if (current >= -0.1 && current <= 0.1) {
    // Flat = autumn signal
    autumn = 0.7;
    summer = 0.5;
    spring = 0.2;
    winter = 0.3;
  } else if (current < -0.1 && slope < 0) {
    // Inverting = late autumn
    autumn = 0.85;
    winter = 0.3;
    summer = 0.1;
    spring = 0.05;
  } else if (current < -0.3) {
    // Deeply inverted = winter or late autumn
    winter = 0.7;
    autumn = 0.6;
    spring = 0.1;
    summer = 0.05;
  } else if (current < 0 && slope > 0.1) {
    // Inverted but re-steepening = winter (pivot underway)
    winter = 0.8;
    spring = 0.5;
    autumn = 0.3;
    summer = 0.1;
  } else {
    return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };
  }

  return { spring, summer, autumn, winter };
}

// --- Unemployment Trend ---
// Spring: falling | Summer: low+stable | Autumn: rising slightly | Winter: rising sharply
export function scoreUnemployment(unrate: FredSeries): SeasonScores {
  const recent = lastN(unrate, 6);
  if (recent.length < 3) return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };

  const current = last(unrate) ?? 4.0;
  const slope = calcSlope(recent);

  let spring = 0, summer = 0, autumn = 0, winter = 0;

  if (slope < -0.2) {
    // Falling fast = spring
    spring = 0.9;
    summer = 0.3;
    autumn = 0.1;
    winter = 0.1;
  } else if (slope < 0) {
    // Falling slowly = spring
    spring = 0.7;
    summer = 0.5;
    autumn = 0.2;
    winter = 0.1;
  } else if (Math.abs(slope) < 0.1 && current < 4.5) {
    // Stable and low = summer
    summer = 0.85;
    spring = 0.4;
    autumn = 0.2;
    winter = 0.1;
  } else if (slope > 0 && slope < 0.3) {
    // Rising slightly = autumn
    autumn = 0.7;
    summer = 0.3;
    winter = 0.3;
    spring = 0.1;
  } else if (slope >= 0.3) {
    // Rising sharply = winter
    winter = 0.85;
    autumn = 0.5;
    spring = 0.1;
    summer = 0.05;
  } else {
    return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };
  }

  return { spring, summer, autumn, winter };
}

// --- Inflation vs 2% Target ---
// Spring: at/below 2% | Summer: rising above 2% | Autumn: well above 2% | Winter: falling back
export function scoreInflation(pce: FredSeries, cpi: FredSeries): SeasonScores {
  // Calculate YoY inflation from PCE level data
  const pceData = pce.data;
  let yoyPce = 2.0; // default

  if (pceData.length >= 13) {
    const curr = pceData[pceData.length - 1].value;
    const yearAgo = pceData[pceData.length - 13].value;
    yoyPce = ((curr - yearAgo) / yearAgo) * 100;
  }

  const recentPce = lastN(pce, 6);
  const inflSlope = calcSlope(recentPce);

  let spring = 0, summer = 0, autumn = 0, winter = 0;

  if (yoyPce <= 2.0) {
    // At or below target = spring
    spring = 0.8;
    summer = 0.3;
    autumn = 0.1;
    winter = 0.5;
  } else if (yoyPce <= 2.5 && inflSlope > 0) {
    // Just above, rising = early summer
    summer = 0.7;
    spring = 0.4;
    autumn = 0.2;
    winter = 0.1;
  } else if (yoyPce <= 3.5) {
    // Moderate above = summer/early autumn
    summer = 0.5;
    autumn = 0.6;
    spring = 0.2;
    winter = 0.2;
  } else if (yoyPce <= 5.0) {
    // Well above = autumn
    autumn = 0.85;
    winter = 0.2;
    summer = 0.2;
    spring = 0.05;
  } else {
    // Very high = deep autumn / crisis
    autumn = 0.9;
    winter = 0.3;
    summer = 0.1;
    spring = 0.05;
  }

  // If high but falling, shift toward winter
  if (yoyPce > 3 && inflSlope < -0.05) {
    winter += 0.2;
    autumn -= 0.1;
  }

  // Clamp
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  return {
    spring: clamp(spring),
    summer: clamp(summer),
    autumn: clamp(autumn),
    winter: clamp(winter),
  };
}

// --- High Yield Spread ---
// Spring: narrowing | Summer: tight | Autumn: widening | Winter: wide → narrowing
export function scoreHySpread(hySpread: FredSeries): SeasonScores {
  const current = last(hySpread) ?? 4.0;
  const prev3 = last(hySpread, 4) ?? current;
  const slope = current - prev3;

  let spring = 0, summer = 0, autumn = 0, winter = 0;

  if (current < 3.5 && slope <= 0) {
    // Tight and narrowing = summer
    summer = 0.85;
    spring = 0.5;
    autumn = 0.1;
    winter = 0.05;
  } else if (current < 3.5 && slope > 0) {
    // Tight but widening = late summer / early autumn
    autumn = 0.6;
    summer = 0.5;
    spring = 0.3;
    winter = 0.1;
  } else if (current >= 3.5 && current < 5.0 && slope < 0) {
    // Narrowing from moderate = spring/late winter
    spring = 0.7;
    winter = 0.5;
    summer = 0.3;
    autumn = 0.1;
  } else if (current >= 3.5 && slope > 0) {
    // Widening = autumn
    autumn = 0.8;
    winter = 0.3;
    summer = 0.1;
    spring = 0.1;
  } else if (current >= 6.0 && slope < 0) {
    // Wide but narrowing = late winter
    winter = 0.8;
    spring = 0.6;
    autumn = 0.2;
    summer = 0.05;
  } else if (current >= 6.0) {
    // Very wide = winter
    winter = 0.85;
    autumn = 0.4;
    spring = 0.2;
    summer = 0.05;
  } else {
    return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };
  }

  return { spring, summer, autumn, winter };
}

// --- NFP Trend (Nonfarm Payrolls) ---
// Spring: positive, growing | Summer: strong | Autumn: slowing | Winter: negative/weak
export function scoreNfp(payems: FredSeries): SeasonScores {
  const data = payems.data;
  if (data.length < 3) return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };

  // Calculate MoM change
  const changes: number[] = [];
  for (let i = Math.max(0, data.length - 7); i < data.length; i++) {
    if (i > 0) changes.push(data[i].value - data[i - 1].value);
  }

  if (changes.length === 0) return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const recentChange = changes[changes.length - 1] ?? avgChange;

  // In thousands. >200K = strong, 100-200K = moderate, <100K = weak, <0 = contraction

  let spring = 0, summer = 0, autumn = 0, winter = 0;

  if (recentChange > 250) {
    // Very strong = summer
    summer = 0.85;
    spring = 0.5;
    autumn = 0.1;
    winter = 0.05;
  } else if (recentChange > 150) {
    // Strong = summer/late spring
    summer = 0.7;
    spring = 0.6;
    autumn = 0.2;
    winter = 0.05;
  } else if (recentChange > 50 && avgChange < recentChange) {
    // Moderate and improving = spring
    spring = 0.7;
    summer = 0.5;
    autumn = 0.2;
    winter = 0.1;
  } else if (recentChange > 50 && avgChange > recentChange) {
    // Moderate but slowing = late summer / early autumn
    autumn = 0.6;
    summer = 0.5;
    spring = 0.3;
    winter = 0.1;
  } else if (recentChange > 0 && recentChange <= 50) {
    // Weak positive = autumn/winter
    autumn = 0.6;
    winter = 0.4;
    summer = 0.2;
    spring = 0.2;
  } else {
    // Negative = winter
    winter = 0.85;
    autumn = 0.4;
    spring = 0.1;
    summer = 0.05;
  }

  return { spring, summer, autumn, winter };
}

// --- Balance Sheet ---
// Spring: expanding/stable | Summer: stable | Autumn: shrinking (QT) | Winter: QT ending, QE restart
export function scoreBalanceSheet(walcl: FredSeries): SeasonScores {
  const recent = lastN(walcl, 8);
  if (recent.length < 3) return { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 };

  const slope = calcSlope(recent);
  const current = last(walcl) ?? 7000;

  // Slope in billions; positive = expanding, negative = contracting
  let spring = 0, summer = 0, autumn = 0, winter = 0;

  if (slope > 100) {
    // Rapidly expanding = winter (crisis QE) or spring (support)
    winter = 0.7;
    spring = 0.6;
    autumn = 0.1;
    summer = 0.2;
  } else if (slope > 0) {
    // Slowly expanding = spring
    spring = 0.6;
    summer = 0.5;
    winter = 0.3;
    autumn = 0.2;
  } else if (Math.abs(slope) < 30) {
    // Stable = summer
    summer = 0.65;
    spring = 0.4;
    autumn = 0.3;
    winter = 0.2;
  } else if (slope < -30) {
    // Contracting = autumn (QT active)
    autumn = 0.75;
    summer = 0.3;
    spring = 0.1;
    winter = 0.2;
  }

  return { spring, summer, autumn, winter };
}

// Combine all indicator scores with weights
export interface WeightedScores {
  scores: SeasonScores;
  breakdown: Record<string, SeasonScores>;
}

export const INDICATOR_WEIGHTS = {
  fedDirection: 0.25,
  yieldCurve: 0.20,
  unemployment: 0.15,
  inflation: 0.15,
  hySpread: 0.10,
  nfp: 0.10,
  balanceSheet: 0.05,
};

export function calcWeightedScores(
  fedfunds: FredSeries,
  t10y2y: FredSeries,
  unrate: FredSeries,
  pce: FredSeries,
  cpi: FredSeries,
  hySpread: FredSeries,
  payems: FredSeries,
  walcl: FredSeries,
): WeightedScores {
  const breakdown = {
    fedDirection: scoreFedDirection(fedfunds),
    yieldCurve: scoreYieldCurve(t10y2y),
    unemployment: scoreUnemployment(unrate),
    inflation: scoreInflation(pce, cpi),
    hySpread: scoreHySpread(hySpread),
    nfp: scoreNfp(payems),
    balanceSheet: scoreBalanceSheet(walcl),
  };

  const weights = INDICATOR_WEIGHTS;
  const seasons: Array<keyof SeasonScores> = ['spring', 'summer', 'autumn', 'winter'];

  const scores: SeasonScores = { spring: 0, summer: 0, autumn: 0, winter: 0 };

  for (const season of seasons) {
    scores[season] =
      breakdown.fedDirection[season] * weights.fedDirection +
      breakdown.yieldCurve[season] * weights.yieldCurve +
      breakdown.unemployment[season] * weights.unemployment +
      breakdown.inflation[season] * weights.inflation +
      breakdown.hySpread[season] * weights.hySpread +
      breakdown.nfp[season] * weights.nfp +
      breakdown.balanceSheet[season] * weights.balanceSheet;
  }

  return { scores, breakdown };
}
