import type { ChartCategory } from '../types.js';

export const chartCategories: ChartCategory[] = [
  {
    id: 'rates',
    label: 'Interest Rates',
    emoji: '🏦',
    charts: [
      { name: 'Fed Funds Rate', symbol: 'FRED:FEDFUNDS', url: 'https://www.tradingview.com/symbols/FRED-FEDFUNDS/', description: 'Monthly effective federal funds rate' },
      { name: 'Daily Fed Funds', symbol: 'FRED:DFF', url: 'https://www.tradingview.com/symbols/FRED-DFF/', description: 'Daily fed funds effective rate' },
      { name: 'US Interest Rate', symbol: 'ECONOMICS:USINTR', url: 'https://www.tradingview.com/symbols/ECONOMICS-USINTR/', description: 'Federal funds target rate' },
      { name: '30-Day Fed Funds Futures', symbol: 'CBOT:ZQ1!', url: 'https://www.tradingview.com/symbols/CBOT-ZQ1!/', description: 'Market-implied future rate expectations' },
    ],
  },
  {
    id: 'yields',
    label: 'Treasury Yields',
    emoji: '📈',
    charts: [
      { name: '3-Month Treasury', symbol: 'FRED:DGS3MO', url: 'https://www.tradingview.com/symbols/FRED-DGS3MO/', description: '3-month Treasury Bill yield' },
      { name: '2-Year Treasury', symbol: 'FRED:DGS2', url: 'https://www.tradingview.com/symbols/FRED-DGS2/', description: '2-year Treasury Note yield (policy sensitive)' },
      { name: '5-Year Treasury', symbol: 'FRED:DGS5', url: 'https://www.tradingview.com/symbols/FRED-DGS5/', description: '5-year Treasury Note yield' },
      { name: '10-Year Treasury', symbol: 'FRED:DGS10', url: 'https://www.tradingview.com/symbols/FRED-DGS10/', description: '10-year Treasury Note yield (benchmark)' },
      { name: '30-Year Treasury', symbol: 'FRED:DGS30', url: 'https://www.tradingview.com/symbols/FRED-DGS30/', description: '30-year Treasury Bond yield (long-term)' },
      { name: 'US 10Y (TVC)', symbol: 'TVC:US10Y', url: 'https://www.tradingview.com/symbols/TVC-US10Y/', description: '10-year yield (real-time)' },
    ],
  },
  {
    id: 'curve',
    label: 'Yield Curve',
    emoji: '📉',
    charts: [
      { name: '10Y-2Y Spread', symbol: 'FRED:T10Y2Y', url: 'https://www.tradingview.com/symbols/FRED-T10Y2Y/', description: '10Y minus 2Y — the most-watched recession predictor' },
      { name: '10Y-3M Spread', symbol: 'FRED:T10Y3M', url: 'https://www.tradingview.com/symbols/FRED-T10Y3M/', description: '10Y minus 3-month — alternative inversion signal' },
      { name: '10Y-FF Spread', symbol: 'FRED:T10YFF', url: 'https://www.tradingview.com/symbols/FRED-T10YFF/', description: '10-year minus Fed Funds — policy restrictiveness gauge' },
    ],
  },
  {
    id: 'inflation',
    label: 'Inflation',
    emoji: '🔥',
    charts: [
      { name: 'CPI All Items', symbol: 'FRED:CPIAUCSL', url: 'https://www.tradingview.com/symbols/FRED-CPIAUCSL/', description: 'Consumer Price Index — broad inflation measure' },
      { name: 'Core CPI', symbol: 'FRED:CPILFESL', url: 'https://www.tradingview.com/symbols/FRED-CPILFESL/', description: 'CPI ex food & energy — "sticky" inflation' },
      { name: 'PCE Price Index', symbol: 'FRED:PCEPI', url: 'https://www.tradingview.com/symbols/FRED-PCEPI/', description: "PCE — the Fed's preferred inflation gauge" },
      { name: 'Core PCE', symbol: 'FRED:PCEPILFE', url: 'https://www.tradingview.com/symbols/FRED-PCEPILFE/', description: "Core PCE — what the Fed targets at 2%" },
      { name: 'US Inflation YoY', symbol: 'ECONOMICS:USIRYY', url: 'https://www.tradingview.com/symbols/ECONOMICS-USIRYY/', description: 'Year-over-year inflation rate' },
      { name: '5Y Breakeven Inflation', symbol: 'FRED:T5YIE', url: 'https://www.tradingview.com/symbols/FRED-T5YIE/', description: "Market's 5-year inflation expectations" },
    ],
  },
  {
    id: 'employment',
    label: 'Employment',
    emoji: '👷',
    charts: [
      { name: 'Unemployment Rate', symbol: 'FRED:UNRATE', url: 'https://www.tradingview.com/symbols/FRED-UNRATE/', description: 'U-3 unemployment — half of the dual mandate' },
      { name: 'Nonfarm Payrolls', symbol: 'FRED:PAYEMS', url: 'https://www.tradingview.com/symbols/FRED-PAYEMS/', description: 'Monthly job creation — most-watched data release' },
      { name: 'Initial Jobless Claims', symbol: 'FRED:ICSA', url: 'https://www.tradingview.com/symbols/FRED-ICSA/', description: 'Weekly leading indicator for labor market' },
      { name: 'Job Openings (JOLTS)', symbol: 'FRED:JTSJOL', url: 'https://www.tradingview.com/symbols/FRED-JTSJOL/', description: 'Job openings — demand side of labor market' },
    ],
  },
  {
    id: 'consumer',
    label: 'Consumer & Housing',
    emoji: '🏠',
    charts: [
      { name: '30-Year Mortgage', symbol: 'FRED:MORTGAGE30US', url: 'https://www.tradingview.com/symbols/FRED-MORTGAGE30US/', description: '30-year fixed mortgage rate' },
      { name: 'Consumer Sentiment', symbol: 'FRED:UMCSENT', url: 'https://www.tradingview.com/symbols/FRED-UMCSENT/', description: 'UMich consumer sentiment — leading indicator' },
      { name: 'Retail Sales', symbol: 'FRED:RSAFS', url: 'https://www.tradingview.com/symbols/FRED-RSAFS/', description: 'Advance retail sales — consumer spending' },
      { name: 'Existing Home Sales', symbol: 'FRED:EXHOSLUSM495S', url: 'https://www.tradingview.com/symbols/FRED-EXHOSLUSM495S/', description: 'Monthly home sales — housing market activity' },
    ],
  },
  {
    id: 'fed',
    label: 'Fed Balance Sheet',
    emoji: '🏛️',
    charts: [
      { name: 'Fed Balance Sheet', symbol: 'FRED:WALCL', url: 'https://www.tradingview.com/symbols/FRED-WALCL/', description: 'Total assets — QE expansion vs QT contraction' },
      { name: 'M2 Money Supply', symbol: 'FRED:M2SL', url: 'https://www.tradingview.com/symbols/FRED-M2SL/', description: 'Broad money supply — liquidity in the system' },
      { name: 'Overnight Repo (RRP)', symbol: 'FRED:RRPONTSYD', url: 'https://www.tradingview.com/symbols/FRED-RRPONTSYD/', description: 'Overnight reverse repo — excess liquidity indicator' },
    ],
  },
  {
    id: 'credit',
    label: 'Credit & Risk',
    emoji: '⚠️',
    charts: [
      { name: 'HY Spread (OAS)', symbol: 'FRED:BAMLH0A0HYM2', url: 'https://www.tradingview.com/symbols/FRED-BAMLH0A0HYM2/', description: 'High yield bond spread — credit risk barometer' },
      { name: 'IG Spread (OAS)', symbol: 'FRED:BAMLC0A0CM', url: 'https://www.tradingview.com/symbols/FRED-BAMLC0A0CM/', description: 'Investment grade spread — corporate borrowing cost' },
      { name: 'VIX Fear Index', symbol: 'TVC:VIX', url: 'https://www.tradingview.com/symbols/TVC-VIX/', description: 'CBOE volatility index — market fear gauge' },
    ],
  },
  {
    id: 'growth',
    label: 'Economic Growth',
    emoji: '📊',
    charts: [
      { name: 'Real GDP', symbol: 'FRED:GDPC1', url: 'https://www.tradingview.com/symbols/FRED-GDPC1/', description: 'Real GDP — inflation-adjusted economic output' },
      { name: 'GDP QoQ', symbol: 'ECONOMICS:USGDPQQ', url: 'https://www.tradingview.com/symbols/ECONOMICS-USGDPQQ/', description: 'GDP quarter-over-quarter growth rate' },
      { name: 'Industrial Production', symbol: 'FRED:INDPRO', url: 'https://www.tradingview.com/symbols/FRED-INDPRO/', description: 'Manufacturing and industrial output' },
      { name: 'US PMI', symbol: 'ECONOMICS:USMPMI', url: 'https://www.tradingview.com/symbols/ECONOMICS-USMPMI/', description: 'Manufacturing PMI — forward-looking growth signal' },
    ],
  },
  {
    id: 'markets',
    label: 'Markets',
    emoji: '📈',
    charts: [
      { name: 'S&P 500', symbol: 'SPX', url: 'https://www.tradingview.com/symbols/SPX/', description: 'S&P 500 index — US large cap benchmark' },
      { name: 'NASDAQ Composite', symbol: 'IXIC', url: 'https://www.tradingview.com/symbols/IXIC/', description: 'Tech-heavy index — growth sentiment gauge' },
      { name: 'US Dollar Index', symbol: 'TVC:DXY', url: 'https://www.tradingview.com/symbols/TVC-DXY/', description: 'Dollar vs major currencies — global risk appetite' },
      { name: 'Gold', symbol: 'TVC:GOLD', url: 'https://www.tradingview.com/symbols/TVC-GOLD/', description: 'Gold price — inflation hedge & safe haven' },
    ],
  },
];
