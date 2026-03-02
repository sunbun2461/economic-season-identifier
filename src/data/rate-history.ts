import type { RateDecision } from '../types.js';

// 35 years of major Fed rate decisions, 1990-2026
// rateBefore/rateAfter = midpoint of target range
export const rateHistory: RateDecision[] = [
  // === 1990-1992: Greenspan — Recession cycle ===
  { date: '1990-07-13', chair: 'Greenspan', rateBefore: 8.25, rateAfter: 8.00, direction: 'cut', bps: 25, note: 'Gulf War jitters, slowing growth', season: 'autumn', phase: 'early' },
  { date: '1990-10-29', chair: 'Greenspan', rateBefore: 8.00, rateAfter: 7.75, direction: 'cut', bps: 25, note: 'Recession fears deepening', season: 'autumn', phase: 'late' },
  { date: '1990-11-14', chair: 'Greenspan', rateBefore: 7.75, rateAfter: 7.50, direction: 'cut', bps: 25, note: 'Gulf War recession', season: 'winter', phase: 'early' },
  { date: '1990-12-18', chair: 'Greenspan', rateBefore: 7.50, rateAfter: 7.25, direction: 'cut', bps: 25, note: 'Recession confirmed', season: 'winter', phase: 'early' },
  { date: '1991-01-08', chair: 'Greenspan', rateBefore: 7.25, rateAfter: 6.75, direction: 'cut', bps: 50, note: 'Gulf War underway', season: 'winter', phase: 'early', isEmergency: true },
  { date: '1991-02-01', chair: 'Greenspan', rateBefore: 6.75, rateAfter: 6.25, direction: 'cut', bps: 50, note: 'Recession deepening', season: 'winter', phase: 'early' },
  { date: '1991-03-08', chair: 'Greenspan', rateBefore: 6.25, rateAfter: 6.00, direction: 'cut', bps: 25, note: 'Unemployment rising', season: 'winter', phase: 'early' },
  { date: '1991-04-30', chair: 'Greenspan', rateBefore: 6.00, rateAfter: 5.75, direction: 'cut', bps: 25, note: 'Continued easing', season: 'winter', phase: 'late' },
  { date: '1991-08-06', chair: 'Greenspan', rateBefore: 5.75, rateAfter: 5.50, direction: 'cut', bps: 25, note: 'Sluggish recovery', season: 'winter', phase: 'late' },
  { date: '1991-09-13', chair: 'Greenspan', rateBefore: 5.50, rateAfter: 5.25, direction: 'cut', bps: 25, note: 'Weak employment', season: 'spring', phase: 'early' },
  { date: '1991-10-31', chair: 'Greenspan', rateBefore: 5.25, rateAfter: 5.00, direction: 'cut', bps: 25, note: 'Continued support', season: 'spring', phase: 'early' },
  { date: '1991-11-06', chair: 'Greenspan', rateBefore: 5.00, rateAfter: 4.75, direction: 'cut', bps: 25, note: 'Weak recovery', season: 'spring', phase: 'early' },
  { date: '1991-12-20', chair: 'Greenspan', rateBefore: 4.75, rateAfter: 4.00, direction: 'cut', bps: 75, note: 'Credit crunch concerns — 75bp cut', season: 'spring', phase: 'early' },
  { date: '1992-04-09', chair: 'Greenspan', rateBefore: 4.00, rateAfter: 3.75, direction: 'cut', bps: 25, note: 'Still-weak recovery', season: 'spring', phase: 'early' },
  { date: '1992-07-02', chair: 'Greenspan', rateBefore: 3.75, rateAfter: 3.25, direction: 'cut', bps: 50, note: 'Jobless recovery', season: 'spring', phase: 'early' },
  { date: '1992-09-04', chair: 'Greenspan', rateBefore: 3.25, rateAfter: 3.00, direction: 'cut', bps: 25, note: 'Final cut of cycle', season: 'spring', phase: 'early' },

  // === 1994-1995: Greenspan — The Bond Massacre ===
  { date: '1994-02-04', chair: 'Greenspan', rateBefore: 3.00, rateAfter: 3.25, direction: 'hike', bps: 25, note: 'Preemptive hike — shocked markets (Bond Massacre)', season: 'summer', phase: 'late', isEmergency: false },
  { date: '1994-03-22', chair: 'Greenspan', rateBefore: 3.25, rateAfter: 3.50, direction: 'hike', bps: 25, note: 'Continued tightening', season: 'summer', phase: 'late' },
  { date: '1994-04-18', chair: 'Greenspan', rateBefore: 3.50, rateAfter: 3.75, direction: 'hike', bps: 25, note: 'Inter-meeting hike', season: 'summer', phase: 'late', isEmergency: true },
  { date: '1994-05-17', chair: 'Greenspan', rateBefore: 3.75, rateAfter: 4.25, direction: 'hike', bps: 50, note: '50bp acceleration', season: 'autumn', phase: 'early' },
  { date: '1994-08-16', chair: 'Greenspan', rateBefore: 4.25, rateAfter: 4.75, direction: 'hike', bps: 50, note: 'Continued tightening', season: 'autumn', phase: 'early' },
  { date: '1994-11-15', chair: 'Greenspan', rateBefore: 4.75, rateAfter: 5.50, direction: 'hike', bps: 75, note: '75bp hike — aggressive', season: 'autumn', phase: 'late' },
  { date: '1995-02-01', chair: 'Greenspan', rateBefore: 5.50, rateAfter: 6.00, direction: 'hike', bps: 50, note: 'Final hike of cycle — peak 6.00%', season: 'autumn', phase: 'late' },

  // === 1995-1996: Insurance Cuts ===
  { date: '1995-07-06', chair: 'Greenspan', rateBefore: 6.00, rateAfter: 5.75, direction: 'cut', bps: 25, note: 'Insurance cut #1 — economy slowing', season: 'spring', phase: 'early' },
  { date: '1995-12-19', chair: 'Greenspan', rateBefore: 5.75, rateAfter: 5.50, direction: 'cut', bps: 25, note: 'Insurance cut #2', season: 'spring', phase: 'early' },
  { date: '1996-01-31', chair: 'Greenspan', rateBefore: 5.50, rateAfter: 5.25, direction: 'cut', bps: 25, note: 'Insurance cut #3 — "soft landing" achieved', season: 'spring', phase: 'late' },

  // === 1997: Hold ===
  { date: '1997-03-25', chair: 'Greenspan', rateBefore: 5.25, rateAfter: 5.50, direction: 'hike', bps: 25, note: 'One hike — preemptive inflation control', season: 'summer', phase: 'late' },

  // === 1998: Russia/LTCM Cuts ===
  { date: '1998-09-29', chair: 'Greenspan', rateBefore: 5.50, rateAfter: 5.25, direction: 'cut', bps: 25, note: 'Russia default + LTCM collapse', season: 'summer', phase: 'late', isEmergency: true },
  { date: '1998-10-15', chair: 'Greenspan', rateBefore: 5.25, rateAfter: 5.00, direction: 'cut', bps: 25, note: 'Inter-meeting cut', season: 'autumn', phase: 'early', isEmergency: true },
  { date: '1998-11-17', chair: 'Greenspan', rateBefore: 5.00, rateAfter: 4.75, direction: 'cut', bps: 25, note: 'Final insurance cut', season: 'autumn', phase: 'early' },

  // === 1999-2000: Dot-com peak hikes ===
  { date: '1999-06-30', chair: 'Greenspan', rateBefore: 4.75, rateAfter: 5.00, direction: 'hike', bps: 25, note: 'Dot-com boom, tightening begins', season: 'summer', phase: 'late' },
  { date: '1999-08-24', chair: 'Greenspan', rateBefore: 5.00, rateAfter: 5.25, direction: 'hike', bps: 25, note: 'Y2K prep + dot-com bubble', season: 'autumn', phase: 'early' },
  { date: '1999-11-16', chair: 'Greenspan', rateBefore: 5.25, rateAfter: 5.50, direction: 'hike', bps: 25, note: 'Y2K concerns resolved', season: 'autumn', phase: 'early' },
  { date: '2000-02-02', chair: 'Greenspan', rateBefore: 5.50, rateAfter: 5.75, direction: 'hike', bps: 25, note: 'Dot-com peak. Nasdaq at ATH.', season: 'autumn', phase: 'late' },
  { date: '2000-03-21', chair: 'Greenspan', rateBefore: 5.75, rateAfter: 6.00, direction: 'hike', bps: 25, note: 'Continued tightening', season: 'autumn', phase: 'late' },
  { date: '2000-05-16', chair: 'Greenspan', rateBefore: 6.00, rateAfter: 6.50, direction: 'hike', bps: 50, note: 'Peak rate — 6.50%. Dot-com about to burst.', season: 'autumn', phase: 'late' },

  // === 2001-2003: Dot-com Bust + 9/11 ===
  { date: '2001-01-03', chair: 'Greenspan', rateBefore: 6.50, rateAfter: 6.00, direction: 'cut', bps: 50, note: 'Emergency inter-meeting cut. Nasdaq collapsing.', season: 'winter', phase: 'early', isEmergency: true },
  { date: '2001-01-31', chair: 'Greenspan', rateBefore: 6.00, rateAfter: 5.50, direction: 'cut', bps: 50, note: 'Rapid easing', season: 'winter', phase: 'early' },
  { date: '2001-03-20', chair: 'Greenspan', rateBefore: 5.50, rateAfter: 5.00, direction: 'cut', bps: 50, note: 'Recession confirmed', season: 'winter', phase: 'early' },
  { date: '2001-04-18', chair: 'Greenspan', rateBefore: 5.00, rateAfter: 4.50, direction: 'cut', bps: 50, note: 'Inter-meeting cut', season: 'winter', phase: 'early', isEmergency: true },
  { date: '2001-05-15', chair: 'Greenspan', rateBefore: 4.50, rateAfter: 4.00, direction: 'cut', bps: 50, note: 'Continued easing', season: 'winter', phase: 'early' },
  { date: '2001-06-27', chair: 'Greenspan', rateBefore: 4.00, rateAfter: 3.75, direction: 'cut', bps: 25, note: 'Slowing cuts', season: 'winter', phase: 'late' },
  { date: '2001-08-21', chair: 'Greenspan', rateBefore: 3.75, rateAfter: 3.50, direction: 'cut', bps: 25, note: 'Pre-9/11', season: 'winter', phase: 'late' },
  { date: '2001-09-17', chair: 'Greenspan', rateBefore: 3.50, rateAfter: 3.00, direction: 'cut', bps: 50, note: '9/11 emergency cut', season: 'winter', phase: 'late', isEmergency: true },
  { date: '2001-10-02', chair: 'Greenspan', rateBefore: 3.00, rateAfter: 2.50, direction: 'cut', bps: 50, note: 'Post-9/11 support', season: 'winter', phase: 'late' },
  { date: '2001-11-06', chair: 'Greenspan', rateBefore: 2.50, rateAfter: 2.00, direction: 'cut', bps: 50, note: 'Aggressive easing', season: 'winter', phase: 'late' },
  { date: '2001-12-11', chair: 'Greenspan', rateBefore: 2.00, rateAfter: 1.75, direction: 'cut', bps: 25, note: 'Slowdown in cuts', season: 'winter', phase: 'late' },
  { date: '2002-11-06', chair: 'Greenspan', rateBefore: 1.75, rateAfter: 1.25, direction: 'cut', bps: 50, note: 'Jobless recovery concerns', season: 'spring', phase: 'early' },
  { date: '2003-06-25', chair: 'Greenspan', rateBefore: 1.25, rateAfter: 1.00, direction: 'cut', bps: 25, note: 'Deflation fears. Final cut — 1.00% floor.', season: 'spring', phase: 'early' },

  // === 2004-2006: "Measured Pace" hikes ===
  { date: '2004-06-30', chair: 'Greenspan', rateBefore: 1.00, rateAfter: 1.25, direction: 'hike', bps: 25, note: 'Gradual tightening begins. "Measured pace."', season: 'summer', phase: 'late' },
  { date: '2004-08-10', chair: 'Greenspan', rateBefore: 1.25, rateAfter: 1.50, direction: 'hike', bps: 25, note: 'Measured pace +25bp', season: 'summer', phase: 'late' },
  { date: '2004-09-21', chair: 'Greenspan', rateBefore: 1.50, rateAfter: 1.75, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'early' },
  { date: '2004-11-10', chair: 'Greenspan', rateBefore: 1.75, rateAfter: 2.00, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'early' },
  { date: '2004-12-14', chair: 'Greenspan', rateBefore: 2.00, rateAfter: 2.25, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'early' },
  { date: '2005-02-02', chair: 'Greenspan', rateBefore: 2.25, rateAfter: 2.50, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'early' },
  { date: '2005-03-22', chair: 'Greenspan', rateBefore: 2.50, rateAfter: 2.75, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'early' },
  { date: '2005-05-03', chair: 'Greenspan', rateBefore: 2.75, rateAfter: 3.00, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'early' },
  { date: '2005-06-30', chair: 'Greenspan', rateBefore: 3.00, rateAfter: 3.25, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'early' },
  { date: '2005-08-09', chair: 'Greenspan', rateBefore: 3.25, rateAfter: 3.50, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'late' },
  { date: '2005-09-20', chair: 'Greenspan', rateBefore: 3.50, rateAfter: 3.75, direction: 'hike', bps: 25, note: 'Measured pace (Katrina impact minimal)', season: 'autumn', phase: 'late' },
  { date: '2005-11-01', chair: 'Greenspan', rateBefore: 3.75, rateAfter: 4.00, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'late' },
  { date: '2005-12-13', chair: 'Greenspan', rateBefore: 4.00, rateAfter: 4.25, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'late' },
  { date: '2006-01-31', chair: 'Bernanke', rateBefore: 4.25, rateAfter: 4.50, direction: 'hike', bps: 25, note: "Bernanke's first meeting", season: 'autumn', phase: 'late' },
  { date: '2006-03-28', chair: 'Bernanke', rateBefore: 4.50, rateAfter: 4.75, direction: 'hike', bps: 25, note: 'Measured pace continues', season: 'autumn', phase: 'late' },
  { date: '2006-05-10', chair: 'Bernanke', rateBefore: 4.75, rateAfter: 5.00, direction: 'hike', bps: 25, note: 'Measured pace', season: 'autumn', phase: 'late' },
  { date: '2006-06-29', chair: 'Bernanke', rateBefore: 5.00, rateAfter: 5.25, direction: 'hike', bps: 25, note: 'Final hike — 5.25%. Housing bubble peaking.', season: 'autumn', phase: 'late' },

  // === 2007-2008: Financial Crisis ===
  { date: '2007-09-18', chair: 'Bernanke', rateBefore: 5.25, rateAfter: 4.75, direction: 'cut', bps: 50, note: 'Subprime crisis emerges. 50bp cut shocks expectations.', season: 'winter', phase: 'early' },
  { date: '2007-10-31', chair: 'Bernanke', rateBefore: 4.75, rateAfter: 4.50, direction: 'cut', bps: 25, note: 'Credit crunch deepening', season: 'winter', phase: 'early' },
  { date: '2007-12-11', chair: 'Bernanke', rateBefore: 4.50, rateAfter: 4.25, direction: 'cut', bps: 25, note: 'Markets wanted more', season: 'winter', phase: 'early' },
  { date: '2008-01-22', chair: 'Bernanke', rateBefore: 4.25, rateAfter: 3.50, direction: 'cut', bps: 75, note: 'Emergency 75bp cut — global markets crashing', season: 'winter', phase: 'early', isEmergency: true },
  { date: '2008-01-30', chair: 'Bernanke', rateBefore: 3.50, rateAfter: 3.00, direction: 'cut', bps: 50, note: '50bp more', season: 'winter', phase: 'early' },
  { date: '2008-03-18', chair: 'Bernanke', rateBefore: 3.00, rateAfter: 2.25, direction: 'cut', bps: 75, note: 'Bear Stearns collapse. 75bp cut.', season: 'winter', phase: 'early', isEmergency: true },
  { date: '2008-04-30', chair: 'Bernanke', rateBefore: 2.25, rateAfter: 2.00, direction: 'cut', bps: 25, note: 'Slowing cuts', season: 'winter', phase: 'early' },
  { date: '2008-10-08', chair: 'Bernanke', rateBefore: 2.00, rateAfter: 1.50, direction: 'cut', bps: 50, note: 'Global coordinated cut — Lehman aftermath', season: 'winter', phase: 'early', isEmergency: true },
  { date: '2008-10-29', chair: 'Bernanke', rateBefore: 1.50, rateAfter: 1.00, direction: 'cut', bps: 50, note: 'Crisis deepening', season: 'winter', phase: 'early' },
  { date: '2008-12-16', chair: 'Bernanke', rateBefore: 1.00, rateAfter: 0.125, direction: 'cut', bps: 87, note: 'ZLB — 0-0.25% range. QE begins. Financial crisis floor.', season: 'winter', phase: 'late' },

  // === 2015-2018: Normalization (Yellen → Powell) ===
  { date: '2015-12-16', chair: 'Yellen', rateBefore: 0.125, rateAfter: 0.375, direction: 'hike', bps: 25, note: 'First hike in 9 years. "Liftoff."', season: 'spring', phase: 'late' },
  { date: '2016-12-14', chair: 'Yellen', rateBefore: 0.375, rateAfter: 0.625, direction: 'hike', bps: 25, note: '12 months between hikes', season: 'summer', phase: 'early' },
  { date: '2017-03-15', chair: 'Yellen', rateBefore: 0.625, rateAfter: 0.875, direction: 'hike', bps: 25, note: 'Pace picking up', season: 'summer', phase: 'early' },
  { date: '2017-06-14', chair: 'Yellen', rateBefore: 0.875, rateAfter: 1.125, direction: 'hike', bps: 25, note: 'QT announced', season: 'summer', phase: 'early' },
  { date: '2017-12-13', chair: 'Yellen', rateBefore: 1.125, rateAfter: 1.375, direction: 'hike', bps: 25, note: "Yellen's final hike", season: 'summer', phase: 'late' },
  { date: '2018-03-21', chair: 'Powell', rateBefore: 1.375, rateAfter: 1.625, direction: 'hike', bps: 25, note: "Powell's first meeting", season: 'summer', phase: 'late' },
  { date: '2018-06-13', chair: 'Powell', rateBefore: 1.625, rateAfter: 1.875, direction: 'hike', bps: 25, note: 'Strong economy', season: 'autumn', phase: 'early' },
  { date: '2018-09-26', chair: 'Powell', rateBefore: 1.875, rateAfter: 2.125, direction: 'hike', bps: 25, note: 'Strong jobs, rising inflation', season: 'autumn', phase: 'early' },
  { date: '2018-12-19', chair: 'Powell', rateBefore: 2.125, rateAfter: 2.375, direction: 'hike', bps: 25, note: 'Markets crashed 20%. Powell later pivoted.', season: 'autumn', phase: 'late' },

  // === 2019: Insurance Cuts ===
  { date: '2019-07-31', chair: 'Powell', rateBefore: 2.375, rateAfter: 2.125, direction: 'cut', bps: 25, note: 'Insurance cut #1. Trade war + slowdown.', season: 'spring', phase: 'early' },
  { date: '2019-09-18', chair: 'Powell', rateBefore: 2.125, rateAfter: 1.875, direction: 'cut', bps: 25, note: 'Insurance cut #2', season: 'spring', phase: 'early' },
  { date: '2019-10-30', chair: 'Powell', rateBefore: 1.875, rateAfter: 1.625, direction: 'cut', bps: 25, note: 'Insurance cut #3. Economy stabilizing.', season: 'spring', phase: 'late' },

  // === 2020: COVID ===
  { date: '2020-03-03', chair: 'Powell', rateBefore: 1.625, rateAfter: 1.125, direction: 'cut', bps: 50, note: 'COVID emergency cut #1', season: 'winter', phase: 'early', isEmergency: true },
  { date: '2020-03-15', chair: 'Powell', rateBefore: 1.125, rateAfter: 0.125, direction: 'cut', bps: 100, note: 'COVID emergency 100bp to ZLB. Massive QE.', season: 'winter', phase: 'early', isEmergency: true },

  // === 2022-2023: Fastest tightening in 40 years ===
  { date: '2022-03-17', chair: 'Powell', rateBefore: 0.125, rateAfter: 0.375, direction: 'hike', bps: 25, note: 'First hike. Inflation at 7.9%. Way behind.', season: 'summer', phase: 'late' },
  { date: '2022-05-04', chair: 'Powell', rateBefore: 0.375, rateAfter: 0.875, direction: 'hike', bps: 50, note: '50bp. Fastest pace in 22 years.', season: 'autumn', phase: 'early' },
  { date: '2022-06-15', chair: 'Powell', rateBefore: 0.875, rateAfter: 1.625, direction: 'hike', bps: 75, note: '75bp. CPI at 8.6%. Largest hike since 1994.', season: 'autumn', phase: 'early' },
  { date: '2022-07-27', chair: 'Powell', rateBefore: 1.625, rateAfter: 2.375, direction: 'hike', bps: 75, note: '75bp again', season: 'autumn', phase: 'early' },
  { date: '2022-09-21', chair: 'Powell', rateBefore: 2.375, rateAfter: 3.125, direction: 'hike', bps: 75, note: '75bp third consecutive', season: 'autumn', phase: 'early' },
  { date: '2022-11-02', chair: 'Powell', rateBefore: 3.125, rateAfter: 3.875, direction: 'hike', bps: 75, note: '75bp fourth consecutive. Pivot talk begins.', season: 'autumn', phase: 'late' },
  { date: '2022-12-14', chair: 'Powell', rateBefore: 3.875, rateAfter: 4.375, direction: 'hike', bps: 50, note: '50bp step down begins', season: 'autumn', phase: 'late' },
  { date: '2023-02-01', chair: 'Powell', rateBefore: 4.375, rateAfter: 4.625, direction: 'hike', bps: 25, note: '25bp. "Disinflation" word used.', season: 'autumn', phase: 'late' },
  { date: '2023-03-22', chair: 'Powell', rateBefore: 4.625, rateAfter: 4.875, direction: 'hike', bps: 25, note: '25bp. Banking crisis (SVB/First Republic) concurrent.', season: 'autumn', phase: 'late' },
  { date: '2023-05-03', chair: 'Powell', rateBefore: 4.875, rateAfter: 5.125, direction: 'hike', bps: 25, note: '25bp. May be last hike.', season: 'autumn', phase: 'late' },
  { date: '2023-07-26', chair: 'Powell', rateBefore: 5.125, rateAfter: 5.375, direction: 'hike', bps: 25, note: 'Final hike — 5.25-5.50%. Economy still strong.', season: 'autumn', phase: 'late' },

  // === 2023-2024: Hold for 14 months ===
  { date: '2023-09-20', chair: 'Powell', rateBefore: 5.375, rateAfter: 5.375, direction: 'hold', note: 'Hold. "Higher for longer" era begins.', season: 'autumn', phase: 'late' },
  { date: '2023-11-01', chair: 'Powell', rateBefore: 5.375, rateAfter: 5.375, direction: 'hold', note: 'Hold.', season: 'winter', phase: 'early' },
  { date: '2023-12-13', chair: 'Powell', rateBefore: 5.375, rateAfter: 5.375, direction: 'hold', note: 'Hold. Dot plot shows 3 cuts in 2024.', season: 'winter', phase: 'early' },
  { date: '2024-01-31', chair: 'Powell', rateBefore: 5.375, rateAfter: 5.375, direction: 'hold', note: 'Hold. Services inflation sticky.', season: 'winter', phase: 'early' },
  { date: '2024-03-20', chair: 'Powell', rateBefore: 5.375, rateAfter: 5.375, direction: 'hold', note: 'Hold.', season: 'winter', phase: 'early' },
  { date: '2024-05-01', chair: 'Powell', rateBefore: 5.375, rateAfter: 5.375, direction: 'hold', note: 'Hold.', season: 'winter', phase: 'early' },
  { date: '2024-06-12', chair: 'Powell', rateBefore: 5.375, rateAfter: 5.375, direction: 'hold', note: 'Hold. Dot plot revised to 1 cut.', season: 'winter', phase: 'early' },
  { date: '2024-07-31', chair: 'Powell', rateBefore: 5.375, rateAfter: 5.375, direction: 'hold', note: 'Hold. Pivot signals strengthening.', season: 'winter', phase: 'late' },

  // === 2025: Cuts ===
  { date: '2025-09-17', chair: 'Powell', rateBefore: 5.375, rateAfter: 4.125, direction: 'cut', bps: 25, note: '1st cut. "Recalibration" language.', season: 'spring', phase: 'early' },
  { date: '2025-10-29', chair: 'Powell', rateBefore: 4.125, rateAfter: 3.875, direction: 'cut', bps: 25, note: '2nd cut of cycle.', season: 'spring', phase: 'early' },
  { date: '2025-12-10', chair: 'Powell', rateBefore: 3.875, rateAfter: 3.625, direction: 'cut', bps: 25, note: '3rd cut. Dot plot shows 2 more in 2026.', season: 'spring', phase: 'early' },

  // === 2026: Hold ===
  { date: '2026-01-28', chair: 'Powell', rateBefore: 3.625, rateAfter: 3.625, direction: 'hold', note: 'Hold. Watching inflation + labor data.', season: 'spring', phase: 'early' },
];

export function getRateHistory(): RateDecision[] {
  return rateHistory;
}

export function getHistoryStats() {
  const cuts = rateHistory.filter(d => d.direction === 'cut').length;
  const hikes = rateHistory.filter(d => d.direction === 'hike').length;
  const holds = rateHistory.filter(d => d.direction === 'hold').length;
  return {
    totalCuts: cuts,
    totalHikes: hikes,
    totalHolds: holds,
    avgCycleLengthMonths: 24, // approximate
  };
}
