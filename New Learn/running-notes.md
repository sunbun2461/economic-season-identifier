current valuation vs historical valuation

valuation + sentiment

### Economic Cycle and the Rate Cycle need these

-Economic Phase
--Growth (GDP / Economy)
-Inflation
-Interest Rates
-Typical Market Behavior
-What Usually Works

===================================================

Future Ideas.

# Claude Planning Mode Prompt — Add “blue-chip opportunity engine” to my Macro Cycle Tracker webapp

You are Claude in **Planning Mode**. I have an existing web app called **Macro Cycle Tracker (Economic Season Identifier)**. It helps me learn macro by labeling the current “economic season” and showing key macro indicators.

I want you to design and plan an **addon feature**: a _thoughtful_ “Blue-Chip Opportunity Engine” that surfaces a small list of **high-quality stocks that are ‘on sale’** relative to recent price action, valuation, and sentiment, _in a way that teaches me_.

This is NOT a high-speed automated trading bot. It’s a **research companion** that outputs a small, explainable watchlist with reasons.

---

## 1) High-level goal

Add a new section/page/module to my app:

### **Opportunity Engine**

- Produces **6–12 candidate stocks** (blue-chip / large cap / quality growth) that are:
    - **Down 10%+ over weeks to months** (configurable time windows)
    - Have **strong/strengthening sentiment** (dominant factor)
    - Include **valuation + fundamentals (P/E, forward P/E, PEG, FCF, margins, growth)** in the reasoning
    - Includes a **sector narrative** explanation (and the app can choose sectors to focus based on macro season)

The output should be a **ranked short list** with:

- stock
- sector
- price-down context (drawdown)
- sentiment summary
- valuation explanation (including what metric is low and why it might be low)
- why it fits the current macro “season”
- risk notes (earnings soon, regulatory, cyclicality, etc.)
- suggested “what to check next” learning prompts for me

---

## 2) Constraints / vibe

- Keep it “slow + thoughtful.” No millisecond streaming. No scanning every stock continuously.
- Runs **on-demand** or daily/weekly refresh with caching.
- I want to learn: the UI should explain **why** a stock looks “cheap” or “on sale.”
- Avoid penny stocks. Focus on **blue chips / high-quality large caps**.
- Do not force perfect precision: the goal is a **high signal watchlist**, not certainty.

---

## 3) Inputs and outputs

### Inputs

- My existing app already computes:
    - “Economic Season” label (macro regime)
    - Some macro indicator values (rates, inflation trend, employment, liquidity proxies, etc.)
- Add to the Opportunity Engine:
    - A stock universe definition (e.g. S&P 500 + Nasdaq 100, or curated list)
    - A small list of sectors/themes that make sense for the current macro season

### Outputs (what the UI should show)

For each candidate stock, show a “Reason Card”:

**Stock Card**

- Ticker + Company Name
- Sector + Industry
- Price action summary:
    - % off 1-month high / 3-month high
    - “Down X% in last Y weeks”
- Sentiment summary:
    - a single score (0–100)
    - and a short explanation: “What’s driving sentiment”
- Valuation block (teaching-focused):
    - P/E, Forward P/E, PEG, P/S (optional), FCF yield (optional)
    - Explain _why it may look cheap_ (e.g. “earnings temporarily depressed”, “multiple compression”, “growth deceleration fear”, “cyclical exposure”, “one-time charges”)
    - Compare to its own history (if possible) or sector median (if feasible)
- Macro alignment:
    - “Why this fits the current economic season”
    - e.g. “falling rates tends to benefit duration / growth”
- Risks / red flags:
    - earnings date proximity
    - legal/regulatory headline risk
    - cyclicality
    - high debt, margin compression, etc.
- Next checks (learning prompts):
    - “Check EPS revisions”
    - “Check margin trend”
    - “Read last earnings call summary”
    - “What would invalidate the thesis?”

Also show a **sector summary panel**:

- sectors picked and why
- how they historically behave in the current season

---

## 4) Core logic (the scoring model)

Build a simple scoring function with 4 pillars:

### Pillar A — Sentiment (dominant)

- News sentiment score (recent 7–30 days) and direction (improving vs declining)
- Optional: analyst upgrades/downgrades / EPS revision trends
- Optional: social sentiment (careful: noisy)

### Pillar B — “On sale” price behavior (10%+ drawdown)

- Down >= 10% over 4–12 weeks
- Prefer “stabilizing” patterns:
    - slowing downside momentum
    - holding above a key level / forming base (optional)
- Avoid parabolic blow-offs or obviously broken charts (keep it simple)

### Pillar C — Valuation + fundamentals

Must include P/E but do not stop there:

- P/E and Forward P/E
- PEG where possible (growth context)
- Gross margin, operating margin
- Revenue growth YoY
- FCF or profitability signal
- Explain how “cheap” is measured:
    - compared to its own 5-year median multiples (ideal)
    - or compared to sector median (ok)
    - or compared to its own recent range

### Pillar D — Macro/sector fit

Use my app’s macro season label to tilt sectors:

- e.g. “Disinflation + falling rates” → growth/tech duration names
- “Reflation / rising rates” → energy/materials/financials tilt
- “Late-cycle” → quality/defensives tilt
- “Early-cycle recovery” → cyclicals tilt

> IMPORTANT: Provide a clear mapping table between macro seasons and sectors/themes.

### Score output

Return a ranked list of candidates with:

- composite score
- sub-scores (sentiment, price, valuation, macro-fit)
- brief reasons per pillar

---

## 5) Universe selection (avoid overwhelming)

Do NOT scan “all stocks.”

Implement universe options:

- **Option 1:** S&P 500 only
- **Option 2:** Nasdaq 100 only
- **Option 3:** Curated “quality growth + blue chips” list (50–200 tickers)
- **Option 4:** Sector-focused list picked from the macro season

Default: start with **S&P 500 + Nasdaq 100** then downselect.

---

## 6) Data sources

Propose at least two implementations:

### Plan A — “Free-ish / easy”

- Use a market data API for:
    - daily OHLC prices (for drawdown)
    - basic fundamentals (P/E, forward P/E)
- Use a news API or RSS + sentiment model for sentiment

### Plan B — “Robust”

- Better fundamentals coverage + historical multiples if possible
- More reliable news coverage

Explain tradeoffs, costs, and what’s realistic.

---

## 7) Backend tasks and caching

- This should run as a **job**:
    - on-demand
    - or daily at market close
- Cache results so the UI loads fast.
- Store:
    - computed scores
    - narrative explanations
    - snapshots of key metrics
- Include “why changed” between runs:
    - “Sentiment improved”
    - “Price stabilized”
    - “Valuation multiple compressed”

---

## 8) UI/UX requirements

Add a new nav item:

- “Opportunities”

Layout:

- Top: macro season summary (existing)
- Next: sector picks and explanation
- Next: ranked stock cards
- Each card expandable into:
    - valuation explanation
    - sentiment sources summary
    - quick chart view (optional)
    - “learning prompts”

Include a “knobs” panel:

- lookback window (4w / 8w / 12w)
- min drawdown (10%, 15%, 20%)
- sentiment weight slider (default high)
- valuation weight slider
- universe selection

---

## 9) Deliverables I want from you (Claude)

In Planning Mode, produce:

1. **Feature spec** (requirements + non-goals)
2. **Data model** (what tables/objects we store)
3. **API design** (endpoints for UI to call)
4. **Scoring algorithm** (with clear pseudocode)
5. **Macro season → sector mapping**
6. **Suggested tech implementation** (Node/Python whatever fits my app)
7. **Phased rollout**
    - Phase 1: minimal version, 20–50 tickers, basic sentiment + P/E + drawdown
    - Phase 2: improved sentiment + more fundamentals + historical multiples
    - Phase 3: “why changed”, alerts, personalization

Be explicit about risks:

- sentiment noise
- fundamentals delays
- lookahead bias if we later backtest
- overfitting

---

## 10) Tone of the output

Make it _teaching-focused_, not finance-bro.
Use clear explanations in plain English.
Every output should answer: **“Why does this look on sale, and what would make that wrong?”**

<!--
i have two extremely large tasks, first I want this site in react. im sorry, but I do. We are going to save and publish this branch. move to a new react branch. make the whole site into react. once that works. overright that onto main, then make a new, portfolio branch, and do the below task, which are quite a massive undertaking.

also, I have another large task. To build a /portfolio section of the site. This is where it gets interesting. I want a section where, for now, it's just me, but eventually, the site will have a login, and you will be able to see everything, most of the content will be behind a paywall, or something. for now, it's mostly about the portfolio, but really well probably hide 95% of the site, and anyway I've secured a supabase project, with which we are going to create and design and portfolio page, where i / a user can add all of their portfolio, so stocks, etfs, cryptos, how much cash they have, and the portfolio total will be display interactively as a pie, similar to the pie on the /playbook Allocation page, and
you tell me if I need to choose any of the things from App Frameworks or do anything with supabase, or if you can handle it all with the info I've presented you with. there will be sections and fields like : "add an investment type" or add an account, well like a then a dropdown for the type of account, crypto, savings, stock, commodity, etf, literally every type should be there. It will tell you on the interactive pie chart the percentage of your porfolio that it is, and you will put how many shares, but you can choose an updating automatically portfolio, vs a static, where you simply put the total, and that will update on a regular basis, as in the stock price data will be looked at and used as infomation to update the portfolio, so we probably need some sort of api and system the maeks sure you are entering a real asset that exists, or else it needs to go in other, so error message will say that. there should be a button that says something like , 'start tracking now' so that after you have everything you want in there, the total is stored and tracked and weekly reports how much you have gained or lost by the week. this is some sort of state management or some sort of loop forever running system. we may have to speak about this.

eventually Id like to put this app I think on render, and netlifly and basically if I wanted it could be sold, access could be sold. like trading view. you could say, but no trading of course.

all of these will be stored in supabase. you make the tables and columns and joins where needed.

supabase.
https://eaisuwnrzzfiwldwzmzg.supabase.co
sb_publishable_P96mLc65B4nEiqRwJ7NEeg_cTTG-2vX
anon key : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaXN1d25yenpmaXdsZHd6bXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDc3NjgsImV4cCI6MjA4ODEyMzc2OH0.Ssqc5TqfQrtcSQF935pnudU1YP1VBl66xQFdC_V79dU

(get supabase image from /New Learn/supabase-img.png) -->
