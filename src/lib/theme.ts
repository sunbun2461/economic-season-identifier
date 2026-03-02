import type { ThemePalette, Season, Phase } from '../types.js';

export const SEASON_PALETTES: Record<Season, ThemePalette> = {
  spring: {
    season: 'spring',
    primary: '#22c55e',
    early: '#86efac',
    late: '#16a34a',
    bg: '#f0fdf4',
    bgDark: '#dcfce7',
    emoji: '🌱',
    label: 'Spring',
  },
  summer: {
    season: 'summer',
    primary: '#eab308',
    early: '#fde047',
    late: '#ca8a04',
    bg: '#fefce8',
    bgDark: '#fef9c3',
    emoji: '☀️',
    label: 'Summer',
  },
  autumn: {
    season: 'autumn',
    primary: '#f97316',
    early: '#fdba74',
    late: '#ea580c',
    bg: '#fff7ed',
    bgDark: '#ffedd5',
    emoji: '🍂',
    label: 'Autumn',
  },
  winter: {
    season: 'winter',
    primary: '#3b82f6',
    early: '#93c5fd',
    late: '#2563eb',
    bg: '#eff6ff',
    bgDark: '#dbeafe',
    emoji: '❄️',
    label: 'Winter',
  },
};

export const ALL_PHASES: Array<{ season: Season; phase: Phase; label: string; emoji: string }> = [
  { season: 'spring', phase: 'early', label: 'Early Spring', emoji: '🌱' },
  { season: 'spring', phase: 'late', label: 'Late Spring', emoji: '🌱' },
  { season: 'summer', phase: 'early', label: 'Early Summer', emoji: '☀️' },
  { season: 'summer', phase: 'late', label: 'Late Summer', emoji: '☀️' },
  { season: 'autumn', phase: 'early', label: 'Early Autumn', emoji: '🍂' },
  { season: 'autumn', phase: 'late', label: 'Late Autumn', emoji: '🍂' },
  { season: 'winter', phase: 'early', label: 'Early Winter', emoji: '❄️' },
  { season: 'winter', phase: 'late', label: 'Late Winter', emoji: '❄️' },
];

export function getPalette(season: Season): ThemePalette {
  return SEASON_PALETTES[season];
}

export function getPhaseColor(season: Season, phase: Phase): string {
  const p = SEASON_PALETTES[season];
  return phase === 'early' ? p.early : p.late;
}

export function getSeasonEmoji(season: Season): string {
  return SEASON_PALETTES[season].emoji;
}
