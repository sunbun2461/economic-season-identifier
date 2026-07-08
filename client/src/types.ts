export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Phase = 'early' | 'late';
export type RateDirection = 'cut' | 'hike' | 'hold';

export interface FredSeries {
  id: string;
  data: { date: string; value: number }[];
  latest: number | null;
  prev: number | null;
  trend: 'up' | 'down' | 'flat';
}

export interface MacroSnapshot {
  timestamp: string;
  stale: boolean;
  rates: {
    fedFunds: FredSeries; dff: FredSeries; dgs2: FredSeries; dgs10: FredSeries;
    dgs30: FredSeries; t10y2y: FredSeries; t10y3m: FredSeries;
    mortgage30: FredSeries; dfedtaru: FredSeries; dfedtarl: FredSeries;
  };
  inflation: { cpi: FredSeries; pce: FredSeries; t5yie: FredSeries };
  labor: { unrate: FredSeries; payems: FredSeries; icsa: FredSeries };
  growth: { gdp: FredSeries };
  credit: { hySpread: FredSeries; walcl: FredSeries };
  market: { sp500: FredSeries };
}

export interface SeasonScores { spring: number; summer: number; autumn: number; winter: number; }

export interface SeasonResult {
  season: Season; phase: Phase; confidence: number;
  scores: SeasonScores; conflictingIndicators: string[];
  setup: string; setupDescription: string;
  detectedOverlays: string[]; summary: string;
}

export interface SeasonPrediction {
  nextSeason: Season; nextPhase: Phase; timing: string;
  watchFor: string[]; catalysts: string[];
}

export interface AssetAllocation {
  equities: { pct: number; detail: string }; bonds: { pct: number; detail: string };
  cash: { pct: number; detail: string }; alts: { pct: number; detail: string };
}

export interface TradeIdea { asset: string; ticker?: string; reason: string; }
export interface SectorWeight { name: string; weight: 'overweight' | 'neutral' | 'underweight'; reason: string; }
export interface BondType { name: string; weight: string; ticker?: string; }

export interface PortfolioRec {
  season: Season; phase: Phase; setup: string; setupDescription: string;
  riskLevel: string; historicalAnalog: string; confidence: number;
  allocation: AssetAllocation; sectors: SectorWeight[];
  equityStyle: string; bondDuration: string; bondTypes: BondType[];
  buy: TradeIdea[]; sell: TradeIdea[]; hold: TradeIdea[];
  watchList: string[]; appliedOverlays: string[];
  alts?: { pct: number; detail: string };
}

export interface FomcMeeting {
  startDate: string; endDate: string; hasSEP: boolean;
  result?: string; rateBefore?: number; rateAfter?: number;
  direction?: RateDirection; isPast: boolean; isNext: boolean;
}

export interface RateDecision {
  date: string; chair: string; rateBefore: number | null; rateAfter: number;
  direction: RateDirection; bps?: number; note: string;
  season?: Season; phase?: Phase; isEmergency?: boolean;
}

export interface ChartLink { name: string; symbol: string; url: string; description: string; }
export interface ChartCategory { id: string; label: string; emoji: string; charts: ChartLink[]; }
export interface GlossaryTerm { term: string; definition: string; analogy: string; }

export interface ApiDataResponse {
  snapshot: MacroSnapshot; season: SeasonResult; portfolio: PortfolioRec;
  prediction: SeasonPrediction; fomc: FomcMeeting[];
  timestamp: string; stale: boolean;
}

export interface ApiHistoryResponse {
  decisions: RateDecision[];
  stats: { totalCuts: number; totalHikes: number; totalHolds: number; avgCycleLengthMonths: number; };
}

// --- Screener ---

export interface ScreenerMetrics {
  epsGrowthYoY: number | null;
  revenueGrowthYoY: number | null;
  netMargin: number | null;
  debtEquity: number | null;
  downsideFromHigh: number;
}

export interface ScreenerSignal {
  ticker: string;
  company: string;
  sector: string;
  marketCap: number;
  price: number;
  score: number;
  metrics: ScreenerMetrics;
  verdict: string;
}

export interface ApiScreenerResponse {
  large: ScreenerSignal[];
  mid: ScreenerSignal[];
  small: ScreenerSignal[];
  timestamp: string;
  stale: boolean;
}

export interface Palette {
  primary: string; accent: string; dark: string; bg: string; bgDark: string; emoji: string; label: string;
}

export const PALETTES: Record<Season, Palette> = {
  spring: { primary: '#10b981', accent: '#34d399', dark: '#059669', bg: '#ecfdf5', bgDark: '#d1fae5', emoji: '🌱', label: 'Spring' },
  summer: { primary: '#eab308', accent: '#fde047', dark: '#ca8a04', bg: '#fefce8', bgDark: '#fef9c3', emoji: '☀️', label: 'Summer' },
  autumn: { primary: '#f97316', accent: '#fb923c', dark: '#ea580c', bg: '#fff7ed', bgDark: '#ffedd5', emoji: '🍂', label: 'Autumn' },
  winter: { primary: '#3b82f6', accent: '#60a5fa', dark: '#2563eb', bg: '#eff6ff', bgDark: '#dbeafe', emoji: '❄️', label: 'Winter' },
};

export const ALL_PHASES = [
  { season: 'spring' as Season, phase: 'early' as Phase, label: 'Early Spring', emoji: '🌱' },
  { season: 'spring' as Season, phase: 'late'  as Phase, label: 'Late Spring',  emoji: '🌱' },
  { season: 'summer' as Season, phase: 'early' as Phase, label: 'Early Summer', emoji: '☀️' },
  { season: 'summer' as Season, phase: 'late'  as Phase, label: 'Late Summer',  emoji: '☀️' },
  { season: 'autumn' as Season, phase: 'early' as Phase, label: 'Early Autumn', emoji: '🍂' },
  { season: 'autumn' as Season, phase: 'late'  as Phase, label: 'Late Autumn',  emoji: '🍂' },
  { season: 'winter' as Season, phase: 'early' as Phase, label: 'Early Winter', emoji: '❄️' },
  { season: 'winter' as Season, phase: 'late'  as Phase, label: 'Late Winter',  emoji: '❄️' },
];
