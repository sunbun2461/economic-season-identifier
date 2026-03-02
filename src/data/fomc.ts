import type { FomcMeeting } from '../types.js';

const today = new Date();

function isPast(endDate: string): boolean {
  return new Date(endDate) < today;
}

function isNextMeeting(meetings: Omit<FomcMeeting, 'isPast' | 'isNext'>[]): number {
  for (let i = 0; i < meetings.length; i++) {
    if (new Date(meetings[i].endDate) >= today) return i;
  }
  return -1;
}

const rawMeetings: Omit<FomcMeeting, 'isPast' | 'isNext'>[] = [
  // 2025 meetings (all past)
  {
    startDate: '2025-01-28',
    endDate: '2025-01-29',
    hasSEP: false,
    result: 'held 4.25-4.50%',
    rateBefore: 4.375,
    rateAfter: 4.375,
    direction: 'hold',
  },
  {
    startDate: '2025-03-18',
    endDate: '2025-03-19',
    hasSEP: true,
    result: 'held 4.25-4.50%',
    rateBefore: 4.375,
    rateAfter: 4.375,
    direction: 'hold',
  },
  {
    startDate: '2025-05-06',
    endDate: '2025-05-07',
    hasSEP: false,
    result: 'held 4.25-4.50%',
    rateBefore: 4.375,
    rateAfter: 4.375,
    direction: 'hold',
  },
  {
    startDate: '2025-06-17',
    endDate: '2025-06-18',
    hasSEP: true,
    result: 'held 4.25-4.50%',
    rateBefore: 4.375,
    rateAfter: 4.375,
    direction: 'hold',
  },
  {
    startDate: '2025-07-29',
    endDate: '2025-07-30',
    hasSEP: false,
    result: 'held 4.25-4.50%',
    rateBefore: 4.375,
    rateAfter: 4.375,
    direction: 'hold',
  },
  {
    startDate: '2025-09-16',
    endDate: '2025-09-17',
    hasSEP: true,
    result: 'cut 25bp → 4.00-4.25%',
    rateBefore: 4.375,
    rateAfter: 4.125,
    direction: 'cut',
  },
  {
    startDate: '2025-10-28',
    endDate: '2025-10-29',
    hasSEP: false,
    result: 'cut 25bp → 3.75-4.00%',
    rateBefore: 4.125,
    rateAfter: 3.875,
    direction: 'cut',
  },
  {
    startDate: '2025-12-09',
    endDate: '2025-12-10',
    hasSEP: true,
    result: 'cut 25bp → 3.50-3.75%',
    rateBefore: 3.875,
    rateAfter: 3.625,
    direction: 'cut',
  },

  // 2026 meetings
  {
    startDate: '2026-01-27',
    endDate: '2026-01-28',
    hasSEP: false,
    result: 'held 3.50-3.75%',
    rateBefore: 3.625,
    rateAfter: 3.625,
    direction: 'hold',
  },
  {
    startDate: '2026-03-17',
    endDate: '2026-03-18',
    hasSEP: true,
    direction: 'hold',
  },
  {
    startDate: '2026-05-05',
    endDate: '2026-05-06',
    hasSEP: false,
    direction: 'hold',
  },
  {
    startDate: '2026-06-16',
    endDate: '2026-06-17',
    hasSEP: true,
    direction: 'hold',
  },
  {
    startDate: '2026-07-28',
    endDate: '2026-07-29',
    hasSEP: false,
    direction: 'hold',
  },
  {
    startDate: '2026-09-15',
    endDate: '2026-09-16',
    hasSEP: true,
    direction: 'hold',
  },
  {
    startDate: '2026-10-27',
    endDate: '2026-10-28',
    hasSEP: false,
    direction: 'hold',
  },
  {
    startDate: '2026-12-08',
    endDate: '2026-12-09',
    hasSEP: true,
    direction: 'hold',
  },
];

const nextIdx = isNextMeeting(rawMeetings);

export const fomcMeetings: FomcMeeting[] = rawMeetings.map((m, i) => ({
  ...m,
  isPast: isPast(m.endDate),
  isNext: i === nextIdx,
}));

export function getNextMeeting(): FomcMeeting | undefined {
  return fomcMeetings.find(m => m.isNext);
}

export function getDaysUntilNext(): number {
  const next = getNextMeeting();
  if (!next) return -1;
  const diff = new Date(next.startDate).getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
