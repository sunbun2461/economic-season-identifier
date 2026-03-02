import type { GlossaryTerm } from '../types.js';

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Fed Funds Rate',
    definition: 'The interest rate at which banks lend to each other overnight. Set by the Federal Reserve via the FOMC. The most powerful lever in the US financial system.',
    analogy: 'Think of it as the thermostat of the economy — the Fed turns it up to cool inflation, down to warm up growth.',
  },
  {
    term: 'Yield',
    definition: 'The annual return an investor receives from a bond, expressed as a percentage of its price. Yield and price move inversely — when prices rise, yields fall.',
    analogy: 'If you buy a $1,000 bond paying $50/year and the price rises to $1,100, your yield dropped. You\'re getting the same $50 on a higher price.',
  },
  {
    term: 'Spread',
    definition: 'The difference in yield between two bonds. Usually expressed in basis points. Spreads measure risk premium — how much extra yield investors demand for taking on risk.',
    analogy: 'A highway with two lanes: the safe "Treasury lane" and the "corporate lane." The spread is the toll you\'re paid extra for the bumpier corporate lane.',
  },
  {
    term: 'Treasury Bills (T-Bills)',
    definition: 'Short-term US government debt maturing in 4 weeks to 1 year. Considered the closest thing to risk-free. Yields closely track the Fed Funds rate.',
    analogy: 'Lending your lunch money to the government until Friday — you\'re getting it back guaranteed, plus a little interest.',
  },
  {
    term: 'Treasury Notes',
    definition: 'Medium-term US government debt with maturities of 2, 3, 5, 7, or 10 years. The 10-year note is the global benchmark rate.',
    analogy: 'A multi-year loan to the most creditworthy borrower in the world. Your repayment is locked in for years.',
  },
  {
    term: 'Treasury Bonds',
    definition: 'Long-term US government debt maturing in 20 or 30 years. Highly sensitive to interest rate changes. More volatile than notes.',
    analogy: 'Locking in a 30-year mortgage at today\'s rate. Great if rates rise, painful if they fall further.',
  },
  {
    term: 'Yield Curve',
    definition: 'A line showing interest rates across different maturities, from short-term bills to long-term bonds. Normally slopes upward (longer = higher yield). When it inverts, it\'s historically a recession predictor.',
    analogy: 'Like a restaurant\'s time discount: normally you pay more for a longer reservation. When short-term reservations cost more than long ones, something strange is happening.',
  },
  {
    term: 'Yield Curve Inversion',
    definition: 'When short-term rates exceed long-term rates (e.g., 2-year yield > 10-year yield). Has preceded every US recession since 1970. Signals market expects future rate cuts.',
    analogy: 'When one-year CDs pay more than five-year CDs, it means the market thinks rates are going down soon — usually because trouble is coming.',
  },
  {
    term: 'Basis Points (bps)',
    definition: '1/100th of 1 percent. 100 bps = 1%. Used to describe rate moves precisely. A "25bp hike" means the rate went up 0.25%.',
    analogy: 'Like measuring in millimeters instead of centimeters — more precise for small changes.',
  },
  {
    term: 'FOMC',
    definition: 'Federal Open Market Committee. The body within the Federal Reserve that sets monetary policy, including the Fed Funds target rate. Meets 8 times per year.',
    analogy: 'The 12-person board meeting where the price of money gets decided for the next 6-8 weeks.',
  },
  {
    term: 'Dot Plot',
    definition: 'A chart released quarterly by the Fed showing each FOMC member\'s anonymous projection for where interest rates will be over the next few years. Highly watched by markets.',
    analogy: 'A survey of Fed officials asking "where do you think rates will be?" — each answer is a dot on the chart.',
  },
  {
    term: 'SEP (Summary of Economic Projections)',
    definition: 'Released quarterly with select FOMC meetings. Contains official Fed projections for GDP, unemployment, inflation, and interest rates (including the dot plot).',
    analogy: 'The Fed\'s quarterly report card and forecast — here\'s what we think the economy will do and here\'s how we plan to respond.',
  },
  {
    term: 'QE (Quantitative Easing)',
    definition: 'When the Fed buys bonds (usually Treasuries and mortgage-backed securities) to inject money into the financial system. Expands the Fed\'s balance sheet. Used when rates hit zero.',
    analogy: 'The Fed printing money and using it to buy bonds from banks, giving them cash to lend when normal rate cuts are maxed out.',
  },
  {
    term: 'QT (Quantitative Tightening)',
    definition: 'The opposite of QE. The Fed lets bonds mature without reinvesting (or actively sells) to shrink its balance sheet and remove money from the system.',
    analogy: 'The Fed letting the bonds it bought drain out naturally, reducing the money it injected during QE.',
  },
  {
    term: 'CPI (Consumer Price Index)',
    definition: 'Measures price changes in a basket of consumer goods and services. The most commonly cited inflation measure. "Core CPI" excludes food and energy.',
    analogy: 'Your grocery receipt, rent, utilities, and car costs — all averaged together to measure how much more everything costs than last year.',
  },
  {
    term: 'PCE (Personal Consumption Expenditures)',
    definition: "The Fed's preferred inflation gauge. Broader than CPI, accounts for substitution behavior, and covers more services. Core PCE is the Fed's 2% target.",
    analogy: 'A more sophisticated grocery receipt that adjusts for the fact that when steak gets expensive, you might switch to chicken.',
  },
  {
    term: 'NFP (Nonfarm Payrolls)',
    definition: 'Monthly report of net jobs added to the US economy, excluding farm workers and some others. Released the first Friday of each month. One of the most market-moving reports.',
    analogy: 'The most important report card for the US job market — everyone waits for it every month.',
  },
  {
    term: 'Neutral Rate',
    definition: 'The theoretical interest rate that neither stimulates nor restricts economic growth. The Fed estimates it around 2.5%. Rates above = restrictive. Below = accommodative.',
    analogy: 'The Goldilocks setting for the economy\'s thermostat — not too hot, not too cold.',
  },
  {
    term: 'Dual Mandate',
    definition: "The Fed's two congressionally assigned goals: maximum employment and stable prices (2% inflation). These objectives sometimes conflict.",
    analogy: 'The Fed has two bosses with conflicting priorities: the labor department wants jobs, and the Treasury wants stable prices.',
  },
  {
    term: 'Duration',
    definition: 'A measure of a bond\'s sensitivity to interest rate changes. Higher duration = more price movement per rate change. A 20-year bond has much higher duration than a 2-year note.',
    analogy: 'A long-armed lever — small interest rate moves create large price swings for high-duration bonds.',
  },
  {
    term: 'Real Rate',
    definition: 'The interest rate after adjusting for inflation. Real Rate = Nominal Rate - Inflation. A 5% rate with 4% inflation = 1% real rate. Real rates drive actual borrowing behavior.',
    analogy: 'What you\'re actually earning in purchasing power, not just dollars. A 5% savings account during 6% inflation means you\'re losing ground.',
  },
  {
    term: 'Nominal Rate',
    definition: 'The stated interest rate, not adjusted for inflation. What you see on your savings account, mortgage, or bond. Subtract inflation to get the real rate.',
    analogy: 'The number on the sticker — not accounting for what money actually buys.',
  },
  {
    term: 'Breakeven Inflation',
    definition: "The market's implied inflation expectation derived from comparing regular Treasury yields to TIPS yields. If 10Y Treasury yields 4.5% and TIPS yield 2%, breakeven = 2.5%.",
    analogy: 'The inflation rate at which buying TIPS vs regular Treasuries becomes a wash — below this, regular bonds win; above, TIPS win.',
  },
  {
    term: 'TIPS (Treasury Inflation-Protected Securities)',
    definition: 'US government bonds whose principal adjusts with inflation. As CPI rises, the principal grows. Protects purchasing power in inflationary environments.',
    analogy: 'A savings account that gets bigger every time prices go up — your money keeps pace with inflation by design.',
  },
  {
    term: 'High Yield Spread',
    definition: 'The extra yield demanded by investors to hold "junk" bonds (rated BB or lower) over equivalent Treasuries. Widens during stress, narrows during risk-on periods.',
    analogy: 'The "junk bond tax" — how much extra return the market demands to lend to risky companies vs lending to the US government.',
  },
  {
    term: 'Credit Spread',
    definition: 'The yield difference between corporate bonds and equivalent-maturity Treasuries. Measures the market\'s assessment of corporate credit risk. Investment grade = tight spreads; high yield = wide.',
    analogy: 'The interest rate premium you charge someone with bad credit vs someone with perfect credit for the same loan size.',
  },
  {
    term: 'Insurance Cut',
    definition: 'A rate cut made preemptively to extend an expansion, not in response to a recession. The Fed "insures" against downside. 1995, 1998, and 2019 are classic examples.',
    analogy: 'Buying insurance before your house burns down. A few small cuts to keep the expansion going, not a desperate response to collapse.',
  },
  {
    term: 'Soft Landing',
    definition: 'The rare achievement of reducing inflation without causing a recession. The Fed raises rates enough to cool prices but not so much that unemployment spikes sharply.',
    analogy: 'Landing a 747 on a short runway — the ideal outcome, but it takes perfect timing and skill.',
  },
  {
    term: 'Hard Landing',
    definition: 'When the Fed\'s rate hikes cause a recession. Unemployment rises significantly, GDP contracts, credit conditions tighten sharply. The "bad" outcome of tightening.',
    analogy: 'The landing where bags fall from overhead bins — painful, recovery takes time.',
  },
  {
    term: 'Stagflation',
    definition: 'The worst of both worlds: rising inflation AND rising unemployment simultaneously. Makes the Fed\'s dual mandate impossible — can\'t fight both at once. 1970s was the classic case.',
    analogy: 'Your house is on fire AND flooding simultaneously — every action you take to solve one makes the other worse.',
  },
  {
    term: 'Risk Premium',
    definition: 'The extra return investors demand above the risk-free rate (Treasuries) for taking on risk. Higher risk = higher premium demanded. Drives corporate bond spreads and equity valuations.',
    analogy: 'The "danger pay" built into risky investments — the riskier the job, the more you demand to take it on.',
  },
  {
    term: 'Flight to Safety',
    definition: 'When investors sell risky assets (stocks, high yield bonds) and buy safe assets (Treasuries, gold) during market stress. Causes Treasury prices to surge and yields to drop.',
    analogy: 'Everyone leaving a crowded party through the emergency exit — the door (Treasuries) gets jammed because everyone wants through it at once.',
  },
  {
    term: 'Risk-On / Risk-Off',
    definition: 'Market sentiment states. Risk-On: investors buy equities, high yield, EM, commodities. Risk-Off: they flee to Treasuries, gold, cash, Swiss franc. Fed policy is the biggest driver.',
    analogy: 'The emotional temperature of the market — investors are either feeling brave (risk-on) or scared (risk-off).',
  },
  {
    term: 'Leading vs Lagging Indicators',
    definition: 'Leading indicators predict future economic activity (yield curve, jobless claims, PMI). Lagging indicators confirm what already happened (unemployment, CPI, GDP). Investing based on laggards means acting on old news.',
    analogy: 'Leading: the weather forecast. Lagging: looking out the window after it\'s already raining. Good investors watch the forecast.',
  },
  {
    term: 'Fed Put',
    definition: 'The market belief that the Fed will cut rates or ease policy to rescue markets when stocks fall sharply. Named after the "put option" — a financial instrument that protects against price drops.',
    analogy: 'A safety net under the stock market — the belief that if prices fall too far, the Fed will catch them with rate cuts.',
  },
];
