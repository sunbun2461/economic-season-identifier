# Macro Economic Cycle Tracker

Track where we are in the economic cycle and get portfolio guidance.

## Concept

The economy moves in cycles — Spring (recovery), Summer (peak), Autumn (tightening), Winter (contraction). Each season has an early and late phase = 8 total positions.

This app fetches live data from the FRED API (St. Louis Fed), classifies the current phase using weighted indicator scoring, and provides phase-appropriate portfolio recommendations.

## Tech Stack

- **Backend:** Node.js + Express + TypeScript (via `tsx`)
- **Frontend:** Vanilla HTML + Tailwind CSS (CDN) — no build step
- **Data:** FRED API + hardcoded reference data (rate history, FOMC calendar)
- **Cache:** File-based JSON (4-hour TTL)

## Quick Start

See [START-HERE.md](./START-HERE.md)

## Pages

| Page | Description |
|------|-------------|
| `/` | Dashboard — current season, rates, indicators, prediction |
| `/history.html` | 35 years of Fed rate decisions |
| `/charts.html` | TradingView chart links organized by category |
| `/playbook.html` | Portfolio recommendations for current phase |
| `/learn.html` | Visual cheat sheets + economic glossary |

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/data` | Current macro snapshot + season classification + portfolio rec |
| `GET /api/history` | 35-year rate decision array |
| `GET /api/refresh` | Bust cache and re-fetch from FRED |

## Data Sources

- [FRED API](https://fred.stlouisfed.org/docs/api/fred/) — Federal Reserve Economic Data
- FOMC calendar hardcoded for 2026
- Rate history hardcoded 1990–2026

## Disclaimer

Educational only. Not financial advice. Historical patterns from public data. Past performance ≠ future results. Do your own research. Consult a financial advisor.
