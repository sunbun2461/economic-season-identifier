// Core data types for the Macro Economic Cycle Tracker

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Phase = 'early' | 'late';
export type RateDirection = 'cut' | 'hike' | 'hold';
export type Decade = '1990s' | '2000s' | '2010s' | '2020s';

// --- FRED API ---

export interface FredObservation {
  date: string;
  value: string; // FRED returns strings; "." for missing
}

export interface FredSeriesData {
  id: string;
  observations: FredObservation[];
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface FredSeries {
  id: string;
  data: DataPoint[];
  latest: number | null;
  prev: number | null;
  trend: 'up' | 'down' | 'flat';
}

// --- Macro Snapshot ---

export interface MacroSnapshot {
  timestamp: string;
  stale: boolean;
  rates: {
    fedFunds: FredSeries;
    dff: FredSeries;
    dgs2: FredSeries;
    dgs10: FredSeries;
    dgs30: FredSeries;
    t10y2y: FredSeries;
    t10y3m: FredSeries;
    mortgage30: FredSeries;
    dfedtaru: FredSeries;
    dfedtarl: FredSeries;
  };
  inflation: {
    cpi: FredSeries;
    pce: FredSeries;
    t5yie: FredSeries;
  };
  labor: {
    unrate: FredSeries;
    payems: FredSeries;
    icsa: FredSeries;
  };
  growth: {
    gdp: FredSeries;
  };
  credit: {
    hySpread: FredSeries;
    walcl: FredSeries;
  };
  market: {
    sp500: FredSeries;
  };
}

// --- Season Classification ---

export interface SeasonScores {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
}

export interface SeasonResult {
  season: Season;
  phase: Phase;
  confidence: number;
  scores: SeasonScores;
  conflictingIndicators: string[];
  setup: string;
  setupDescription: string;
  detectedOverlays: string[];
  summary: string;
}

// --- Prediction ---

export interface SeasonPrediction {
  nextSeason: Season;
  nextPhase: Phase;
  timing: string;
  watchFor: string[];
  catalysts: string[];
}

// --- Portfolio ---

export interface AssetAllocation {
  equities: { pct: number; detail: string };
  bonds: { pct: number; detail: string };
  cash: { pct: number; detail: string };
  alts: { pct: number; detail: string };
}

export interface TradeIdea {
  asset: string;
  ticker?: string;
  reason: string;
}

export interface SectorWeight {
  name: string;
  weight: 'overweight' | 'neutral' | 'underweight';
  reason: string;
}

export interface BondType {
  name: string;
  weight: string;
  ticker?: string;
}

export interface PortfolioRec {
  season: Season;
  phase: Phase;
  setup: string;
  setupDescription: string;
  riskLevel: string;
  historicalAnalog: string;
  confidence: number;
  allocation: AssetAllocation;
  sectors: SectorWeight[];
  equityStyle: string;
  bondDuration: string;
  bondTypes: BondType[];
  buy: TradeIdea[];
  sell: TradeIdea[];
  hold: TradeIdea[];
  watchList: string[];
  appliedOverlays: string[];
}

// --- FOMC ---

export interface FomcMeeting {
  startDate: string;
  endDate: string;
  hasSEP: boolean;          // Summary of Economic Projections
  result?: string;          // e.g. "held 3.50-3.75%"
  rateBefore?: number;
  rateAfter?: number;
  direction?: RateDirection;
  isPast: boolean;
  isNext: boolean;
}

// --- Rate History ---

export interface RateDecision {
  date: string;
  chair: string;
  rateBefore: number | null;
  rateAfter: number;
  direction: RateDirection;
  bps?: number;              // basis points changed
  note: string;
  season?: Season;
  phase?: Phase;
  isEmergency?: boolean;
}

// --- TradingView ---

export interface ChartLink {
  name: string;
  symbol: string;
  url: string;
  description: string;
}

export interface ChartCategory {
  id: string;
  label: string;
  emoji: string;
  charts: ChartLink[];
}

// --- Glossary ---

export interface GlossaryTerm {
  term: string;
  definition: string;
  analogy: string;
}

// --- Theme ---

export interface ThemePalette {
  season: Season;
  primary: string;
  early: string;
  late: string;
  bg: string;
  bgDark: string;
  emoji: string;
  label: string;
}

// --- API Responses ---

export interface ApiDataResponse {
  snapshot: MacroSnapshot;
  season: SeasonResult;
  portfolio: PortfolioRec;
  prediction: SeasonPrediction;
  fomc: FomcMeeting[];
  timestamp: string;
  stale: boolean;
}

export interface ApiHistoryResponse {
  decisions: RateDecision[];
  stats: {
    totalCuts: number;
    totalHikes: number;
    totalHolds: number;
    avgCycleLengthMonths: number;
  };
}

// --- Screener ---

export interface ScreenerMetrics {
  epsGrowthYoY: number | null;
  revenueGrowthYoY: number | null;
  netMargin: number | null;
  debtEquity: number | null;
  downsideFromHigh: number; // e.g. -0.32 = down 32%
}

export interface ScreenerSignal {
  ticker: string;
  company: string;
  sector: string;
  marketCap: number; // billions
  price: number;
  score: number;     // 0–100
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
