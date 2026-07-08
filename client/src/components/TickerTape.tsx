import { useEffect, useRef } from 'react';

const SYMBOLS = [
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'DJ:DJI', title: 'Dow Jones' },
  { proName: 'FOREXCOM:NSXUSD', title: 'NASDAQ 100' },
  { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
  { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
  { proName: 'COINBASE:SOLUSD', title: 'Solana' },
  { proName: 'COINBASE:SUIUSD', title: 'SUI' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'TVC:US10Y', title: '10Y Yield' },
  { proName: 'ECONOMICS:USINTR', title: 'Fed Rate' },
  { proName: 'FOREXCOM:DXY', title: 'US Dollar' },
];

export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en',
    });
    container.appendChild(script);

    return () => { container.innerHTML = ''; };
  }, []);

  return (
    <div className="ticker-bar">
      <div ref={containerRef} className="tradingview-widget-container" style={{ height: 46 }} />
    </div>
  );
}
