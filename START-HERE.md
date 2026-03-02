# START HERE

## 1. Install Node.js
- https://nodejs.org → download LTS (v20+)
- Verify: `node --version` → v20.x.x+

## 2. Get a FRED API Key (free)
- https://fred.stlouisfed.org/docs/api/api_key.html
- Create account → copy your key

## 3. Setup
```bash
cd economic_season_identifier
npm install
cp .env.example .env
# Edit .env → paste your FRED key
```

## 4. Run
```bash
npm run dev
# Open http://localhost:3000
```

## Other Commands
```bash
npm run dev              # Start the app
npx tsx src/cli.ts       # Terminal summary (no browser)
npx tsx src/cli.ts --refresh  # Force fresh data
```

## Troubleshooting
- **"Module not found"** → `npm install`
- **"FRED_API_KEY not set"** → check `.env` file has your key
- **Port 3000 in use** → kill the existing process: `lsof -ti :3000 | xargs kill -9`, then retry. Or use a different port: `PORT=3001 npm run dev`
- **Stale data** → click refresh button in UI or use `--refresh` flag

## What Am I Looking At?

The bar at the top shows 8 economic phases. The highlighted one is **NOW**.

```
🌱 Spring = Recovery    ☀️ Summer = Peak
🍂 Autumn = Tightening  ❄️ Winter = Downturn
```

Each season has an **Early** and **Late** phase — 8 total.

The app fetches live data from the St. Louis Fed (FRED) and classifies the current moment in the economic cycle using weighted indicator scoring.

The **Playbook** tab tells you what to buy, sell, and hold in each phase based on historical patterns.

> ⚠️ Educational only. Not financial advice.
